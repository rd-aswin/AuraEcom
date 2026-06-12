import { PaymentGateway } from './types';
import { RazorpayAdapter } from './razorpay';
// Future Paytm adapter import will be added here

export function getPaymentGateway(): PaymentGateway {
  const provider = process.env.PAYMENT_PROVIDER || 'razorpay';

  switch (provider) {
    case 'razorpay':
      return new RazorpayAdapter();
    // Case 'paytm' will go here when implemented in Phase 6
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
