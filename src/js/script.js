// src/js/script.js
class Shop {
  constructor() {
    this.products = [];
    this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    this.init();
  }

  init() {
    this.updateYear();
    this.loadProducts();
    this.setupEventListeners();
  }

  updateYear() {
    const currentYear = document.getElementById("current-year");
    if (currentYear) currentYear.textContent = new Date().getFullYear();
  }

  async loadProducts() {
    try {
      const response = await fetch("./src/data/products.json");
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      this.products = await response.json();
      this.renderProducts();
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      document.getElementById("products-grid").innerHTML =
        "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
    }
  }

  renderProducts() {
    const productsGrid = document.getElementById("products-grid");
    productsGrid.innerHTML = "";
    this.products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${
        product.name
      }" loading="lazy" onerror="this.src='https://via.placeholder.com/250?text=Imagem+Indisponível'">
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">R$ ${product.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart" data-id="${
            product.id
          }">Adicionar ao Carrinho</button>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });
  }

  updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  updateCartModal() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");
    cartItemsContainer.innerHTML = "";
    let total = 0;
    this.cart.forEach((item) => {
      total += item.price * item.quantity;
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
        <div class="cart-item-controls">
          <button class="btn btn-secondary btn-sm decrease-quantity" data-id="${
            item.id
          }">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="btn btn-secondary btn-sm increase-quantity" data-id="${
            item.id
          }">+</button>
          <button class="btn btn-secondary btn-sm remove-from-cart" data-id="${
            item.id
          }">×</button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    cartTotalContainer.textContent = total.toFixed(2);
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }

  addToCart(productId) {
    const product = this.products.find((p) => p.id === parseInt(productId));
    if (!product) return;
    const cartItem = this.cart.find((item) => item.id === product.id);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.updateCartCount();
    this.updateCartModal();
    this.showNotification(`${product.name} foi adicionado ao carrinho!`);
  }

  increaseQuantity(productId) {
    const cartItem = this.cart.find((item) => item.id === parseInt(productId));
    if (cartItem) {
      cartItem.quantity += 1;
      this.updateCartCount();
      this.updateCartModal();
    }
  }

  decreaseQuantity(productId) {
    const cartItem = this.cart.find((item) => item.id === parseInt(productId));
    if (cartItem && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else if (cartItem) {
      this.cart = this.cart.filter((item) => item.id !== parseInt(productId));
    }
    this.updateCartCount();
    this.updateCartModal();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== parseInt(productId));
    this.updateCartCount();
    this.updateCartModal();
  }

  setupEventListeners() {
    document.addEventListener("click", (e) => {
      const productId = e.target.getAttribute("data-id");
      if (e.target.classList.contains("add-to-cart")) {
        this.addToCart(productId);
      } else if (e.target.classList.contains("increase-quantity")) {
        this.increaseQuantity(productId);
      } else if (e.target.classList.contains("decrease-quantity")) {
        this.decreaseQuantity(productId);
      } else if (e.target.classList.contains("remove-from-cart")) {
        this.removeFromCart(productId);
      }
    });

    const cartModal = document.getElementById("cart-modal");
    const cartLink = document.querySelector(".cart-link");
    const closeCart = document.getElementById("close-cart");
    const checkoutBtn = document.getElementById("checkout-btn");

    cartLink.addEventListener("click", (e) => {
      e.preventDefault();
      cartModal.style.display = "block";
    });

    closeCart.addEventListener("click", () => {
      cartModal.style.display = "none";
    });

    checkoutBtn.addEventListener("click", () => {
      if (this.cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
      }
      let message = "Olá, gostaria de finalizar minha compra: ";
      this.cart.forEach((item) => {
        message += `${item.name} (x${item.quantity}) - R$ ${(
          item.price * item.quantity
        ).toFixed(2)}`;
      });
      const total = this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      message += ` Total: R$ ${total.toFixed(2)}`;
      message += " Obrigado!";
      const phoneNumber = "5583987922753";
      const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappURL, "_blank");
      this.cart = [];
      this.updateCartCount();
      this.updateCartModal();
      cartModal.style.display = "none";
      alert("Obrigado por sua compra!");
    });

    window.addEventListener("click", (e) => {
      if (e.target === cartModal) cartModal.style.display = "none";
    });

    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", !expanded);
        navMenu.classList.toggle("active");
      });
    }
  }
}

// Initialize the shop
document.addEventListener("DOMContentLoaded", () => new Shop());
