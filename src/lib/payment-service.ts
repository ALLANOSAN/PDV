// src/lib/payment-service.ts

export type Provider = 'cielo' | 'mercado_pago' | 'sumup';

/**
 * Interface padronizada para as APIs de POS.
 * Cada provedor tem um payload específico conforme a documentação técnica.
 */
export const PaymentService = {
  getPayload: (provider: Provider, amount: number, terminalId: string, extras?: any) => {
    switch (provider) {
      case 'mercado_pago':
        // https://www.mercadopago.com.br/developers/pt/docs/point-sdk
        return {
          payment_method_id: 'point',
          transaction_amount: amount,
          description: `Venda ${terminalId}`,
          device_id: terminalId,
          ...extras
        };

      case 'sumup':
        // https://developer.sumup.com/online-payments/sdks
        return {
          checkout_amount: amount,
          checkout_currency: 'BRL',
          checkout_reference: terminalId,
          ...extras
        };

      case 'cielo':
        // https://developercielo.github.io/manual/cielo-lio
        return {
          OrderNumber: terminalId,
          SoftDescriptor: 'PDV_PRO',
          Cart: {
            Items: [{ Name: 'Item PDV', Quantity: 1, Price: amount * 100 }]
          },
          ...extras
        };

      default:
        throw new Error('Provedor não implementado');
    }
  }
};
