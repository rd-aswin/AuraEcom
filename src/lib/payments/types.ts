export interface CreateOrderParams {
  amount: number; // Amount in rupees/dollars (we will convert to paisa inside the Razorpay adapter)
  currency: string;
  receiptId: string;
}

export interface PaymentOrder {
  id: string; // The gateway's order ID (e.g. order_XYZ)
  amount: number; // The amount returned by the gateway
  currency: string;
  gateway: 'razorpay' | 'paytm';
}

export interface PaymentVerificationParams {
  paymentId: string;
  orderId: string;
  signature: string;
  rawBody?: string; // Some gateways require raw body for verification
}

export interface PaymentGateway {
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: PaymentVerificationParams): boolean;
}
