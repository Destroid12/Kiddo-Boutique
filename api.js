const CACHE_KEY = 'kiddo_products_cache';
const CACHE_TTL = 300000;

function getCachedProducts() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch(e) {
    return null;
  }
}

function setCachedProducts(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
  } catch(e) {}
}

function bustProductCache() {
  localStorage.removeItem(CACHE_KEY);
}

async function fetchProducts(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedProducts();
    if (cached !== null) return cached;
  }
  
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        const formatted = data.map(p => {
          return {
            id: String(p.id),
            title: p.title,
            category: p.category,
            price: p.price,
            sizes: Array.isArray(p.sizes) ? p.sizes : String(p.sizes || '').split(',').map(s => s.trim()).filter(Boolean),
            image: p.image,
            images: Array.isArray(p.images) ? p.images : (p.images ? String(p.images).split(',').map(s => s.trim()).filter(Boolean) : [p.image]),
            description: p.description,
            status: p.status || 'in_stock'
          };
        });
        setCachedProducts(formatted);
        return formatted;
      }
    } catch (err) {}
  }

  const cached = getCachedProducts();
  return cached || [];
}

async function fetchProductById(id) {
  const products = await fetchProducts();
  return products.find(p => String(p.id) === String(id));
}

async function submitOrder(orderData) {
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (!sb) {
    return { success: false, error: 'Database client not ready' };
  }

  try {
    const newOrder = {
      id: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      customer_name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      payment_method: orderData.payment,
      items: orderData.items,
      total: Number(orderData.total),
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await sb.from('orders').insert([newOrder]);
    if (error) {
      console.error('Order insert error:', error);
      return { success: false, error: error.message };
    }

    // 1. Direct email notification via Google Apps Script (100% reliable, direct to your Gmail)
    const GOOGLE_NOTIFY_URL = 'https://script.google.com/macros/s/AKfycbwhxTdq9jqSsM6L_Dts1XwW71CBTApTxNjHxkLFANS3xeTMDMCEX_8yoc4XXj-jNK4/exec';
    try {
      fetch(GOOGLE_NOTIFY_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).catch(function(e) { console.warn('Google notify error:', e); });
    } catch(gErr) {}

    // 2. Serverless notification API (Resend / Telegram)
    try {
      fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(function() {});
    } catch(emailErr) {}

    if (orderData.payment === 'paymob') {
      try {
        const paymobRes = await fetch('/api/paymob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_payment',
            orderId: newOrder.id,
            amount: Number(orderData.total),
            billingData: {
              name: orderData.name,
              phone: orderData.phone,
              address: orderData.address
            }
          })
        });
        const paymobData = await paymobRes.json();
        if (paymobData.paymentUrl) {
          return { success: true, orderId: newOrder.id, paymentUrl: paymobData.paymentUrl };
        }
      } catch(e) {}
    }

    return { success: true, orderId: newOrder.id };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

async function adminAction(action, payloadData, password) {
  const ADMIN_PASSWORD = 'my_secret_password_123';
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (!sb) {
    return { success: false, error: 'Database connection failed' };
  }

  try {
    bustProductCache();

    if (action === 'get_orders') {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return { success: false, error: error.message };
      return { success: true, orders: data || [] };
    }

    if (action === 'update_order') {
      const { error } = await sb
        .from('orders')
        .update({ status: payloadData.status })
        .eq('id', payloadData.orderId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'delete_order') {
      const { error } = await sb
        .from('orders')
        .delete()
        .eq('id', payloadData.orderId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'add_product') {
      const newId = 'p_' + Date.now();
      const sizesArr = Array.isArray(payloadData.sizes)
        ? payloadData.sizes
        : String(payloadData.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
      const imagesArr = Array.isArray(payloadData.images)
        ? payloadData.images
        : (payloadData.images ? String(payloadData.images).split(',').map(s => s.trim()).filter(Boolean) : [payloadData.image]);
      const priceVal = Array.isArray(payloadData.price) ? payloadData.price.join(', ') : String(payloadData.price || '');
      const { error } = await sb.from('products').insert([{
        id: newId,
        title: payloadData.title,
        category: payloadData.category,
        price: priceVal,
        sizes: sizesArr,
        image: payloadData.image,
        images: imagesArr,
        description: payloadData.description,
        status: 'in_stock',
        created_at: new Date().toISOString()
      }]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'edit_product') {
      const sizesArr = Array.isArray(payloadData.sizes)
        ? payloadData.sizes
        : String(payloadData.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
      const imagesArr = Array.isArray(payloadData.images)
        ? payloadData.images
        : (payloadData.images ? String(payloadData.images).split(',').map(s => s.trim()).filter(Boolean) : [payloadData.image]);
      const priceVal = Array.isArray(payloadData.price) ? payloadData.price.join(', ') : String(payloadData.price || '');
      const updatePayload = {
        title: payloadData.title,
        category: payloadData.category,
        price: priceVal,
        sizes: sizesArr,
        description: payloadData.description
      };
      if (payloadData.image) updatePayload.image = payloadData.image;
      if (payloadData.images && payloadData.images.length > 0) updatePayload.images = imagesArr;

      const { error } = await sb.from('products').update(updatePayload).eq('id', payloadData.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'delete_product') {
      const { error } = await sb
        .from('products')
        .delete()
        .eq('id', payloadData.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (action === 'toggle_stock') {
      const { error } = await sb
        .from('products')
        .update({ status: payloadData.status })
        .eq('id', payloadData.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
