// --- INITIAL DATA (Fallbacks) ---
const initialProducts = [
    {
        id: 1,
        title: "Panel LED Quantum 240W",
        category: "iluminacion",
        price: 350,
        desc: "Luz de espectro completo ideal para ciclo completo. Chips Samsung LM301B.",
        img: "https://images.unsplash.com/photo-1565507316719-72f5348ab692?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Pack Nutrientes Flora & Vege",
        category: "nutrientes",
        price: 45,
        desc: "Solución completa para crecimiento y floración explosiva. 500ml c/u.",
        img: "https://images.unsplash.com/photo-1584820927498-cafe2c1c6a26?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Carpa Indoor 80x80x160",
        category: "carpas",
        price: 120,
        desc: "Mylar reflectivo 600D, estructura metálica resistente y cierres reforzados.",
        img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Kit Semillas Autoflorecientes x3",
        category: "semillas",
        price: 30,
        desc: "Genéticas de alta producción y rápida cosecha. (Coleccionismo)",
        img: "https://images.unsplash.com/photo-1607530663673-f1ba5a9d8c97?q=80&w=600&auto=format&fit=crop"
    }
];

const initialCategories = ["iluminacion", "nutrientes", "carpas", "semillas", "accesorios"];

// --- STATE MANAGEMENT ---
let products = JSON.parse(localStorage.getItem('laCarpa_products')) || initialProducts;
let categories = JSON.parse(localStorage.getItem('laCarpa_categories')) || initialCategories;
let cart = [];

// --- DOM ELEMENTS ---
const productsGrid = document.getElementById('products-grid');
const filtersContainer = document.getElementById('filters');
const cartToggleBtn = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartTotalPrice = document.getElementById('cart-total-price');

// Admin Elements
const adminSection = document.getElementById('admin-section');
const adminLoginLink = document.getElementById('admin-login-link');
const closeAdminBtn = document.getElementById('close-admin');
const categoryForm = document.getElementById('category-form');
const productForm = document.getElementById('product-form');
const adminCategoryList = document.getElementById('admin-category-list');
const adminProductList = document.getElementById('admin-product-list');
const productCategorySelect = document.getElementById('product-category-select');
const cancelEditBtn = document.getElementById('cancel-edit');

// --- CORE FUNCTIONS ---
function init() {
    renderFilters();
    renderProducts(products);
    setupCartToggle();
    setupAdmin();
    updateCartUI();
}

function saveData() {
    localStorage.setItem('laCarpa_products', JSON.stringify(products));
    localStorage.setItem('laCarpa_categories', JSON.stringify(categories));
}

// --- RENDER FUNCTIONS ---
function renderFilters() {
    filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">Todo</button>';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', cat);
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        filtersContainer.appendChild(btn);
    });
    setupFilterListeners();
}

function renderProducts(items) {
    productsGrid.innerHTML = '';
    if (items.length === 0) {
        productsGrid.innerHTML = '<p class="w-100 text-center">No hay productos disponibles.</p>';
        return;
    }
    
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card glass';
        card.innerHTML = `
            <div class="product-img">
                <span class="product-category">${product.category.toUpperCase()}</span>
                <img src="${product.img}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.desc}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <button class="btn-add" onclick="addToCart(${product.id})" aria-label="Agregar al carrito">
                        <i class="ph-bold ph-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function setupFilterListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            const filtered = filterValue === 'all' ? products : products.filter(p => p.category === filterValue);
            renderProducts(filtered);
        });
    });
}

// --- CART LOGIC ---
function setupCartToggle() {
    cartToggleBtn.addEventListener('click', () => { cartSidebar.classList.add('open'); cartOverlay.classList.add('show'); });
    closeCartBtn.addEventListener('click', () => { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('show'); });
    cartOverlay.addEventListener('click', () => { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('show'); });
}

window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    updateCartUI();
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => cartBadge.style.transform = 'scale(1)', 300);
}

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

window.changeQuantity = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(productId);
        else updateCartUI();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-img"><img src="${item.img}" alt="${item.title}"></div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-actions">
                        <span class="cart-item-price">$${item.price}</span>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)"><i class="ph ph-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)"><i class="ph ph-plus"></i></button>
                        </div>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="ph-bold ph-trash"></i></button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `$${total}`;
}

// --- ADMIN LOGIC ---
const ADMIN_PASSWORD = "carpa_tech_2026"; // Contraseña de acceso

function setupAdmin() {
    adminLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        const pass = prompt("Ingrese la clave de administrador para continuar:");
        
        if (pass === ADMIN_PASSWORD) {
            adminSection.classList.remove('hidden');
            renderAdminUI();
            // Scroll to admin section
            adminSection.scrollIntoView({ behavior: 'smooth' });
        } else if (pass !== null) {
            alert("Acceso denegado. Clave incorrecta.");
        }
    });

    closeAdminBtn.addEventListener('click', () => adminSection.classList.add('hidden'));

    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCat = document.getElementById('new-category').value.toLowerCase().trim();
        if (newCat && !categories.includes(newCat)) {
            categories.push(newCat);
            saveData();
            renderAdminUI();
            renderFilters();
            categoryForm.reset();
        }
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const cat = document.getElementById('product-category-select').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const desc = document.getElementById('product-desc').value;
        const img = document.getElementById('product-img-url').value;

        if (id) {
            // Edit
            const index = products.findIndex(p => p.id == id);
            products[index] = { id: parseInt(id), title: name, category: cat, price, desc, img };
        } else {
            // Add
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, title: name, category: cat, price, desc, img });
        }

        saveData();
        renderAdminUI();
        renderProducts(products);
        productForm.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-submit-btn').textContent = 'Guardar Producto';
        cancelEditBtn.classList.add('hidden');
    });

    cancelEditBtn.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-submit-btn').textContent = 'Guardar Producto';
        cancelEditBtn.classList.add('hidden');
    });
}

function renderAdminUI() {
    // Categories in Admin
    adminCategoryList.innerHTML = '';
    productCategorySelect.innerHTML = '<option value="" disabled selected>Seleccionar Categoría</option>';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${cat}</span> <button class="btn-icon btn-delete" onclick="deleteCategory('${cat}')"><i class="ph ph-trash"></i></button>`;
        adminCategoryList.appendChild(li);

        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        productCategorySelect.appendChild(opt);
    });

    // Products in Admin Table
    adminProductList.innerHTML = '';
    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.img}" class="admin-table-img"></td>
            <td>${p.title}</td>
            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editProduct(${p.id})"><i class="ph ph-pencil"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteProduct(${p.id})"><i class="ph ph-trash"></i></button>
            </td>
        `;
        adminProductList.appendChild(tr);
    });
}

window.deleteCategory = function(cat) {
    if (confirm(`¿Eliminar la categoría "${cat}"? Los productos asociados quedarán huérfanos.`)) {
        categories = categories.filter(c => c !== cat);
        saveData();
        renderAdminUI();
        renderFilters();
    }
}

window.deleteProduct = function(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderAdminUI();
        renderProducts(products);
    }
}

window.editProduct = function(id) {
    const p = products.find(prod => prod.id === id);
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.title;
    document.getElementById('product-category-select').value = p.category;
    document.getElementById('product-price').value = p.price;
    document.getElementById('product-desc').value = p.desc;
    document.getElementById('product-img-url').value = p.img;
    
    document.getElementById('product-submit-btn').textContent = 'Actualizar Producto';
    cancelEditBtn.classList.remove('hidden');
    productForm.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', init);
