const MOCK_PRODUCTS = [
  { id: '1', category: 'boys', title: 'طقم ولادي كاجوال', price: 350, sizes: ['2Y', '4Y', '6Y', '8Y'], image: 'https://th.bing.com/th/id/OIP.jhj4Vnl4n5Vz7PvELBXQkAHaJ1?w=141&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', description: 'طقم ولادي مريح جداً للصيف مصنوع من القطن الصافي 100%. ألوان ثابتة وتصميم عصري يناسب الخروج.' },
  { id: '2', category: 'boys', title: 'تيشيرت وشورت مريح', price: 280, sizes: ['4Y', '6Y', '8Y'], image: 'https://img.freepik.com/premium-photo/running-park-kids-boys-girls-happy-kids-playing-outside_1279788-4617.jpg', description: 'تيشيرت خفيف بألوان مبهجة وشورت قطني مناسب للعب والحركة السريعة.' },
  { id: '3', category: 'girls', title: 'فستان بناتي رقيق', price: 450, sizes: ['3Y', '5Y', '7Y'], image: 'https://tse2.mm.bing.net/th/id/OIP.3HK0pkdR8MzoNezXxKEqOwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', description: 'فستان صيفي بناتي بتصميم مميز وألوان مبهجة. مثالي للمناسبات أو الخروج.' },
  { id: '4', category: 'girls', title: 'شورت بناتي جينز', price: 200, sizes: ['4Y', '6Y', '8Y'], image: 'https://tse2.mm.bing.net/th/id/OIP.3HK0pkdR8MzoNezXxKEqOwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', description: 'شورت جينز عملي جداً مناسب لكل الأوقات، خفيف ومريح للحركة.' },
  { id: '5', category: 'babies', title: 'سالوبيت قطني', price: 250, sizes: ['3M', '6M', '12M'], image: 'https://tse2.mm.bing.net/th/id/OIP.0TDWJIRS-TgHG8seIBQHXQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', description: 'سالوبيت ناعم جداً على بشرة طفلك لحمايته من الحساسية.' },
  { id: '6', category: 'babies', title: 'طقم حديثي الولادة', price: 300, sizes: ['0-3M', '3-6M'], image: 'https://tse2.mm.bing.net/th/id/OIP.0TDWJIRS-TgHG8seIBQHXQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', description: 'طقم متكامل مكون من 3 قطع للمواليد الجدد. قطن 100% ممتاز.' }
];

// In the future, replace this logic with: fetch('YOUR_GOOGLE_APPS_SCRIPT_URL').then(r => r.json())
async function fetchProducts() {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => resolve(MOCK_PRODUCTS), 300);
  });
}

async function fetchProductById(id) {
  const products = await fetchProducts();
  return products.find(p => p.id === String(id));
}

// Simulates sending an order to Google Sheets
async function submitOrder(orderData) {
  console.log('Sending order to Google Sheets:', orderData);
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: true }), 1500);
  });
}
