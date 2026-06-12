interface EmailItem {
  title: string;
  quantity: number;
  price: number;
}

export async function sendOrderEmail(
  toEmail: string,
  toName: string,
  orderId: string,
  totalAmount: number,
  items: EmailItem[]
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@aura-store.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Aura Organic Store';

  if (!apiKey || apiKey.includes('your-')) {
    console.warn('--- Brevo SMTP Sandbox Log ---');
    console.warn(`Simulating email dispatch to: ${toName} <${toEmail}>`);
    console.warn(`Order Reference: #${orderId} | Total Charged: ₹${totalAmount.toFixed(2)}`);
    console.warn('Items details:');
    items.forEach((it) => console.warn(`  - ${it.title} x${it.quantity} @ ₹${it.price.toFixed(2)}`));
    console.warn('------------------------------');
    return { success: true, simulated: true };
  }

  const itemsHtml = items
    .map(
      (item) =>
        `<li style="margin-bottom: 8px;"><strong>${item.title}</strong> x ${item.quantity} - <span style="font-family: serif; color: #C88E72;">₹${(item.price * item.quantity).toFixed(2)}</span></li>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E5DFD7; border-radius: 16px; background-color: #FAF9F6;">
      <h2 style="color: #1E352C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 20px; border-bottom: 1px solid #E5DFD7; padding-bottom: 16px;">Aura Order Confirmed</h2>
      <p style="color: #3D4B43; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Dear ${toName},</p>
      <p style="color: #3D4B43; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Thank you for your order. We have successfully verified your payment and are preparing your botanical essentials.</p>
      
      <div style="background-color: #FFFFFF; border: 1px solid #E5DFD7; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(28, 42, 34, 0.01);">
        <h4 style="color: #1E352C; margin-top: 0; margin-bottom: 16px; font-family: Georgia, serif; font-size: 16px;">Order ID: #${orderId}</h4>
        <ul style="padding-left: 20px; margin: 0; color: #4E5C53; line-height: 1.6;">
          ${itemsHtml}
        </ul>
        <div style="border-top: 1px solid #E5DFD7; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between; font-weight: bold; color: #1E352C; font-size: 16px;">
          <span>Total Paid</span>
          <span style="font-family: serif; color: #C88E72;">₹${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p style="color: #4E5C53; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">We will send you another update as soon as your parcel is shipped.</p>
      <p style="color: #4E5C53; font-size: 14px; margin: 0;">Warmly,<br /><strong>The Aura Team</strong></p>
    </div>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject: `Your Aura Order Confirmation - #${orderId}`,
        htmlContent: htmlContent,
      }),
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resData.message || 'Failed to dispatch email');
    }
    console.log(`Brevo email dispatched successfully for order #${orderId}. ID: ${resData.messageId}`);
    return { success: true, messageId: resData.messageId };
  } catch (error) {
    console.error('Brevo email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendShippingEmail(
  toEmail: string,
  toName: string,
  orderId: string,
  status: 'shipped' | 'delivered'
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@aura-store.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Aura Organic Store';

  if (!apiKey || apiKey.includes('your-')) {
    console.warn('--- Brevo SMTP Sandbox Log ---');
    console.warn(`Simulating shipping email to: ${toName} <${toEmail}>`);
    console.warn(`Order Reference: #${orderId} | Status: ${status}`);
    console.warn('------------------------------');
    return { success: true, simulated: true };
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #E5DFD7; border-radius: 16px; background-color: #FAF9F6;">
      <h2 style="color: #1E352C; font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 20px; border-bottom: 1px solid #E5DFD7; padding-bottom: 16px;">
        ${status === 'shipped' ? 'Your Aura Order is on its Way!' : 'Your Aura Order has been Delivered!'}
      </h2>
      <p style="color: #3D4B43; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Dear ${toName},</p>
      
      <p style="color: #3D4B43; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        ${status === 'shipped' 
          ? `Great news! We have shipped your parcel for order reference <strong>#${orderId}</strong>. It is now in transit and should arrive shortly.` 
          : `We are pleased to inform you that your order <strong>#${orderId}</strong> has been successfully delivered to your shipping address.`}
      </p>

      <div style="background-color: #FFFFFF; border: 1px solid #E5DFD7; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 0.85rem; color: #4E5C53; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">Order Reference</span>
        <strong style="color: #1E352C; font-size: 18px;">#${orderId}</strong>
        <span style="font-size: 0.85rem; color: #4E5C53; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-top: 16px; margin-bottom: 8px;">Current Status</span>
        <strong style="color: #C88E72; font-size: 16px; text-transform: capitalize;">${status}</strong>
      </div>

      <p style="color: #4E5C53; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">If you have any questions about your package, feel free to reply to this email.</p>
      <p style="color: #4E5C53; font-size: 14px; margin: 0;">Warmly,<br /><strong>The Aura Team</strong></p>
    </div>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject: status === 'shipped' ? `Aura Shipment Update - #${orderId}` : `Aura Order Delivered - #${orderId}`,
        htmlContent: htmlContent,
      }),
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(resData.message || 'Failed to dispatch shipping email');
    }
    return { success: true, messageId: resData.messageId };
  } catch (error) {
    console.error('Brevo shipping email failed:', error);
    return { success: false, error };
  }
}
