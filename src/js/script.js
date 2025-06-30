/**
 * Formato Livre - Loja Online
 * Script principal da aplicação
 */

class Shop {
  /**
   * Inicializa a loja
   */
  constructor() {
    // Estado da aplicação
    this.products = []
    this.filteredProducts = []
    this.cart = []
    this.currentTheme = "light"
    this.searchQuery = ""
    this.sortOption = "default"

    // Inicialização
    this.init()
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    // Carregar dados do localStorage
    this.loadFromLocalStorage()

    // Configurar listeners de eventos
    this.setupEventListeners()

    // Carregar produtos
    await this.loadProducts()

    // Atualizar contagem do carrinho
    this.updateCartCount()

    // Inicializar formulários
    this.initForms()

    console.log("Loja inicializada com sucesso!")
  }

  /**
   * Carrega dados do localStorage
   */
  loadFromLocalStorage() {
    try {
      // Carregar carrinho
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        this.cart = JSON.parse(savedCart)
      }

      // Carregar tema
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        this.currentTheme = savedTheme
      } else {
        // Verificar preferência do sistema
        this.currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }

      // Aplicar o tema imediatamente
      this.applyTheme()

      console.log("Dados carregados do localStorage")
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error)
      // Resetar para valores padrão em caso de erro
      this.cart = []
      this.currentTheme = "light"
      this.applyTheme()
    }
  }

  /**
   * Atualiza o ano no rodapé
   */
  updateYear() {
    const currentYearElement = document.getElementById("current-year")
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear()
    }
  }

  /**
   * Carrega os produtos do arquivo JSON
   */
  async loadProducts() {
    try {
      // Mostrar indicador de carregamento
      document.getElementById("products-loading").style.display = "flex"
      document.getElementById("products-grid").style.display = "none"
      document.getElementById("products-error").style.display = "none" // Alterado de hidden para style.display

      // Carregar produtos com um pequeno atraso para mostrar o indicador de carregamento
      await new Promise((resolve) => setTimeout(resolve, 500))

      const response = await fetch("./src/data/products.json")

      if (!response.ok) {
        throw new Error(`Erro ao carregar produtos: ${response.status} ${response.statusText}`)
      }

      this.products = await response.json()
      this.filteredProducts = [...this.products]

      // Renderizar produtos
      this.renderProducts()

      // Esconder indicador de carregamento
      document.getElementById("products-loading").style.display = "none"
      document.getElementById("products-grid").style.display = "grid"

      console.log(`${this.products.length} produtos carregados com sucesso`)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)

      // Mostrar mensagem de erro
      document.getElementById("products-loading").style.display = "none"
      document.getElementById("products-error").style.display = "flex" // Alterado para flex para melhor alinhamento
      document.getElementById("products-grid").style.display = "none"
    }
  }

  /**
   * Filtra e ordena os produtos
   */
  filterAndSortProducts() {
    // Filtrar por termo de busca
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      this.filteredProducts = this.products.filter((product) => product.name.toLowerCase().includes(query))
    } else {
      this.filteredProducts = [...this.products]
    }

    // Ordenar produtos
    switch (this.sortOption) {
      case "price-asc":
        this.filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        this.filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Manter ordem original
        break
    }

    // Renderizar produtos filtrados
    this.renderProducts()
  }

  /**
   * Renderiza os produtos na grade
   */
  renderProducts() {
    const productsGrid = document.getElementById("products-grid")
    const noResults = document.getElementById("no-results")

    // Limpar grade de produtos
    productsGrid.innerHTML = ""

    // Verificar se há produtos para mostrar
    if (this.filteredProducts.length === 0) {
      noResults.hidden = false
      return
    }

    noResults.hidden = true

    // Renderizar cada produto
    this.filteredProducts.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.classList.add("product-card")

      productCard.innerHTML = `
        <div class="product-image">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            loading="lazy" 
            onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}'"
          />
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">R$ ${product.price.toFixed(2)}</p>
          <div class="product-actions">
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
              <i class="bx bx-cart-add"></i> Adicionar
            </button>
            <button class="btn btn-outline view-product" data-id="${product.id}">
              <i class="bx bx-show"></i> Detalhes
            </button>
          </div>
        </div>
      `

      productsGrid.appendChild(productCard)
    })
  }

  /**
   * Mostra os detalhes de um produto
   * @param {number} productId - ID do produto
   */
  showProductDetails(productId) {
    const product = this.products.find((p) => p.id === Number.parseInt(productId))

    if (!product) {
      this.showNotification("Produto não encontrado", "error")
      return
    }

    const productDetails = document.getElementById("product-details")
    productDetails.innerHTML = `
      <div class="product-detail-image">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          onerror="this.src='https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}'"
        />
      </div>
      <div class="product-detail-info">
        <h2 class="product-detail-title">${product.name}</h2>
        <p class="product-detail-price">R$ ${product.price.toFixed(2)}</p>
        <div class="product-detail-description">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
          <p>Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
        </div>
        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
          <i class="bx bx-cart-add"></i> Adicionar ao Carrinho
        </button>
      </div>
    `

    // Mostrar modal
    const productModal = document.getElementById("product-modal")
    productModal.style.display = "block"
    productModal.setAttribute("aria-hidden", "false")

    // Focar no primeiro elemento interativo
    setTimeout(() => {
      const firstButton = productModal.querySelector("button")
      if (firstButton) firstButton.focus()
    }, 100)
  }

  /**
   * Atualiza a contagem de itens no carrinho
   */
  updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0)

    cartCount.textContent = totalItems
    cartCount.setAttribute("aria-label", `${totalItems} ${totalItems === 1 ? "item" : "itens"} no carrinho`)

    // Salvar carrinho no localStorage
    localStorage.setItem("cart", JSON.stringify(this.cart))
  }

  /**
   * Atualiza o conteúdo do modal do carrinho
   */
  updateCartModal() {
    const cartItems = document.getElementById("cart-items")
    const cartTotal = document.getElementById("cart-total")
    const cartEmpty = document.getElementById("cart-empty")

    // Limpar itens do carrinho
    cartItems.innerHTML = ""

    // Verificar se o carrinho está vazio
    if (this.cart.length === 0) {
      cartEmpty.style.display = "flex"
      cartItems.style.display = "none"
      document.querySelector(".cart-summary").style.display = "none"
      return
    }

    // Mostrar itens e esconder mensagem de vazio
    cartEmpty.style.display = "none"
    cartItems.style.display = "block"
    document.querySelector(".cart-summary").style.display = "block"

    // Calcular total
    let total = 0

    // Renderizar cada item do carrinho
    this.cart.forEach((item) => {
      total += item.price * item.quantity

      const cartItem = document.createElement("div")
      cartItem.classList.add("cart-item")

      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            onerror="this.src='https://via.placeholder.com/60x60?text=${encodeURIComponent(item.name)}'"
          />
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.name}</h3>
          <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn decrease-quantity" data-id="${item.id}" aria-label="Diminuir quantidade">-</button>
          <span class="quantity" aria-live="polite">${item.quantity}</span>
          <button class="quantity-btn increase-quantity" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
          <button class="remove-btn remove-from-cart" data-id="${item.id}" aria-label="Remover item">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      `

      cartItems.appendChild(cartItem)
    })

    // Atualizar total
    cartTotal.textContent = total.toFixed(2)
  }

  /**
   * Adiciona um produto ao carrinho
   * @param {number} productId - ID do produto
   */
  addToCart(productId) {
    const product = this.products.find((p) => p.id === Number.parseInt(productId))

    if (!product) {
      this.showNotification("Produto não encontrado", "error")
      return
    }

    // Verificar se o produto já está no carrinho
    const cartItem = this.cart.find((item) => item.id === product.id)

    if (cartItem) {
      // Aumentar quantidade
      cartItem.quantity += 1
      this.showNotification(`Quantidade de ${product.name} aumentada`, "success")
    } else {
      // Adicionar novo item
      this.cart.push({ ...product, quantity: 1 })
      this.showNotification(`${product.name} adicionado ao carrinho`, "success")
    }

    // Atualizar interface
    this.updateCartCount()
    this.updateCartModal()
  }

  /**
   * Aumenta a quantidade de um item no carrinho
   * @param {number} productId - ID do produto
   */
  increaseQuantity(productId) {
    const cartItem = this.cart.find((item) => item.id === Number.parseInt(productId))

    if (cartItem) {
      cartItem.quantity += 1
      this.updateCartCount()
      this.updateCartModal()
    }
  }

  /**
   * Diminui a quantidade de um item no carrinho
   * @param {number} productId - ID do produto
   */
  decreaseQuantity(productId) {
    const cartItem = this.cart.find((item) => item.id === Number.parseInt(productId))

    if (cartItem) {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1
      } else {
        // Remover item se quantidade chegar a zero
        this.removeFromCart(productId)
        return
      }

      this.updateCartCount()
      this.updateCartModal()
    }
  }

  /**
   * Remove um item do carrinho
   * @param {number} productId - ID do produto
   */
  removeFromCart(productId) {
    const productIndex = this.cart.findIndex((item) => item.id === Number.parseInt(productId))

    if (productIndex !== -1) {
      const productName = this.cart[productIndex].name
      this.cart.splice(productIndex, 1)

      this.updateCartCount()
      this.updateCartModal()

      this.showNotification(`${productName} removido do carrinho`, "success")
    }
  }

  /**
   * Limpa todos os itens do carrinho
   */
  clearCart() {
    if (this.cart.length === 0) return

    this.cart = []
    this.updateCartCount()
    this.updateCartModal()

    this.showNotification("Carrinho esvaziado com sucesso", "success")
  }

  /**
   * Finaliza a compra via WhatsApp
   */
  checkout() {
    if (this.cart.length === 0) {
      this.showNotification("Seu carrinho está vazio", "error")
      return
    }

    // Solicitar dados do cliente
    const nome = prompt("Informe seu nome completo:")
    if (!nome) {
      this.showNotification("Nome é obrigatório para finalizar a compra.", "error")
      return
    }

    const telefone = prompt("Informe seu telefone para contato:")
    if (!telefone) {
      this.showNotification("Telefone é obrigatório para finalizar a compra.", "error")
      return
    }

    const endereco = prompt("Informe seu endereço de entrega:")
    if (!endereco) {
      this.showNotification("Endereço é obrigatório para finalizar a compra.", "error")
      return
    }

    // Construir mensagem para WhatsApp
    let message = `Olá, gostaria de finalizar minha compra:%0A%0A`
    message += `*Nome:* ${encodeURIComponent(nome)}%0A`
    message += `*Telefone:* ${encodeURIComponent(telefone)}%0A`
    message += `*Endereço:* ${encodeURIComponent(endereco)}%0A%0A`

    this.cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      message += `${item.name} (x${item.quantity}) - R$ ${itemTotal.toFixed(2)}%0A`
    })

    const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    message += `%0ATotal: R$ ${total.toFixed(2)}%0A%0A`
    message += "Aguardo seu contato. Obrigado!"

    // Número de telefone
    const phoneNumber = "5583981374944"

    // Construir URL do WhatsApp
    const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`

    // Abrir WhatsApp em nova aba
    window.open(whatsappURL, "_blank")

    // Limpar carrinho após finalizar compra
    this.clearCart()

    // Fechar modal do carrinho
    document.getElementById("cart-modal").style.display = "none"
    document.getElementById("cart-modal").setAttribute("aria-hidden", "true")

    this.showNotification("Pedido enviado com sucesso! Obrigado pela compra.", "success")
  }

  /**
   * Mostra uma notificação na tela
   * @param {string} message - Mensagem da notificação
   * @param {string} type - Tipo da notificação (success, error)
   */
  showNotification(message, type = "success") {
    const container = document.getElementById("notification-container")

    // Criar elemento de notificação
    const notification = document.createElement("div")
    notification.classList.add("notification")
    notification.classList.add(type)

    // Ícone baseado no tipo
    const icon = type === "success" ? "bx-check-circle" : "bx-error-circle"

    notification.innerHTML = `
      <i class="bx ${icon}"></i>
      <span>${message}</span>
    `

    // Adicionar ao container
    container.appendChild(notification)

    // Remover após 3 segundos
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  /**
   * Aplica o tema atual (claro/escuro)
   */
  applyTheme() {
    // Aplicar tema ao body
    document.documentElement.setAttribute("data-theme", this.currentTheme)

    // Atualizar ícone do botão
    const themeIcon = document.getElementById("theme-icon")
    const themeToggle = document.getElementById("theme-toggle")

    // Remover classes existentes
    themeIcon.classList.remove("bx-moon", "bx-sun")

    // Adicionar classe correta
    if (this.currentTheme === "dark") {
      themeIcon.classList.add("bx-sun")
      themeToggle.setAttribute("aria-pressed", "true")
      themeToggle.setAttribute("aria-label", "Mudar para modo claro")
    } else {
      themeIcon.classList.add("bx-moon")
      themeToggle.setAttribute("aria-pressed", "false")
      themeToggle.setAttribute("aria-label", "Mudar para modo escuro")
    }

    // Salvar preferência
    localStorage.setItem("theme", this.currentTheme)

    console.log(`Tema aplicado: ${this.currentTheme}`)
  }

  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light"
    this.applyTheme()
  }

  /**
   * Inicializa os formulários da página
   */
  initForms() {
    // Formulário de contato
    const contactForm = document.getElementById("contact-form")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()

        // Simulação de envio
        this.showNotification("Mensagem enviada com sucesso! Entraremos em contato em breve.", "success")
        contactForm.reset()
      })
    }

    // Formulário de newsletter
    const newsletterForm = document.getElementById("newsletter-form")
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault()

        // Simulação de inscrição
        this.showNotification("Inscrição realizada com sucesso!", "success")
        newsletterForm.reset()
      })
    }
  }

  /**
   * Configura todos os listeners de eventos
   */
  setupEventListeners() {
    // Delegação de eventos para cliques
    document.addEventListener("click", (e) => {
      // Botões de adicionar ao carrinho
      if (e.target.closest(".add-to-cart")) {
        const button = e.target.closest(".add-to-cart")
        const productId = button.getAttribute("data-id")
        this.addToCart(productId)
      }

      // Botões de visualizar produto
      else if (e.target.closest(".view-product")) {
        const button = e.target.closest(".view-product")
        const productId = button.getAttribute("data-id")
        this.showProductDetails(productId)
      }

      // Botões de aumentar quantidade
      else if (e.target.closest(".increase-quantity")) {
        const button = e.target.closest(".increase-quantity")
        const productId = button.getAttribute("data-id")
        this.increaseQuantity(productId)
      }

      // Botões de diminuir quantidade
      else if (e.target.closest(".decrease-quantity")) {
        const button = e.target.closest(".decrease-quantity")
        const productId = button.getAttribute("data-id")
        this.decreaseQuantity(productId)
      }

      // Botões de remover do carrinho
      else if (e.target.closest(".remove-from-cart")) {
        const button = e.target.closest(".remove-from-cart")
        const productId = button.getAttribute("data-id")
        this.removeFromCart(productId)
      }

      // Botão de alternar tema
      else if (e.target.closest("#theme-toggle")) {
        this.toggleTheme()
      }

      // Botão de alternar menu em dispositivos móveis
      else if (e.target.closest(".nav-toggle")) {
        const navMenu = document.querySelector(".nav-menu")
        const navToggle = document.querySelector(".nav-toggle")
        const expanded = navToggle.getAttribute("aria-expanded") === "true"

        navToggle.setAttribute("aria-expanded", !expanded)
        navMenu.classList.toggle("active")
      }

      // Botão de fechar modal do carrinho
      else if (e.target.closest("#close-cart")) {
        document.getElementById("cart-modal").style.display = "none"
        document.getElementById("cart-modal").setAttribute("aria-hidden", "true")
      }

      // Botão de fechar modal do produto
      else if (e.target.closest("#close-product")) {
        document.getElementById("product-modal").style.display = "none"
        document.getElementById("product-modal").setAttribute("aria-hidden", "true")
      }

      // Botão de finalizar compra
      else if (e.target.closest("#checkout-btn")) {
        this.checkout()
      }

      // Botão de limpar carrinho
      else if (e.target.closest("#clear-cart")) {
        this.clearCart()
      }

      // Botão de tentar carregar produtos novamente
      else if (e.target.closest("#retry-load")) {
        this.loadProducts()
      }
    })

    // Link do carrinho
    const cartLink = document.querySelector(".cart-link")
    if (cartLink) {
      cartLink.addEventListener("click", (e) => {
        e.preventDefault()

        // Atualizar modal do carrinho
        this.updateCartModal()

        // Mostrar modal
        document.getElementById("cart-modal").style.display = "block"
        document.getElementById("cart-modal").setAttribute("aria-hidden", "false")
      })
    }

    // Fechar modais ao clicar fora
    window.addEventListener("click", (e) => {
      const cartModal = document.getElementById("cart-modal")
      const productModal = document.getElementById("product-modal")

      if (e.target === cartModal) {
        cartModal.style.display = "none"
        cartModal.setAttribute("aria-hidden", "true")
      }

      if (e.target === productModal) {
        productModal.style.display = "none"
        productModal.setAttribute("aria-hidden", "true")
      }
    })

    // Busca de produtos
    const searchInput = document.getElementById("product-search")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim()
        this.filterAndSortProducts()
      })
    }

    // Ordenação de produtos
    const sortSelect = document.getElementById("sort-select")
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortOption = e.target.value
        this.filterAndSortProducts()
      })
    }

    // Tecla Escape para fechar modais
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const cartModal = document.getElementById("cart-modal")
        const productModal = document.getElementById("product-modal")

        if (cartModal.style.display === "block") {
          cartModal.style.display = "none"
          cartModal.setAttribute("aria-hidden", "true")
        }

        if (productModal.style.display === "block") {
          productModal.style.display = "none"
          productModal.setAttribute("aria-hidden", "true")
        }
      }
    })

    // Detectar mudanças na preferência de tema do sistema
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      // Só alterar automaticamente se o usuário não tiver definido uma preferência
      if (!localStorage.getItem("theme")) {
        this.currentTheme = e.matches ? "dark" : "light"
        this.applyTheme()
      }
    })

    // Botão de tentar carregar produtos novamente
    const retryButton = document.getElementById("retry-load")
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        this.loadProducts()
      })
    }
  }
}

// Inicializar a loja quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  new Shop()
})


// Fechar modal do carrinho
const cartModal = document.getElementById("cart-modal")
cartModal.style.display = "none"
cartModal.setAttribute("aria-hidden", "true")
// Mover foco para o botão do carrinho
const cartLink = document.querySelector(".cart-link")
if (cartLink) cartLink.focus()

// Carregar produtos do arquivo JSON
async function loadProducts() {
  try {
    // Caminho relativo para GitHub Pages
    const response = await fetch("src/data/products.json")
    if (!response.ok) throw new Error("Erro ao carregar produtos")
    this.products = await response.json()
    this.filteredProducts = [...this.products]
    this.renderProducts()
    // ...restante do código...
  } catch (error) {
    // ...tratamento de erro...
  }
}
function addToCart(productId) {
  const product = products.find((p) => p.id === Number.parseInt(productId))

  if (!product) {
    showNotification("Produto não encontrado", "error")
    return
  }

  // Verificar se o produto já está no carrinho
  const cartItem = cart.find((item) => item.id === product.id)

  if (cartItem) {
    cartItem.quantity += 1
    showNotification(`Quantidade de ${product.name} aumentada`, "success")
  } else {
    // Garante que price é número
    cart.push({ ...product, price: Number(product.price), quantity: 1 })
    showNotification(`${product.name} adicionado ao carrinho`, "success")
  }

  updateCartCount()
  updateCartModal()
}
function loadFromLocalStorage() {
  try {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      cart = JSON.parse(savedCart).map(item => ({
        ...item,
        price: Number(item.price)
      }))
    }
    // ...restante do código...
  } catch (error) {
    console.error("Erro ao carregar o carrinho do armazenamento local:", error)
  }
}