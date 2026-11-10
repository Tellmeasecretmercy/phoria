/* ============================================
   APPS SCRIPT CONFIG
   ============================================ */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFNSMJtA8r7BYDTbKakNVh1vA-syQ97zjJK663TDf_twGsw_LJ9U6KHz5KmN2kegt5/exec';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgJvBSXRtrxHce2QlObBEmIqrBiFKe2_hpXQa3M5rEuJenpFU4Xwg00a2q2nEyS1Ar/exec';

let inventory = {};

// Load inventory from Google Sheet on page load
async function loadInventory() {
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getInventory`);
        const data = await response.json();
        inventory = data;
        console.log('✅ Inventory loaded:', inventory);
        refreshProductDisplay();
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
        loadLocalInventory();
        refreshProductDisplay();
    }
}

function loadLocalInventory() {
    inventory = {
        1: 7,
        2: 10,
        3: 10,
        4: 10,
        5: 47,
        6: 6,
        7: 5,
        8: 28,
        9: 7,
        10: 10,
        11: 10,
        12: 10
    };
}

/* ============================================
   PRODUCT DATA
   ============================================ */

const products = [
    // BLACK AND WHITE COLLECTION (2 sticks - 1000 KSh)
    {
        id: 9,
        name: 'Breathe Fresh',
        scent: 'Peppermint',
        benefit: 'Focus & Energy',
        price: 1000,
        image: 'images/black and white peppermint.jpeg',
        collection: 'blackandwhite'
    },
    {
        id: 10,
        name: 'Calm Clarity',
        scent: 'Lavender',
        benefit: 'Relaxation & Stress Relief',
        price: 1000,
        image: 'images/Black and white lavender.jpeg',
        collection: 'blackandwhite'
    },
    {
        id: 11,
        name: 'Spiced Warmth',
        scent: 'Cinnamon',
        benefit: 'Mood & Uplift',
        price: 1000,
        image: 'images/black and white cinamon.jpeg',
        collection: 'blackandwhite'
    },
    {
        id: 12,
        name: 'Berry Boost',
        scent: 'Strawberry',
        benefit: 'Wellness & Vitality',
        price: 1000,
        image: 'images/black and white strawberry.jpeg',
        collection: 'blackandwhite'
    },

    // WHITE COLLECTION (500 KSh)
    {
        id: 1,
        name: 'Breathe Fresh',
        scent: 'Peppermint',
        benefit: 'Focus & Energy',
        price: 500,
        image: 'images/white peppermint.jpeg',
        collection: 'white'
    },
    {
        id: 2,
        name: 'Calm Clarity',
        scent: 'Lavender',
        benefit: 'Relaxation & Stress Relief',
        price: 500,
        image: 'images/white lavender.jpeg',
        collection: 'white'
    },
    {
        id: 3,
        name: 'Spiced Warmth',
        scent: 'Cinnamon',
        benefit: 'Mood & Uplift',
        price: 500,
        image: 'images/white cinamon.jpeg',
        collection: 'white'
    },
    {
        id: 4,
        name: 'Berry Boost',
        scent: 'Strawberry',
        benefit: 'Wellness & Vitality',
        price: 500,
        image: 'images/white strawberry.jpeg',
        collection: 'white'
    },

    // BLACK COLLECTION (500 KSh)
    {
        id: 5,
        name: 'Breathe Fresh',
        scent: 'Peppermint',
        benefit: 'Focus & Energy',
        price: 500,
        image: 'images/black peppermint.jpeg',
        collection: 'black'
    },
    {
        id: 6,
        name: 'Calm Clarity',
        scent: 'Lavender',
        benefit: 'Relaxation & Stress Relief',
        price: 500,
        image: 'images/black lavender.jpeg',
        collection: 'black'
    },
    {
        id: 7,
        name: 'Spiced Warmth',
        scent: 'Cinnamon',
        benefit: 'Mood & Uplift',
        price: 500,
        image: 'images/black cinamon.jpeg',
        collection: 'black'
    },
    {
        id: 8,
        name: 'Berry Boost',
        scent: 'Strawberry',
        benefit: 'Wellness & Vitality',
        price: 500,
        image: 'images/black strawberry.jpeg',
        collection: 'black'
    }
];

/* ============================================
   STOCK CHECK FUNCTION
   ============================================ */

function checkStock(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    const stock = inventory[productId] || 0;
    
    if (!product) {
        console.error('❌ Product not found');
        return false;
    }
    
    if (stock <= 0) {
        showNotification(`${product.name} is out of stock`);
        return false;
    }
    
    if (stock < quantity) {
        showNotification(`Only ${stock} ${product.name} available`);
        return false;
    }
    
    return true;
}

function isOutOfStock(productId) {
    const stock = inventory[productId] || 0;
    return stock <= 0;
}

/* ============================================
   CART MANAGEMENT
   ============================================ */

function getCart() {
    const cart = localStorage.getItem('phoriaCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('phoriaCart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    if (!checkStock(productId)) {
        return;
    }
    
    const cart = getCart();
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (!checkStock(productId, existingItem.quantity + 1)) {
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification('✅ Added to cart!');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart();
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            if (!checkStock(productId, quantity)) {
                return;
            }
            item.quantity = quantity;
            saveCart(cart);
            displayCart();
        }
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/* ============================================
   PRODUCT DISPLAY WITH STOCK STATUS
   ============================================ */

function displayProducts(collection) {
    const filteredProducts = products.filter(p => p.collection === collection);
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const stock = inventory[product.id] || 0;
        const outOfStock = stock <= 0;
        
        return `
            <div class="product-card ${outOfStock ? 'out-of-stock' : ''}">
                ${outOfStock ? '<div class="sold-out-badge">SOLD OUT</div>' : ''}
                <div class="product-card-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'" ${outOfStock ? 'style="opacity: 0.5;"' : ''}>
                </div>
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p class="scent">${product.scent}</p>
                    <p class="benefit">${product.benefit}</p>
                    <p class="price">KSh ${product.price}</p>
                    ${outOfStock ? 
                        '<button class="btn btn-outline" style="background: #ccc; color: #666; cursor: not-allowed;" disabled>Out of Stock</button>' :
                        `<button class="btn btn-outline" onclick="addToCart(${product.id})">Add to Cart</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function refreshProductDisplay() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        const collectionTitle = document.getElementById('collectionTitle');
        if (collectionTitle) {
            let collection = 'black';
            if (collectionTitle.textContent.includes('White Collection')) {
                collection = 'white';
            } else if (collectionTitle.textContent.includes('Black & White')) {
                collection = 'blackandwhite';
            }
            displayProducts(collection);
        }
    }
}

/* ============================================
   CART PAGE DISPLAY
   ============================================ */

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cart = getCart();
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <p style="font-size: 1.1rem; color: #999; margin-bottom: 2rem;">Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        if (subtotalEl) subtotalEl.textContent = 'KSh 0';
        if (totalEl) totalEl.textContent = 'KSh 0';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>${item.scent}</p>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-price">KSh ${(item.price * item.quantity).toLocaleString()}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>
    `).join('');
    
    const subtotal = getCartTotal();
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = `KSh ${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `KSh ${subtotal.toLocaleString()}`;
}

/* ============================================
   CHECKOUT PAGE
   ============================================ */

function displayCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const cart = getCart();
    
    if (!checkoutItemsContainer) return;
    
    checkoutItemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>KSh ${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');
    
    const total = getCartTotal();
    const checkoutTotalEl = document.getElementById('checkout-total');
    if (checkoutTotalEl) checkoutTotalEl.textContent = `KSh ${total.toLocaleString()}`;
}

async function handleCheckout(event) {
    event.preventDefault();
    
    console.log('🔍 === CHECKOUT DEBUG START ===');
    
    const cart = getCart();
    console.log('📦 Cart:', cart);
    
    if (cart.length === 0) {
        showNotification('❌ Your cart is empty!');
        return;
    }
    
    // Get form data
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    
    console.log('📋 Form data:', { firstName, lastName, email, phone, address, city });
    
    // DEBUG: Check all radio buttons
    const allRadios = document.querySelectorAll('input[type="radio"]');
    console.log('📻 Total radio buttons on page:', allRadios.length);
    
    // DEBUG: Check payment radios specifically
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    console.log('💳 Payment radios found:', paymentRadios.length);
    paymentRadios.forEach((radio, index) => {
        console.log(`  Radio ${index}: value="${radio.value}", checked=${radio.checked}`);
    });
    
    // Get payment method with fallback
    let paymentMethod = 'mpesa'; // Default
    const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
    
    if (paymentMethodElement) {
        paymentMethod = paymentMethodElement.value;
        console.log('✅ Payment method selected:', paymentMethod);
    } else {
        console.warn('⚠️ No payment method checked, using default: mpesa');
        // Try to auto-select first radio
        const firstRadio = document.querySelector('input[name="payment"]');
        if (firstRadio) {
            firstRadio.checked = true;
            paymentMethod = firstRadio.value;
            console.log('✅ Auto-selected first radio:', paymentMethod);
        }
    }
    
    const total = getCartTotal();
    console.log('💰 Total:', total);
    
    // Build products string
    let productsText = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        productsText += `${item.name} (${item.scent}) x${item.quantity} = KSh ${itemTotal}\n`;
    });
    
    console.log('📝 Products text:', productsText);
    console.log('🔍 === CHECKOUT DEBUG END ===');
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Processing...';
    submitBtn.disabled = true;
    
    try {
        // Prepare FormData
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('paymentMethod', paymentMethod);
        formData.append('products', productsText);
        formData.append('total', total);
        formData.append('cartItems', JSON.stringify(cart));
        
        console.log('🚀 Sending to Apps Script:', APPS_SCRIPT_URL);
        
        // Send to Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('📨 Response from Apps Script:', data);
        
        if (data.success) {
            // Save order locally
            const orderData = {
                orderNumber: data.orderNumber,
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                paymentMethod,
                items: cart,
                total,
                date: new Date().toLocaleDateString()
            };
            localStorage.setItem('phoriaOrder', JSON.stringify(orderData));
            
            // Show success
            showNotification(`✅ Order Received! ${data.orderNumber}`);
            
            // Clear cart
            localStorage.removeItem('phoriaCart');
            updateCartCount();
            
            // Reset form
            event.target.reset();
            
            // Redirect to confirmation
            setTimeout(() => {
                window.location.href = `confirmation.html?orderNumber=${data.orderNumber}`;
            }, 1500);
        } else {
            showNotification(`❌ Error: ${data.error}`);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification(`❌ Error submitting order: ${error}`);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/* ============================================
   CONFIRMATION PAGE
   ============================================ */

function displayConfirmation() {
    const confirmationDetails = document.getElementById('confirmation-details');
    
    if (!confirmationDetails) return;
    
    const orderData = JSON.parse(localStorage.getItem('phoriaOrder'));
    
    if (!orderData) {
        confirmationDetails.innerHTML = '<p>❌ No order found</p>';
        return;
    }
    
    confirmationDetails.innerHTML = `
        <div class="confirmation-detail-row">
            <strong>Order Number:</strong>
            <span>${orderData.orderNumber}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Customer:</strong>
            <span>${orderData.firstName} ${orderData.lastName}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Email:</strong>
            <span>${orderData.email}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Phone:</strong>
            <span>${orderData.phone}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Delivery Address:</strong>
            <span>${orderData.address}, ${orderData.city}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Payment Method:</strong>
            <span>${orderData.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Items:</strong>
            <span>${orderData.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}</span>
        </div>
        <div class="confirmation-detail-row">
            <strong>Total:</strong>
            <span>KSh ${orderData.total.toLocaleString()}</span>
        </div>
    `;
}

/* ============================================
   EMAIL CAPTURE
   ============================================ */

function handleEmailCapture(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    
    const emails = JSON.parse(localStorage.getItem('phoriaEmails') || '[]');
    emails.push({
        email,
        date: new Date().toISOString()
    });
    localStorage.setItem('phoriaEmails', JSON.stringify(emails));
    
    showNotification('✅ Thanks! Check your email for 10% off');
    event.target.reset();
    console.log('📧 Email captured:', email);
}

/* ============================================
   CONTACT FORM
   ============================================ */

function handleContact(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name') || event.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || event.target.querySelector('textarea').value;
    
    const contacts = JSON.parse(localStorage.getItem('phoriaContacts') || '[]');
    contacts.push({
        name,
        email,
        message,
        date: new Date().toISOString()
    });
    localStorage.setItem('phoriaContacts', JSON.stringify(contacts));
    
    showNotification('✅ Message sent! We\'ll get back to you soon');
    event.target.reset();
    console.log('💬 Contact message:', { name, email, message });
}

/* ============================================
   NOTIFICATIONS
   ============================================ */

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #000;
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ============================================
   MOBILE MENU
   ============================================ */

function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (navMenu) {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '60px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.flexDirection = 'column';
        navMenu.style.background = '#fff';
        navMenu.style.padding = '1rem';
        navMenu.style.borderBottom = '1px solid #e0e0e0';
        navMenu.style.gap = '1rem';
    }
}

/* ============================================
   ANIMATIONS
   ============================================ */

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .product-card.out-of-stock {
        opacity: 0.7;
        position: relative;
    }
    
    .sold-out-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #000;
        color: #fff;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        font-weight: bold;
        z-index: 10;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phoria App Initialized');
    
    // Load inventory
    loadInventory();
    
    // Update cart count
    updateCartCount();
    
    // Display cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    // Display checkout items if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutItems();
    }
    
    // Display confirmation if on confirmation page
    if (window.location.pathname.includes('confirmation.html')) {
        displayConfirmation();
    }
});
