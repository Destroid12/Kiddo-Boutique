const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhxTdq9jqSsM6L_Dts1XwW71CBTApTxNjHxkLFANS3xeTMDMCEX_8yoc4XXj-jNK4/exec';

async function fetchProducts() {
  try {
    const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
    const data = await res.json();
    return data.map(p => {
      p.status = p.status || p[''] || p['col_8'] || 'in_stock';
      return p;
    });
  } catch(e) {
    return [];
  }
}

async function fetchProductById(id) {
  const products = await fetchProducts();
  return products.find(p => String(p.id) === String(id));
}

async function submitOrder(orderData) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch(e) {
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
    return { success: false, error: e.toString() };
  }
}
