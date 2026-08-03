const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhxTdq9jqSsM6L_Dts1XwW71CBTApTxNjHxkLFANS3xeTMDMCEX_8yoc4XXj-jNK4/exec';

let _productCache = null;
let _cacheTimestamp = 0;

async function fetchProducts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _productCache && (now - _cacheTimestamp < 120000)) {
    return _productCache;
  }
  try {
    const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
    const data = await res.json();
    _productCache = data.map(p => {
      p.status = p.status || p[''] || p['col_8'] || 'in_stock';
      return p;
    });
    _cacheTimestamp = now;
    return _productCache;
  } catch(e) {
    return _productCache || [];
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
    _productCache = null;
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
