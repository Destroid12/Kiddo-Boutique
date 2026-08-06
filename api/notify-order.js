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

  try {
    const itemsFormatted = Array.isArray(order.items) 
      ? order.items.map(it => `${it.quantity || 1}x ${it.title} (تفاصيل: ${it.size || 'عادي'}) - ${it.price} ج.م`).join('\n')
      : String(order.items || '');

    const emailPayload = {
      _subject: `طلب شراء جديد #${order.id || ''} - Kiddo Boutique`,
      _template: 'table',
      _captcha: 'false',
      'رقم الطلب': order.id,
      'اسم العميل': order.customer_name || order.name,
      'رقم الهاتف': order.phone,
      'العنوان والموقع': order.address,
      'طريقة الدفع': order.payment_method || order.payment,
      'المنتجات المطلوبة': itemsFormatted,
      'المبلغ الإجمالي': `${order.total} ج.م`,
      'التاريخ والوقت': new Date().toLocaleString('ar-EG')
    };

    const response = await fetch('https://formsubmit.co/ajax/kiddo.boutique0@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
