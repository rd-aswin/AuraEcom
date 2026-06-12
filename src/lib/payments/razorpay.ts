import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentGateway, CreateOrderParams, PaymentOrder, PaymentVerificationParams } from './types';

export class RazorpayAdapter implements PaymentGateway {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    // Razorpay expects amounts in minor currency units (e.g., 1 INR = 100 paisa, 1 USD = 100 cents)
    const amountInMinorUnits = Math.round(params.amount * 100);

    const options = {
      amount: amountInMinorUnits,
      currency: params.currency,
      receipt: params.receiptId,
    };

    const order = await this.razorpay.orders.create(options);

    return {
      id: order.id,
      amount: Number(order.amount) / 100, // return in standard decimal units
      currency: order.currency as string,
      gateway: 'razorpay',
    };
  }

  verifyPayment(params: PaymentVerificationParams): boolean {
    const { paymentId, orderId, signature } = params;
    
    // Razorpay signature verification logic:
    // HMAC-SHA256 of "order_id|payment_id" with key_secret
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }
}
