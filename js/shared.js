/**
 * START ITAPE - Unified Shared Cart & Navigation Manager
 */
(function() {
  const CART_STORAGE_KEY = 'start_itape_cart';

  function getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
    const totalPrice = cart.reduce((acc, item) => {
      let priceNum = 74.90;
      if (typeof item.price === 'number') {
        priceNum = item.price;
      } else if (typeof item.price === 'string') {
        priceNum = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 74.90;
      }
      return acc + (priceNum * (item.qty || 1));
    }, 0);

    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
      cartCounter.textContent = totalCount;
    }

    const cartTotalPrice = document.getElementById('cart-total-price');
    if (cartTotalPrice) {
      cartTotalPrice.textContent = 'R$ ' + totalPrice.toFixed(2).replace('.', ',');
    }

    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');

    if (container) {
      if (cart.length === 0) {
        container.innerHTML = `
          <div id="cart-empty-message" class="flex flex-col items-center justify-center h-full text-center py-space-2xl">
            <span class="material-symbols-outlined text-outline text-[48px] mb-space-sm">remove_shopping_cart</span>
            <p class="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Carrinho vazio</p>
            <p class="font-body-sm text-body-sm text-outline">Adicione tênis exclusivos da grade promocional por R$ 74,90.</p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        cart.forEach((item, index) => {
          let priceNum = 74.90;
          if (typeof item.price === 'number') {
            priceNum = item.price;
          } else if (typeof item.price === 'string') {
            priceNum = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 74.90;
          }
          const formattedPrice = 'R$ ' + priceNum.toFixed(2).replace('.', ',');
          const qty = item.qty || 1;
          const itemId = item.id || `cart-item-${index}`;

          const itemEl = document.createElement('div');
          itemEl.className = 'p-space-sm bg-surface-container rounded flex gap-space-sm items-center justify-between shadow-sm';
          itemEl.innerHTML = `
            <div class="flex items-center gap-space-sm min-w-0">
              <img src="${item.img || item.image || ''}" alt="${item.title || 'Tênis'}" class="w-14 h-14 rounded object-cover shrink-0 bg-surface-container-lowest" />
              <div class="min-w-0">
                <h4 class="font-headline-sm text-[13px] leading-tight uppercase text-on-surface truncate">${item.title}</h4>
                <p class="font-body-sm text-[11px] text-outline">
                  ${item.size ? `Tam: <strong class="text-primary-container font-black">${item.size}</strong>` : ''} 
                  ${item.color ? `• ${item.color}` : ''}
                </p>
                <span class="font-headline-sm text-[14px] text-primary-container font-black">${formattedPrice}</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <div class="flex items-center bg-surface-container-high rounded overflow-hidden">
                <button type="button" aria-label="Diminuir" class="px-2 py-1 text-on-surface hover:text-primary-container cursor-pointer select-none" onclick="window.updateQty('${itemId}', -1)">-</button>
                <span class="px-2 font-label-badge text-label-badge font-bold">${qty}</span>
                <button type="button" aria-label="Aumentar" class="px-2 py-1 text-on-surface hover:text-primary-container cursor-pointer select-none" onclick="window.updateQty('${itemId}', 1)">+</button>
              </div>
              <button type="button" class="text-[11px] text-error flex items-center hover:underline cursor-pointer" onclick="window.removeFromCart('${itemId}')">
                remover
              </button>
            </div>
          `;
          container.appendChild(itemEl);
        });
      }
    }

    if (checkoutBtn) {
      if (cart.length === 0) {
        checkoutBtn.href = "https://wa.me/5515992760062?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20a%20disponibilidade%20de%20t%C3%AAnis%20na%20loja%20START%20ITAPE";
      } else {
        let msg = "Olá START ITAPE! Gostaria de confirmar meu pedido para retirada no Box 15 (Mercado Municipal de Itapetininga):\n\n";
        cart.forEach(item => {
          let priceNum = 74.90;
          if (typeof item.price === 'number') {
            priceNum = item.price;
          } else if (typeof item.price === 'string') {
            priceNum = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 74.90;
          }
          const qty = item.qty || 1;
          const subtotal = (priceNum * qty).toFixed(2).replace('.', ',');
          msg += `• *${item.title}* ${item.size ? `(Tam: ${item.size})` : ''} ${item.color ? `[Cor: ${item.color}]` : ''} x${qty} - R$ ${subtotal}\n`;
        });
        msg += `\n*Total do Pedido:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n`;
        msg += `*Local de Retirada:* Box 15 - Mercado Municipal de Itapetininga/SP`;
        checkoutBtn.href = `https://wa.me/5515992760062?text=${encodeURIComponent(msg)}`;
      }
    }
  }

  window.addToCart = function(itemOrTitle, price, image, size, color) {
    const cart = getCart();
    let newItem = {};

    if (typeof itemOrTitle === 'object' && itemOrTitle !== null) {
      newItem = { ...itemOrTitle };
    } else {
      newItem = {
        title: itemOrTitle,
        price: price || 74.90,
        img: image,
        size: size || '',
        color: color || ''
      };
    }

    if (!newItem.id) {
      newItem.id = `${newItem.title}-${newItem.size || 'padrao'}-${newItem.color || 'padrao'}`;
    }
    newItem.qty = newItem.qty || 1;

    const existingIndex = cart.findIndex(i => (i.id && i.id === newItem.id) || (i.title === newItem.title && i.size === newItem.size && i.color === newItem.color));
    if (existingIndex > -1) {
      cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
    } else {
      cart.push(newItem);
    }

    saveCart(cart);
    updateCartUI();
    window.toggleCart(true);
  };

  window.removeFromCart = function(id) {
    let cart = getCart();
    cart = cart.filter(i => (i.id !== id && `cart-item-${cart.indexOf(i)}` !== id));
    saveCart(cart);
    updateCartUI();
  };

  window.updateQty = function(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id || `cart-item-${cart.indexOf(i)}` === id);
    if (item) {
      item.qty = (item.qty || 1) + delta;
      if (item.qty <= 0) {
        window.removeFromCart(id);
        return;
      }
    }
    saveCart(cart);
    updateCartUI();
  };

  window.toggleCart = function(open) {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');
    if (!cartDrawer || !cartBackdrop) return;

    if (open) {
      cartBackdrop.classList.remove('hidden');
      setTimeout(() => {
        cartBackdrop.classList.remove('opacity-0');
        cartDrawer.classList.remove('translate-x-full');
      }, 10);
    } else {
      cartBackdrop.classList.add('opacity-0');
      cartDrawer.classList.add('translate-x-full');
      setTimeout(() => {
        cartBackdrop.classList.add('hidden');
      }, 300);
    }
  };

  window.toggleMobileMenu = function(forceClose) {
    const drawer = document.getElementById('mobile-menu-drawer');
    const icon = document.getElementById('mobile-menu-icon');
    if (!drawer) return;

    const isOpen = !drawer.classList.contains('-translate-y-[150%]');
    if (isOpen || forceClose) {
      drawer.classList.add('-translate-y-[150%]', 'opacity-0', 'pointer-events-none');
      if (icon) icon.textContent = 'menu';
    } else {
      drawer.classList.remove('-translate-y-[150%]', 'opacity-0', 'pointer-events-none');
      if (icon) icon.textContent = 'close';
    }
  };

  window.renderCart = updateCartUI;

  document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const cartBtn = document.getElementById('cart-toggle-btn');
    const cartClose = document.getElementById('cart-close-btn');
    const cartBackdrop = document.getElementById('cart-backdrop');
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');

    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); window.toggleCart(true); });
    if (cartClose) cartClose.addEventListener('click', (e) => { e.preventDefault(); window.toggleCart(false); });
    if (cartBackdrop) cartBackdrop.addEventListener('click', () => window.toggleCart(false));
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => window.toggleMobileMenu());
  });
})();
