  // Simulación local de Mercado Pago (sin SDK ni llamadas reales).

export type MercadoPagoSandboxMethod = 'card' | 'pse' | 'account_money';

export type MercadoPagoSandboxResult =
  | {
      status: 'approved';
      id: string;
      status_detail: 'accredited';
      payment_method_id: string;
      transaction_amount: number;
    }
  | {
      status: 'rejected';
      status_detail: 'cc_rejected_insufficient_amount' | 'cc_rejected_bad_filled_security_code';
      message: string;
    };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function randomPaymentId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Simula el procesamiento de un pago (1.5–2.5 s).
export async function simulateMercadoPagoPayment(params: {
  amount: number;
  method: MercadoPagoSandboxMethod;
  payerEmail?: string;
  outcome?: 'approved' | 'rejected';
}): Promise<MercadoPagoSandboxResult> {
  const waitMs = 1500 + Math.floor(Math.random() * 1000);
  await delay(waitMs);

  const outcome = params.outcome ?? 'approved';
  const methodId =
    params.method === 'card' ? 'visa' : params.method === 'pse' ? 'pse' : 'account_money';

  if (outcome === 'rejected') {
    return {
      status: 'rejected',
      status_detail: 'cc_rejected_insufficient_amount',
      message: 'Tu tarjeta no tiene fondos suficientes (simulación).',
    };
  }

  return {
    status: 'approved',
    id: randomPaymentId(),
    status_detail: 'accredited',
    payment_method_id: methodId,
    transaction_amount: params.amount,
  };
}

export const MP_SANDBOX_LABELS: Record<MercadoPagoSandboxMethod, string> = {
  card: 'Tarjeta de crédito o débito',
  pse: 'PSE',
  account_money: 'Dinero en cuenta',
};
