/**
 * Paso 1 del pago (Peticion a Mercado Pago para obtener un token de tarjeta).
 * - Mastercard aprobada: 5254133674403564, CVV 123, 11/2030, titular APRO, CC 123456789
 */

const MP_CARD_TOKENS_URL = 'https://api.mercadopago.com/v1/card_tokens';

function publicKey(): string {
  const key = process.env.EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  if (!key) {
    throw new Error(
      'Falta EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY en .env (Public Key TEST de Mercado Pago).',
    );
  }
  return key;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

// Deduce el método según el BIN de la tarjeta
export function inferirPaymentMethodId(cardNumber: string): string {
  const bin = digitsOnly(cardNumber).slice(0, 6);
  if (bin.startsWith('4')) return 'visa';
  if (bin.startsWith('34') || bin.startsWith('37')) return 'amex';
  if (bin.startsWith('5')) return 'master';
  return 'master';
}

export type TarjetaPruebaPerfil = 'aprobada' | 'rechazada';

// Tarjetas oficiales de prueba Mercado Pago (Colombia)
export const TARJETAS_PRUEBA_MP = {
  aprobada: {
    cardNumber: '5254133674403564',
    cardholderName: 'APRO',
    paymentMethodId: 'master' as const,
    securityCode: '123',
    expirationMonth: 11,
    expirationYear: 2030,
    identificationType: 'CC',
    identificationNumber: '123456789',
  },
  rechazada: {
    cardNumber: '4774550017732020',
    cardholderName: 'OTHE',
    paymentMethodId: 'visa' as const,
    securityCode: '123',
    expirationMonth: 11,
    expirationYear: 2030,
    identificationType: 'CC',
    identificationNumber: '123456789',
  },
} as const;

export type TokenTarjetaResult = {
  token: string;
  payment_method_id: string;
};

export type CrearTokenTarjetaInput = {
  perfil?: TarjetaPruebaPerfil;
  cardNumber?: string;
  cardholderName?: string;
  securityCode?: string;
  expirationMonth?: number;
  expirationYear?: number;
  identificationNumber?: string;
};

// POST https://api.mercadopago.com/v1/card_tokens?public_key=TEST-...
export async function crearTokenTarjetaMercadoPago(
  input: CrearTokenTarjetaInput = {},
): Promise<TokenTarjetaResult> {
  const perfil = input.perfil ?? 'aprobada';
  const base = TARJETAS_PRUEBA_MP[perfil];

  const cardNumber = digitsOnly(input.cardNumber ?? base.cardNumber);
  const cardholderName = (input.cardholderName ?? base.cardholderName).trim();

  const url = `${MP_CARD_TOKENS_URL}?public_key=${encodeURIComponent(publicKey())}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      card_number: cardNumber,
      security_code: input.securityCode ?? base.securityCode,
      expiration_month: input.expirationMonth ?? base.expirationMonth,
      expiration_year: input.expirationYear ?? base.expirationYear,
      cardholder: {
        name: cardholderName,
        identification: {
          type: base.identificationType,
          number: input.identificationNumber ?? base.identificationNumber,
        },
      },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      detail = j.message ?? text;
    } catch {
    }
    throw new Error(`Mercado Pago no pudo tokenizar la tarjeta: ${detail}`);
  }

  const data = JSON.parse(text) as {
    id?: string;
    payment_method_id?: string;
    payment_method?: { id?: string };
  };
  if (!data.id) {
    throw new Error('Mercado Pago no devolvió el id del token de tarjeta.');
  }

  const payment_method_id =
    data.payment_method?.id ??
    data.payment_method_id ??
    inferirPaymentMethodId(cardNumber) ??
    base.paymentMethodId;

  return {
    token: data.id,
    payment_method_id,
  };
}

export const crearTokenTarjetaPrueba = crearTokenTarjetaMercadoPago;

export function tienePublicKeyMercadoPago(): boolean {
  const key = process.env.EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  return Boolean(key);
}
