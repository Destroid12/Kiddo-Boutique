const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySA-TU9jnVFQYDeku6mWhTtEQAETXnCEs3rXq0hLy4xOptY9zHXiCgDtnc54B_zh2M/exec';

async function fetchProducts() {
  try {
    const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
    const data = await res.json();
    return data.map(p => {
      p.status = p.status || p[''] || p['col_8'] || 'in_stock';
      return p;
    });
  } catch(e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

async function fetchProductById(id) {
  const products = await fetchProducts();
  return products.find(p => String(p.id) === String(id));
}

async function submitOrder(orderData) {
  console.log('Sending order to Google Sheets:', orderData);
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch(e) {
    console.error("Error submitting order:", e);
    return { success: false };
  }
}

async function adminAction(action, payloadData, password) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        admin_action: action,
        password: password,
        payload: payloadData
      })
    });
    return await res.json();
  } catch(e) {
    console.error("Admin action failed:", e);
    return { success: false, error: e.toString() };
  }
}
