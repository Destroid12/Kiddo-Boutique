const Cart = {
  items: [],
  
  init: function() {
    const saved = localStorage.getItem('kiddo_cart');
    if (saved) {
      this.items = JSON.parse(saved);
    }
    this.updateCounter();
  },
  
  save: function() {
    localStorage.setItem('kiddo_cart', JSON.stringify(this.items));
    this.updateCounter();
  },
  
  add: function(product, size) {
    if (product && product.status === 'out_of_stock') {
      this.showToast('عذراً، هذا المنتج نفذت كميته وغير متوفر حالياً.');
      return;
    }
    const existing = this.items.find(i => i.id === product.id && i.size === size);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        size: size,
        quantity: 1
      });
    }
    this.save();
    this.showToast('تمت الإضافة للسلة بنجاح!');
  },
  
  remove: function(id, size) {
    this.items = this.items.filter(i => !(i.id === String(id) && i.size === String(size)));
    this.save();
  },
  
  updateQuantity: function(id, size, quantity) {
    const item = this.items.find(i => i.id === String(id) && i.size === String(size));
    if (item) {
      const q = parseInt(quantity);
      if (q <= 0) {
        this.remove(id, size);
      } else {
        item.quantity = q;
        this.save();
      }
    }
  },
  
  clear: function() {
    this.items = [];
    this.save();
  },
  
  getTotal: function() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  updateCounter: function() {
    const counters = document.querySelectorAll('.cart-count');
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    counters.forEach(c => {
      c.textContent = totalItems;
      c.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    });
  },

  showToast: function(message) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
