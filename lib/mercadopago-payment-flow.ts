import { logApiError, logApiOk } from '@/lib/api-log';
import { FlujoPagoError, mensajeFlujoPago } from '@/lib/flujo-pago-error';
import { ApiHttpError } from '@/lib/api-fetch';
import {
  crearPagoReserva,
  pagoMercadoPagoAprobado,
  procesarPagoMercadoPagoDirecto,
} from '@/lib/pagos-api';
import {
  crearTokenTarjetaMercadoPago,
  type TarjetaPruebaPerfil,
} from '@/lib/mercadopago-token';
import { fechaFinReservaDesdeHoras, type MetodoPagoReservaUi } from '@/constants/reserva-tarifa';
import { crearReserva, montoPagoDesdeReserva, type ReservaApi } from '@/lib/reservas-api';
import { esVehiculoYaRegistrado, registrarVehiculoConductor } from '@/lib/users-api';

export type { MetodoPagoReservaUi } from '@/constants/reserva-tarifa';

export type PagoReservaExitoso = {
  reservaId: number;
  metodoPago: MetodoPagoReservaUi;
  horasEstacionamiento: number;
  pagoId?: number;
  mpTransactionId: string;
  statusDetail: string;
  monto: number;
  cardTokenId: string;
};

export type CrearReservaConductorParams = {
  idConductor: string;
  documentoConductor?: string;
  idZona: number;
  placa: string;
  horasEstacionamiento: number;
  fechaFin?: string;
};

export async function crearReservaParaConductor(
  params: CrearReservaConductorParams,
): Promise<ReservaApi> {
  const fechaFin =
    params.fechaFin ?? fechaFinReservaDesdeHoras(params.horasEstacionamiento);
  const placa = params.placa.trim().toUpperCase();

  if (params.documentoConductor?.trim()) {
    try {
      await registrarVehiculoConductor(params.documentoConductor, { placa });
      logApiOk('POST /users/:documento/vehiculo OK', { placa });
    } catch (err) {
      if (!esVehiculoYaRegistrado(err)) {
        logApiError('POST /users/:documento/vehiculo', err, { placa });
        const detalle = mensajeFlujoPago('POST /reservas', err).replace(/^POST \/reservas:\s*/i, '');
        throw new FlujoPagoError('POST /reservas', `No se pudo registrar el vehículo: ${detalle}`);
      }
      logApiOk('vehículo ya registrado', { placa });
    }
  }

  try {
    const reserva = await crearReserva({
      id_conductor: params.idConductor,
      id_zona: params.idZona,
      id_vehiculo: placa,
      fecha_fin: fechaFin,
    });
    logApiOk('POST /reservas OK', {
      reservaId: reserva.id,
      zona: params.idZona,
      precio: reserva.precio,
    });
    return reserva;
  } catch (err) {
    logApiError('POST /reservas', err, {
      id_conductor: params.idConductor,
      id_zona: params.idZona,
      id_vehiculo: placa,
      fecha_fin: fechaFin,
    });
    const msg = mensajeFlujoPago('POST /reservas', err);
    if (msg.includes('vehiculo') || msg.includes('vehículo') || msg.includes('23503')) {
      throw new FlujoPagoError(
        'POST /reservas',
        `${msg}\n\nRegistra la placa en tu perfil antes de reservar.`,
      );
    }
    throw new FlujoPagoError('POST /reservas', msg);
  }
}

export type EjecutarPagoReservaParams = {
  idConductor: string;
  documentoConductor?: string;
  idZona: number;
  placa: string;
  horasEstacionamiento: number;
  fechaFin?: string;
  pagoHorasEnEfectivoEnZona?: boolean;
  montoCop?: number;
  payerEmail: string;
  outcome: 'approved' | 'rejected';
  cardNumber?: string;
  cardholderName?: string;
  securityCode?: string;
  expirationMonth?: number;
  expirationYear?: number;
  identificationNumber?: string;
};

// Flujo de reserva + pago
export async function ejecutarPagoReserva(
  params: EjecutarPagoReservaParams,
): Promise<PagoReservaExitoso> {
  const perfil: TarjetaPruebaPerfil = params.outcome === 'approved' ? 'aprobada' : 'rechazada';
  const placa = params.placa.trim().toUpperCase();

  const reserva = await crearReservaParaConductor({
    idConductor: params.idConductor,
    documentoConductor: params.documentoConductor,
    idZona: params.idZona,
    placa,
    horasEstacionamiento: params.horasEstacionamiento,
    fechaFin: params.fechaFin,
  });

  let cardToken: string;
  let payment_method_id: string;
  try {
    const tokenResult = await crearTokenTarjetaMercadoPago({
      perfil,
      cardNumber: params.cardNumber,
      cardholderName: params.cardholderName,
      securityCode: params.securityCode,
      expirationMonth: params.expirationMonth,
      expirationYear: params.expirationYear,
      identificationNumber: params.identificationNumber,
    });
    cardToken = tokenResult.token;
    payment_method_id = tokenResult.payment_method_id;
    logApiOk('Mercado Pago card_tokens OK', {
      payment_method_id,
      tokenPreview: `${cardToken.slice(0, 8)}…`,
    });
  } catch (err) {
    logApiError('Mercado Pago card_tokens', err, { perfil });
    throw new FlujoPagoError('Mercado Pago card_tokens', mensajeFlujoPago('Mercado Pago card_tokens', err));
  }

  const monto = montoPagoDesdeReserva(reserva);
  const datosPago = {
    transaction_amount: monto,
    token: cardToken,
    installments: 1,
    payment_method_id,
    payer: { email: params.payerEmail },
  };

  try {
    const resultado = await crearPagoReserva({
      idReserva: reserva.id,
      datosPago,
    });
    logApiOk('POST /pagos OK', {
      reservaId: reserva.id,
      monto,
      payment_method_id,
      mpStatus: resultado.mercadopago?.status,
      mpId: resultado.mercadopago?.id,
    });

    const mpStatus = resultado.mercadopago?.status;
    if (!pagoMercadoPagoAprobado(mpStatus)) {
      const detail = String(resultado.mercadopago?.status_detail ?? 'rechazado');
      throw new Error(`Pago rechazado por Mercado Pago (${detail}).`);
    }

    const metodoPago: MetodoPagoReservaUi = params.pagoHorasEnEfectivoEnZona
      ? 'efectivo_zona'
      : 'mercadopago';
    const horasReportadas = params.pagoHorasEnEfectivoEnZona
      ? 0
      : params.horasEstacionamiento;

    return {
      reservaId: reserva.id,
      metodoPago,
      horasEstacionamiento: horasReportadas,
      pagoId: resultado.pago?.id,
      mpTransactionId: String(
        resultado.mercadopago?.id ?? resultado.pago?.mp_id_transaccion ?? '',
      ),
      statusDetail: String(resultado.mercadopago?.status_detail ?? 'accredited'),
      monto,
      cardTokenId: cardToken,
    };
  } catch (err) {
    logApiError('POST /pagos', err, {
      idReserva: reserva.id,
      monto,
      precioReserva: reserva.precio,
      payment_method_id,
      payerEmail: params.payerEmail,
    });

    if (err instanceof ApiHttpError && err.status >= 500) {
      try {
        const directo = await procesarPagoMercadoPagoDirecto(datosPago);
        logApiOk('POST /mercadopago/procesar-pago (fallback) OK', {
          reservaId: reserva.id,
          monto,
          mpStatus: directo.status,
          mpId: directo.id,
        });
        if (pagoMercadoPagoAprobado(directo.status)) {
          const metodoPago: MetodoPagoReservaUi = params.pagoHorasEnEfectivoEnZona
            ? 'efectivo_zona'
            : 'mercadopago';
          const horasReportadas = params.pagoHorasEnEfectivoEnZona
            ? 0
            : params.horasEstacionamiento;
          return {
            reservaId: reserva.id,
            metodoPago,
            horasEstacionamiento: horasReportadas,
            mpTransactionId: String(directo.id),
            statusDetail: String(directo.status_detail ?? 'accredited'),
            monto,
            cardTokenId: cardToken,
          };
        }
        throw new Error(
          `Pago rechazado por Mercado Pago (${String(directo.status_detail ?? directo.status)}).`,
        );
      } catch (fallbackErr) {
        logApiError('POST /mercadopago/procesar-pago (fallback)', fallbackErr, {
          reservaId: reserva.id,
          monto,
        });
      }
    }

    throw new FlujoPagoError('POST /pagos', mensajeFlujoPago('POST /pagos', err));
  }
}
