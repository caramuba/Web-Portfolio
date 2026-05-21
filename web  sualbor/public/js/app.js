// --- SUALBOR Shopping Cart & UI Controller ---

// State
let PRODUCTS = [];
let state = {
  search: '',
  category: '',
  marcas: [],
  presentaciones: [],
  stock: [],
  sort: 'default',
};

// Cart State (Persisted in LocalStorage)
let cart = JSON.parse(localStorage.getItem('sualbor_cart')) || [];

// Modal Temp State
let modalTempState = {
  productId: null,
  presentation: '',
  quantity: 1
};

// --- INIT APP ---
async function init() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Error al cargar productos del backend');
    PRODUCTS = await response.json();

    // Update sidebar brand counts based on actual DB
    updateSidebarBrandBadges();

    renderProducts();
    updateCartUI();
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    // Fallback simple por si falla la API
    document.getElementById('products-grid').innerHTML = `
      <div class="empty-state">
        <strong>Error de Conexión</strong>
        <p>No pudimos cargar los productos desde el servidor. Por favor, intenta de nuevo o <a href="https://wa.me/59899000000?text=Hola%2C%20tengo%20problemas%20con%20el%20catalogo" target="_blank" style="color:var(--accent)">contáctanos por WhatsApp</a>.</p>
      </div>`;
  }
}

// Update filter badges dynamically based on backend data
function updateSidebarBrandBadges() {
  const brands = {};
  PRODUCTS.forEach(p => {
    brands[p.marca] = (brands[p.marca] || 0) + 1;
  });

  document.querySelectorAll('[data-filter="marca"]').forEach(checkbox => {
    const brand = checkbox.value;
    const badge = checkbox.nextElementSibling.nextElementSibling;
    if (badge && brands[brand] !== undefined) {
      badge.textContent = brands[brand];
    }
  });
}

// --- FILTERING & RENDERING ---
function getFiltered() {
  let p = [...PRODUCTS];
  const q = state.search.toLowerCase().trim();
  if (q) {
    p = p.filter(pr =>
      pr.nombre.toLowerCase().includes(q) ||
      pr.marca.toLowerCase().includes(q) ||
      pr.tags.some(t => t.toLowerCase().includes(q)) ||
      pr.usos.some(u => u.toLowerCase().includes(q)) ||
      pr.subcategoria.toLowerCase().includes(q)
    );
  }
  if (state.category) p = p.filter(pr => pr.categoria === state.category);
  if (state.marcas.length) p = p.filter(pr => state.marcas.includes(pr.marca));
  if (state.presentaciones.length) p = p.filter(pr => pr.presentaciones.some(pres => state.presentaciones.some(sf => pres.includes(sf.replace('ml', '').replace('L', '').trim()))));
  if (state.stock.length) p = p.filter(pr => state.stock.includes(pr.stock));
  if (state.sort === 'az') p.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (state.sort === 'za') p.sort((a, b) => b.nombre.localeCompare(a.nombre));
  if (state.sort === 'marca') p.sort((a, b) => a.marca.localeCompare(b.marca));
  return p;
}

function renderProducts() {
  const products = getFiltered();
  const grid = document.getElementById('products-grid');
  const resultsInfo = document.getElementById('results-info');

  if (resultsInfo) {
    resultsInfo.innerHTML = `<strong>${products.length}</strong> producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`;
  }

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state"><strong>Sin resultados</strong><p>Probá con otro término o <a href="https://wa.me/59899000000?text=Hola%2C%20busco%20un%20producto" target="_blank" style="color:var(--accent)">consultanos por WhatsApp</a>.</p></div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img">
        <span style="font-size:52px">${p.emoji}</span>
        ${p.stock === 'consultar' ? `<div class="product-badge stock-bajo">Consultar stock</div>` : `<div class="product-badge">Disponible</div>`}
      </div>
      <div class="product-body">
        <div class="product-brand">${p.marca}</div>
        <div class="product-name">${p.nombre}</div>
        <div class="product-meta">
          ${p.tags.slice(0, 3).map(t => `<span class="product-tag">${t}</span>`).join('')}
        </div>
        <div class="product-presentations">
          ${p.presentaciones.map(pres => `<span class="presentation-pill">${pres}</span>`).join('')}
        </div>
        <div class="product-actions" onclick="event.stopPropagation()">
          <div class="card-cart-ctrls">
            <select class="card-presentation-select" id="pres-select-${p.id}" title="Seleccionar presentación">
              ${p.presentaciones.map(pres => `<option value="${pres}">${pres}</option>`).join('')}
            </select>
            <button class="btn-add-card" onclick="handleAddCardClick(${p.id})" title="Agregar al carrito">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </button>
          </div>
          <button class="btn-detail" onclick="openModal(${p.id})">Ver ficha</button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- CART ACTIONS & PERSISTENCE ---
function saveCart() {
  localStorage.setItem('sualbor_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, presentation, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId && item.presentation === presentation);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({
      id: productId,
      nombre: product.nombre,
      marca: product.marca,
      emoji: product.emoji,
      presentation: presentation,
      quantity: qty
    });
  }

  // Animar badge del carrito
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // Trigger reflow
    badge.classList.add('bump');
  }

  saveCart();
}

function removeFromCart(productId, presentation) {
  cart = cart.filter(item => !(item.id === productId && item.presentation === presentation));
  saveCart();
}

function updateQuantity(productId, presentation, delta) {
  const item = cart.find(item => item.id === productId && item.presentation === presentation);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId, presentation);
  } else {
    saveCart();
  }
}

function toggleCart(open) {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');

  if (open) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  const totalCountEl = document.getElementById('cart-total-count');
  const cartList = document.getElementById('cart-items-list');

  if (badge) badge.textContent = totalQty;
  if (totalCountEl) totalCountEl.textContent = totalQty;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">El carrito está vacío</div>
        <button class="btn-detail" style="margin-top:8px" onclick="toggleCart(false)">Seguir buscando</button>
      </div>`;
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-brand">${item.marca}</div>
        <div class="cart-item-name" title="${item.nombre}">${item.nombre}</div>
        <div class="cart-item-presentation">Presentación: ${item.presentation}</div>
        <div class="cart-item-actions">
          <div class="cart-qty-ctrl">
            <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, '${item.presentation}', -1)">-</button>
            <div class="cart-qty-val">${item.quantity}</div>
            <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, '${item.presentation}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.presentation}')">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Handle Add Click from Product Card
function handleAddCardClick(productId) {
  const select = document.getElementById('pres-select-' + productId);
  if (!select) return;
  const presentation = select.value;
  addToCart(productId, presentation, 1);

  // Feedback visual rápido al botón
  const btn = select.nextElementSibling;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '✓';
  btn.style.backgroundColor = 'var(--green)';
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.backgroundColor = '';
  }, 1000);
}

// --- CHECKOUT WHATSAPP ---
function checkoutWhatsApp() {
  if (cart.length === 0) return;

  let message = `📦 *Consulta de Stock y Pedido - Sualbor*\n\n`;
  message += `Hola Sualbor, quisiera consultar disponibilidad de los siguientes productos del catálogo:\n\n`;

  cart.forEach(item => {
    message += `• *${item.quantity}x* ${item.nombre} (Marca: ${item.marca}) [*${item.presentation}*]\n`;
  });

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  message += `\n------------------------------\n`;
  message += `*Total de Artículos:* ${totalQty}\n\n`;
  message += `Agradezco me confirmen stock disponible y costo total de estos insumos. ¡Muchas gracias!`;

  const encodedMsg = encodeURIComponent(message);
  const targetNumber = '59899000000'; // Número de WhatsApp de Sualbor
  window.open(`https://wa.me/${targetNumber}?text=${encodedMsg}`, '_blank');
}

// --- MISSING UTILITY FUNCTIONS ---

function closeModalDirect() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function handleSearch(value) {
  state.search = value;
  // Sync nav search input
  const navInput = document.getElementById('nav-search-input');
  if (navInput && navInput.value !== value) navInput.value = value;
  renderProducts();
}

function handleNavSearch(value) {
  state.search = value;
  // Sync main search input
  const mainInput = document.getElementById('main-search');
  if (mainInput && mainInput.value !== value) mainInput.value = value;
  renderProducts();
  // Scroll to catalog section
  const catalog = document.getElementById('catalogo');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function filterByCategory(cat) {
  state.category = cat;
  state.search = '';
  state.marcas = [];
  state.presentaciones = [];
  state.stock = [];
  // Uncheck all checkboxes
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
  // Update main search
  const mainInput = document.getElementById('main-search');
  if (mainInput) mainInput.value = '';
  // Highlight active category card
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.cat-card[data-cat="${cat}"]`);
  if (activeCard) activeCard.classList.add('active');
  renderProducts();
  // Scroll to catalog
  const catalog = document.getElementById('catalogo');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function applyFilters() {
  state.marcas = [];
  state.presentaciones = [];
  state.stock = [];

  document.querySelectorAll('[data-filter="marca"]:checked').forEach(cb => state.marcas.push(cb.value));
  document.querySelectorAll('[data-filter="presentacion"]:checked').forEach(cb => state.presentaciones.push(cb.value));
  document.querySelectorAll('[data-filter="stock"]:checked').forEach(cb => state.stock.push(cb.value));

  renderProducts();
}

function clearFilters() {
  state.search = '';
  state.category = '';
  state.marcas = [];
  state.presentaciones = [];
  state.stock = [];
  state.sort = 'default';

  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
  const mainInput = document.getElementById('main-search');
  if (mainInput) mainInput.value = '';
  const navInput = document.getElementById('nav-search-input');
  if (navInput) navInput.value = '';
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) sortSelect.value = 'default';
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));

  renderProducts();
}

function sortProducts(value) {
  state.sort = value;
  renderProducts();
}

function filterByBrand(btn, brand) {
  // Update active button style
  document.querySelectorAll('.brand-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  state.marcas = brand ? [brand] : [];
  state.category = '';
  state.search = '';
  // Uncheck all marca checkboxes
  document.querySelectorAll('[data-filter="marca"]').forEach(cb => {
    cb.checked = brand ? cb.value === brand : false;
  });

  renderProducts();
  const catalog = document.getElementById('catalogo');
  if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
}

function showAll() {
  clearFilters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

function submitForm() {
  const nombre = document.getElementById('f-nombre')?.value.trim();
  const tel = document.getElementById('f-tel')?.value.trim();
  const msg = document.getElementById('f-msg')?.value.trim();

  if (!nombre || !tel || !msg) {
    alert('Por favor completá todos los campos antes de enviar.');
    return;
  }

  const waMsg = encodeURIComponent(
    `Hola Sualbor, les escribe *${nombre}*.\n📞 Contacto: ${tel}\n\n*Consulta:*\n${msg}`
  );
  window.open(`https://wa.me/59899000000?text=${waMsg}`, '_blank');
}

// --- MODAL CONTROLLERS ---
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  // Set Temp Modal State
  modalTempState.productId = id;
  modalTempState.presentation = p.presentaciones[0];
  modalTempState.quantity = 1;

  document.getElementById('modal-brand').textContent = p.marca;
  document.getElementById('modal-title').textContent = p.nombre;
  document.getElementById('modal-img').textContent = p.emoji;

  // Specs and uses
  document.getElementById('modal-specs').innerHTML = `
    <div class="spec-item"><div class="spec-label">Diluyente</div><div class="spec-value">${p.diluyente}</div></div>
    <div class="spec-item"><div class="spec-label">Secado / repintado</div><div class="spec-value" style="font-size:13px;margin-top:4px">${p.secado}</div></div>
    <div class="spec-item"><div class="spec-label">Stock</div><div class="spec-value" style="color:${p.stock === 'disponible' ? 'var(--green)' : 'var(--gold)'}">${p.stock === 'disponible' ? '✓ Disponible' : 'Consultar'}</div></div>
    <div class="spec-item"><div class="spec-label">Categoría</div><div class="spec-value">${p.subcategoria}</div></div>
  `;
  document.getElementById('modal-uses').innerHTML = p.usos.map(u => `<span class="use-tag">${u}</span>`).join('');
  document.getElementById('modal-wsp-btn').href = wspLink(p);

  // Render Modal Presentations and Cart actions
  renderModalPresentations(p);
  renderModalCartActions();

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalPresentations(product) {
  const container = document.getElementById('modal-presentations');
  container.innerHTML = product.presentaciones.map(pres => `
    <div class="presentation-modal-option ${pres === modalTempState.presentation ? 'selected' : ''}" onclick="selectModalPresentation('${pres}')">
      ${pres}
    </div>
  `).join('');
}

function renderModalCartActions() {
  const container = document.getElementById('modal-cart-actions-container');
  container.innerHTML = `
    <div class="qty-selector-modal">
      <button class="qty-modal-btn" onclick="updateModalQty(-1)">-</button>
      <div class="qty-modal-val" id="modal-qty-val">${modalTempState.quantity}</div>
      <button class="qty-modal-btn" onclick="updateModalQty(1)">+</button>
    </div>
    <button class="btn-add-modal" onclick="addFromModalToCart()">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      Agregar al carrito
    </button>
  `;
}

function selectModalPresentation(pres) {
  modalTempState.presentation = pres;
  const product = PRODUCTS.find(p => p.id === modalTempState.productId);
  renderModalPresentations(product);
}

function updateModalQty(delta) {
  modalTempState.quantity = Math.max(1, modalTempState.quantity + delta);
  const qtyValEl = document.getElementById('modal-qty-val');
  if (qtyValEl) qtyValEl.textContent = modalTempState.quantity;
}

function addFromModalToCart() {
  addToCart(modalTempState.productId, modalTempState.presentation, modalTempState.quantity);
  closeModalDirect();
  toggleCart(true); // Abrir el carrito para dar feedback inmediato al usuario
}

function wspLink(p) {
  const msg = encodeURIComponent(`Hola, quiero consultar por ${p.nombre} (${p.marca}). ¿Tienen en stock?`);
  return `https://wa.me/59899000000?text=${msg}`;
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}

// Ensure globally accessible
window.selectModalPresentation = selectModalPresentation;
window.updateModalQty = updateModalQty;
window.addFromModalToCart = addFromModalToCart;
window.toggleCart = toggleCart;
window.checkoutWhatsApp = checkoutWhatsApp;
window.handleAddCardClick = handleAddCardClick;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalDirect = closeModalDirect;
window.handleSearch = handleSearch;
window.handleNavSearch = handleNavSearch;
window.filterByCategory = filterByCategory;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.sortProducts = sortProducts;
window.filterByBrand = filterByBrand;
window.showAll = showAll;
window.toggleMobileMenu = toggleMobileMenu;
window.submitForm = submitForm;

// Key events
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalDirect(); });

// Run init
init();
