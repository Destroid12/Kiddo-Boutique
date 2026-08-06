export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;
  if (!order) {
    return res.status(400).json({ error: 'Missing order data' });
  }

  const customerName = order.customer_name || order.name || 'عميل';
  const customerPhone = order.phone || '';
  const customerAddress = order.address || '';
  const paymentMethod = order.payment_method || order.payment || 'نقداً';
  const totalAmount = order.total || 0;
  const orderId = order.id || `ord_${Date.now()}`;

  const itemsList = Array.isArray(order.items) 
    ? order.items.map(it => `• ${it.quantity || 1}x ${it.title} (تفاصيل: ${it.size || 'عادي'}) - ${it.price} ج.م`).join('\n')
    : String(order.items || '');

  const itemsHtml = Array.isArray(order.items)
    ? order.items.map(it => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 8px;">${it.title}</td>
          <td style="padding: 10px 8px; text-align: center;">${it.size || 'عادي'}</td>
          <td style="padding: 10px 8px; text-align: center;">${it.quantity || 1}</td>
          <td style="padding: 10px 8px; text-align: left; font-weight: bold;">${it.price} ج.م</td>
        </tr>
      `).join('')
    : `<tr><td colspan="4" style="padding:10px;">${itemsList}</td></tr>`;

  const results = { email: null, telegram: null };

  // 1. Resend Transactional Email (Clean HTML, Zero Sponsors)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const emailHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #faf8f5; padding: 24px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eae6e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background-color: #7E7AE0; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 1.4rem;">Kiddo Boutique</h1>
              <p style="margin: 5px 0 0; font-size: 0.95rem;">طلب شراء جديد #${orderId}</p>
            </div>
            <div style="padding: 24px;">
              <h3 style="color: #2c2c2c; margin-top: 0; border-bottom: 2px solid #7E7AE0; padding-bottom: 6px;">بيانات العميل</h3>
              <p style="margin: 6px 0;"><strong>الاسم:</strong> ${customerName}</p>
              <p style="margin: 6px 0;"><strong>الهاتف:</strong> <a href="tel:${customerPhone}" style="color: #7E7AE0; text-decoration: none;">${customerPhone}</a></p>
              <p style="margin: 6px 0;"><strong>العنوان:</strong> ${customerAddress}</p>
              <p style="margin: 6px 0;"><strong>طريقة الدفع:</strong> ${paymentMethod}</p>

              <h3 style="color: #2c2c2c; margin-top: 24px; border-bottom: 2px solid #7E7AE0; padding-bottom: 6px;">المنتجات المطلوبة</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.95rem;">
                <thead>
                  <tr style="background: #faf8f5; color: #555;">
                    <th style="padding: 8px; text-align: right;">المنتج</th>
                    <th style="padding: 8px; text-align: center;">التفاصيل</th>
                    <th style="padding: 8px; text-align: center;">الكمية</th>
                    <th style="padding: 8px; text-align: left;">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px; padding: 14px; background: #faf8f5; border-radius: 8px; text-align: left; font-size: 1.1rem;">
                <strong>المبلغ الإجمالي: <span style="color: #7E7AE0;">${totalAmount} ج.م</span></strong>
              </div>
            </div>
            <div style="background: #faf8f5; padding: 12px 24px; text-align: center; font-size: 0.8rem; color: #888; border-top: 1px solid #eae6e1;">
              © ${new Date().getFullYear()} Kiddo Boutique - نظام الطلبات المباشر
            </div>
          </div>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Kiddo Boutique <onboarding@resend.dev>',
          to: ['kiddo.boutique0@gmail.com'],
          subject: `طلب شراء جديد #${orderId} - ${customerName}`,
          html: emailHtml
        })
      });
      results.email = await resendRes.json();
    } catch (e) {
      results.email = { error: e.message };
    }
  }

  // 2. Telegram Instant Notifications (Free, No Sponsors)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      const tgText = `🛍️ *طلب شراء جديد - Kiddo Boutique*\n\n` +
        `*رقم الطلب:* \`${orderId}\`\n` +
        `*الاسم:* ${customerName}\n` +
        `*الهاتف:* ${customerPhone}\n` +
        `*طريقة الدفع:* ${paymentMethod}\n` +
        `*العنوان:* ${customerAddress}\n\n` +
        `*المنتجات:*\n${itemsList}\n\n` +
        `*الإجمالي:* ${totalAmount} ج.م`;

      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: tgText,
          parse_mode: 'Markdown'
        })
      });
      results.telegram = await tgRes.json();
    } catch (e) {
      results.telegram = { error: e.message };
    }
  }

  return res.status(200).json({ success: true, results });
}
