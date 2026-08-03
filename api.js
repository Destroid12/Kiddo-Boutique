const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhxTdq9jqSsM6L_Dts1XwW71CBTApTxNjHxkLFANS3xeTMDMCEX_8yoc4XXj-jNK4/exec';
const CACHE_KEY = 'kiddo_products_cache';
const CACHE_TTL = 120000;

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
    if (cached) return cached;
  }
  try {
    const res = await fetch(SCRIPT_URL, { cache: 'no-store' });
    const data = await res.json();
    const products = data.map(p => {
      p.status = p.status || p[''] || p['col_8'] || 'in_stock';
      return p;
    });
    setCachedProducts(products);
    return products;
  } catch(e) {
    const cached = getCachedProducts();
    return cached || [];
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
    bustProductCache();
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

fetch(SCRIPT_URL, { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    const products = data.map(p => {
      p.status = p.status || p[''] || p['col_8'] || 'in_stock';
      return p;
    });
    setCachedProducts(products);
  })
  .catch(() => {});
