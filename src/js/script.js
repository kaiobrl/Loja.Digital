document.addEventListener("DOMContentLoaded", () => {
  // Atualiza o ano no rodapé
  const currentYear = document.getElementById("current-year");
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // Array com produtos (exemplo)
  const products = [
    {
      id: 1,
      name: "Arte 1",
      price: 10.9,
      image: "./src/imagem/produto1.jpg"
    },
    {
      id: 2,
      name: "Arte 2",
      price: 15.9,
      image: "./src/imagem/produto2.jpg"
    },
    {
      id: 3,
      name: "Arte 3",
      price: 21.9,
      image: "./src/imagem/produto3.jpg"
    },
    {
      id: 4,
      name: "Arte 4",
      price: 29.9,
      image: "./src/imagem/produto4.jpg"
    }
  ];

  // Renderiza os produtos na grade
  const productsGrid = document.getElementById("products-grid");
  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">R$ ${product.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
        </div>
      `;
    productsGrid.appendChild(productCard);
  });

  // Inicializa o carrinho (array simples)
  let cart = [];

  // Atualiza o contador do carrinho
  const updateCartCount = () => {
    const cartCount = document.getElementById("cart-count");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  };

  // Atualiza o modal do carrinho com os itens e total
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
          <span>${item.name} (x${item.quantity}) - R$ ${(item.price *
        item.quantity).toFixed(2)}</span>
          <button class="btn btn-secondary btn-sm remove-from-cart" data-id="${item.id}">&times;</button>
        `;
      cartItemsContainer.appendChild(cartItem);
    });
    cartTotalContainer.textContent = total.toFixed(2);
  };

  // Função para adicionar produtos ao carrinho
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
  };

  // Função para remover produtos do carrinho
  const removeFromCart = productId => {
    cart = cart.filter(item => item.id !== parseInt(productId));
    updateCartCount();
    updateCartModal();
  };

  // Adiciona eventos aos botões "Adicionar ao Carrinho"
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", e => {
      const productId = e.currentTarget.getAttribute("data-id");
      addToCart(productId);
    });
  });

  // Delegação de evento para remover itens do carrinho
  document.getElementById("cart-items").addEventListener("click", e => {
    if (e.target.classList.contains("remove-from-cart")) {
      const productId = e.target.getAttribute("data-id");
      removeFromCart(productId);
    }
  });

  // Modal do carrinho
  const cartModal = document.getElementById("cart-modal");
  const cartLink = document.querySelector(".cart-link");
  const closeCart = document.getElementById("close-cart");

  // Exibe o modal ao clicar no ícone do carrinho
  if (cartLink) {
    cartLink.addEventListener("click", e => {
      e.preventDefault();
      cartModal.style.display = "block";
    });
  }

  // Fecha o modal ao clicar no "X"
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartModal.style.display = "none";
    });
  }

  // Finaliza a compra e envia a mensagem via WhatsApp
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
    } else {
      // Composição da mensagem com os detalhes do pedido
      let message = "Olá, gostaria de finalizar minha compra:%0A";
      cart.forEach(item => {
        message += `${item.name} (x${item.quantity}) - R$ ${(item.price *
          item.quantity).toFixed(2)}%0A`;
      });
      let total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      message += `Total: R$ ${total.toFixed(2)}%0A`;
      message += "Obrigado!";

      // Atualize com o número desejado (incluindo código do país e DDD)
      const phoneNumber = "5583987922753";
      const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

      // Abre a URL do WhatsApp em nova aba
      window.open(whatsappURL, "_blank");

      // Limpa o carrinho e atualiza a interface
      cart = [];
      updateCartCount();
      updateCartModal();
      cartModal.style.display = "none";

      // Exibe a mensagem de agradecimento na tela
      alert("Obrigado por sua compra!");
    }
  });

  // Fecha o modal ao clicar fora da área de conteúdo
  window.addEventListener("click", e => {
    if (e.target === cartModal) {
      cartModal.style.display = "none";
    }
  });

  // Toggle para o menu mobile (botão hamburger)
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
});
