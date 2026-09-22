// ==========================================================================
// 1. GLOBAL SYSTEM CONFIGURATIONS
// ==========================================================================
const RESTAURANT_PHONE = "2347081485609"; // Ahmad's target WhatsApp number
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded securely. Initializing multi-page layout engine...");

    // DOM Element Selections
    const searchInput = document.getElementById("catalog-search");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const menuCategories = document.querySelectorAll(".menu-category");
    const productCards = document.querySelectorAll(".food-card");

    const cartDrawer = document.getElementById("cart-drawer");
    const cartToggleBadge = document.getElementById("floating-cart-badge");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPriceEl = document.getElementById("cart-total-price");
    const cartCountBadge = document.getElementById("cart-count");
    const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");

    const searchFallback = document.getElementById("search-fallback");
    const resetCatalogBtn = document.getElementById("reset-catalog-btn");

    // ==========================================================================
    // 🔍 CONDITIONAL CATALOG SEARCH & FILTER MODULE (Only runs on catalog.html)
    // ==========================================================================
    if (searchInput && menuCategories.length > 0) {
        let activeCategory = "all";
        let searchQuery = "";

        // Read incoming homepage category variables (?category=laces)
        const urlParams = new URLSearchParams(window.location.search);
        const routedCategory = urlParams.get("category");

        if (routedCategory) {
            activeCategory = routedCategory;
            tabBtns.forEach(btn => {
                if (btn.getAttribute("data-category") === routedCategory) {
                    tabBtns.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                }
            });
            filterCatalog();
        }

        function filterCatalog() {
            let absoluteTotalVisible = 0;

            menuCategories.forEach(categorySection => {
                const cardsInSection = categorySection.querySelectorAll(".food-card");
                let visibleCardsInSectionCount = 0;

                cardsInSection.forEach(card => {
                    const productName = card.getAttribute("data-name").toLowerCase();
                    const productCategory = card.getAttribute("data-category");

                    const matchesSearch = productName.includes(searchQuery);
                    const matchesCategory = (activeCategory === "all") || (productCategory === activeCategory);

                    if (matchesSearch && matchesCategory) {
                        card.style.display = "block";
                        visibleCardsInSectionCount++;
                        absoluteTotalVisible++;
                    } else {
                        card.style.display = "none";
                    }
                });

                // Toggle visibility of the category section banner header
                if (visibleCardsInSectionCount > 0) {
                    categorySection.style.display = "block";
                } else {
                    categorySection.style.display = "none";
                }
            });

            // Toggle empty search fallback UI card view
            if (searchFallback) {
                if (absoluteTotalVisible === 0) {
                    searchFallback.style.display = "block";
                } else {
                    searchFallback.style.display = "none";
                }
            }
        }

        // Keystroke listeners
        searchInput.addEventListener("keyup", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterCatalog();
        });

        // Tab selection click listeners
        tabBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                tabBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                activeCategory = e.target.getAttribute("data-category");
                filterCatalog();
            });
        });

        // Empty state reset button click listener
        if (resetCatalogBtn) {
            resetCatalogBtn.addEventListener("click", () => {
                searchInput.value = "";
                searchQuery = "";
                activeCategory = "all";
                tabBtns.forEach(b => b.classList.remove("active"));
                if (tabBtns[0]) tabBtns[0].classList.add("active");
                filterCatalog();
            });
        }
    }

    // ==========================================================================
    // 🛒 SAFE SHOPPING BASKET DRAWER ENGINE (Only executes if elements exist)
    // ==========================================================================
    if (cartToggleBadge && cartDrawer && closeCartBtn) {
        cartToggleBadge.addEventListener("click", () => cartDrawer.classList.add("open"));
        closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("open"));
    }

    if (productCards.length > 0) {
        productCards.forEach(card => {
            const addBtn = card.querySelector(".add-to-cart-btn");
            const name = card.getAttribute("data-name");
            const price = parseInt(card.getAttribute("data-price"), 10);

            // Ensure we are on the catalog page with an actual buy button before passing listeners
            if (addBtn && addBtn.tagName === "BUTTON") {
                addBtn.addEventListener("click", () => {
                    const existing = cart.find(item => item.name === name);
                    if (existing) {
                        existing.quantity += 1;
                    } else {
                        cart.push({ name, price, quantity: 1 });
                    }
                    renderCart();
                });
            }
        });
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your basket is empty. Select fabrics to build your manifest.</p>';
            if (cartTotalPriceEl) cartTotalPriceEl.innerText = "₦0";
            if (cartCountBadge) cartCountBadge.innerText = "0";
            if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = true;
            return;
        }

        let grandTotal = 0;
        let unitCount = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            grandTotal += subtotal;
            unitCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            row.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span>${item.quantity}x @ ₦${item.price.toLocaleString()}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span style="font-weight:600; margin-right:12px;">₦${subtotal.toLocaleString()}</span>
                    <button class="remove-btn" data-name="${item.name}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        if (cartTotalPriceEl) cartTotalPriceEl.innerText = `₦${grandTotal.toLocaleString()}`;
        if (cartCountBadge) cartCountBadge.innerText = unitCount;
        if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = false;

        cartItemsContainer.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetName = e.target.getAttribute("data-name");
                cart = cart.filter(item => item.name !== targetName);
                renderCart();
            });
        });
    }

    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener("click", () => {
            if (cart.length === 0) return;

            let messageText = "📦 NEW MATERIALS VILLAGE ORDER MANIFEST\n\n";
            let billingTotal = 0;

            cart.forEach((item, index) => {
                const itemSub = item.price * item.quantity;
                billingTotal += itemSub;
                messageText += `${index + 1}. *${item.name}* (${item.quantity} yards) - ₦${itemSub.toLocaleString()}\n`;
            });

            messageText += `\n💰 *Total Invoice Balance:* ₦${billingTotal.toLocaleString()}\n\nRequesting automatic billing payment link settlement details...`;
            
            window.location.href = "https://wa.me" + RESTAURANT_PHONE + "?text=" + encodeURIComponent(messageText);
        });
    }
});
