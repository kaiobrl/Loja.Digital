document.addEventListener("DOMContentLoaded", () => {
  let products = [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Atualiza o ano no rodapé
  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Carrega produtos via fetch
  fetch("./src/data/products.json")
    .then(response => response.json())
    .then(data => {
      products = data;
      const productsGrid = document.getElementById("products-grid");
      products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/250?text=Imagem+Indisponível'">
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">R$ ${product.price.toFixed(2)}</p>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
          </div>
        `;
        productsGrid.appendChild(productCard);
      });

      // Adiciona eventos aos botões "Adicionar ao Carrinho"
      document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", e => {
          const productId = e.currentTarget.getAttribute("data-id");
          addToCart(productId);
        });
      });
    })
    .catch(error => console.error("Erro ao carregar produtos:", error));

  // Atualiza o contador do carrinho
  const updateCartCount = () => {
    const cartCount = document.getElementById("cart-count");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Atualiza o modal do carrinho
  const updateCartModal = () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    cartItemsContainer.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
        <div class="cart-item-controls">
          <button class="btn btn-secondary btn-sm decrease-quantity" data-id="${item.id}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="btn btn-secondary btn-sm increase-quantity" data-id="${item.id}">+</button>
          <button class="btn btn-secondary btn-sm remove-from-cart" data-id="${item.id}">×</button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    cartTotalContainer.textContent = total.toFixed(2);
  };

  // Função para exibir notificação
  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  // Adiciona ao carrinho
  const addToCart = productId => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    updateCartModal();
    showNotification(`${product.name} foi adicionado ao carrinho!`);
  };

  // Incrementa quantidade
  const increaseQuantity = productId => {
    const cartItem = cart.find(item => item.id === parseInt(productId));
    if (cartItem) {
      cartItem.quantity += 1;
      updateCartCount();
      updateCartModal();
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  // Decrementa quantidade
  const decreaseQuantity = productId => {
    const cartItem = cart.find(item => item.id === parseInt(productId));
    if (cartItem && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else if (cartItem && cartItem.quantity === 1) {
      cart = cart.filter(item => item.id !== parseInt(productId));
    }
    updateCartCount();
    updateCartModal();
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Remove do carrinho
  const removeFromCart = productId => {
    cart = cart.filter(item => item.id !== parseInt(productId));
    updateCartCount();
    updateCartModal();
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Delegação de eventos no carrinho
  document.getElementById("cart-items").addEventListener("click", e => {
    const productId = e.target.getAttribute("data-id");
    if (e.target.classList.contains("increase-quantity")) {
      increaseQuantity(productId);
    } else if (e.target.classList.contains("decrease-quantity")) {
      decreaseQuantity(productId);
    } else if (e.target.classList.contains("remove-from-cart")) {
      removeFromCart(productId);
    }
  });

  // Modal do carrinho
  const cartModal = document.getElementById("cart-modal");
  const cartLink = document.querySelector(".cart-link");
  const closeCart = document.getElementById("close-cart");

  if (cartLink) {
    cartLink.addEventListener("click", e => {
      e.preventDefault();
      cartModal.style.display = "block";
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartModal.style.display = "none";
    });
  }

  // Finaliza compra via WhatsApp
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
    } else {
      let message = "Olá, gostaria de finalizar minha compra:%0A";
      cart.forEach(item => {
        message += `${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
      });
      let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      message += `Total: R$ ${total.toFixed(2)}%0A`;
      message += "Obrigado!";
      const phoneNumber = "5583987922753";
      const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
      window.open(whatsappURL, "_blank");
      cart = [];
      updateCartCount();
      updateCartModal();
      cartModal.style.display = "none";
      alert("Obrigado por sua compra!");
    }
  });

  // Fecha o modal ao clicar fora
  window.addEventListener("click", e => {
    if (e.target === cartModal) {
      cartModal.style.display = "none";
    }
  });

  // Toggle do menu mobile
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Inicializa a interface
  updateCartCount();
  updateCartModal();
});