// ==========================================================================
// 1. GLOBAL SYSTEM CONFIGURATIONS
// ==========================================================================
const RESTAURANT_PHONE = "2347081485609"; // Ahmad's target WhatsApp business routing gate
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("TexFlow Core Engine Online. Initializing high-speed catalog systems...");

    // DOM Binds
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
    // 🔍 INTEGRATED DUAL-FILTER ENGINE (Only fires on catalog page)
    // ==========================================================================
    if (searchInput && menuCategories.length > 0) {
        let activeCategory = "all";
        let searchQuery = "";

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

                if (visibleCardsInSectionCount > 0) {
                    categorySection.style.display = "block";
                } else {
                    categorySection.style.display = "none";
                }
            });

            if (searchFallback) {
                searchFallback.style.display = (absoluteTotalVisible === 0) ? "block" : "none";
            }
        }

        searchInput.addEventListener("keyup", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterCatalog();
        });

        tabBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                tabBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                activeCategory = e.target.getAttribute("data-category");
                filterCatalog();
            });
        });

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
    // 🛒 FRACTIONAL DATA BIND SHOPPING CART ENGINE
    // ==========================================================================
    if (cartToggleBadge && cartDrawer && closeCartBtn) {
        cartToggleBadge.addEventListener("click", () => cartDrawer.classList.add("open"));
        closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("open"));
    }
});

    if (productCards.length > 0) {
        productCards.forEach(card => {
            const addBtn = card.querySelector(".add-to-cart-btn");
            const name = card.getAttribute("data-name");
            const price = parseFloat(card.getAttribute("data-price"));

            if (addBtn && addBtn.tagName === "BUTTON") {
                addBtn.addEventListener("click", () => {
                    // Prompt to request fine decimal entries seamlessly
                    let requestedYards = prompt(`Enter quantity/yards for ${name} (e.g., 1.5, 3, 4.25):`, "1");
                    let yards = parseFloat(requestedYards);

                    if (isNaN(yards) || yards <= 0) {
                        alert("Invalid quantity entry. Please input a metric greater than 0.");
                        return;
                    }

                    const existing = cart.find(item => item.name === name);
                    if (existing) {
                        existing.quantity += yards;
                    } else {
                        cart.push({ name, price, quantity: yards });
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
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your materials basket is empty.</p>';
            if (cartTotalPriceEl) cartTotalPriceEl.innerText = "₦0";
            if (cartCountBadge) cartCountBadge.innerText = "0";
            if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = true;
            return;
        }

        let grandTotal = 0;
        let totalUnitsCount = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            grandTotal += subtotal;
            totalUnitsCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            // 🟢 Render decimals beautifully up to two fractions using toFixed()
            row.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span>${item.quantity.toFixed(1)} yards @ ₦${item.price.toLocaleString()}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span style="font-weight:600; margin-right:12px;">₦${subtotal.toLocaleString()}</span>
                    <button class="remove-btn" data-name="${item.name}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        if (cartTotalPriceEl) cartTotalPriceEl.innerText = `₦${grandTotal.toLocaleString()}`;
        if (cartCountBadge) cartCountBadge.innerText = totalUnitsCount.toFixed(1); // Fractional count support
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
                messageText += `${index + 1}. *${item.name}* (${item.quantity.toFixed(1)} yards) - ₦${itemSub.toLocaleString()}\n`;
            });

            messageText += `\n💰 *Total Invoice Balance:* ₦${billingTotal.toLocaleString()}\n\nRequesting account routing transaction coordinates...`;
            window.location.href = "https://wa.me" + RESTAURANT_PHONE + "?text=" + encodeURIComponent(messageText);
        });
    }

        // ==========================================================================
    // 🚀 FOOLPROOF SCROLL FLUIDITY VISUAL ANIMATION ENGINE 
    // ==========================================================================
    const animateElements = document.querySelectorAll('.food-card, .menu-category');
    
    if (animateElements.length > 0) {
        // Prepare elements with the base hidden state
        animateElements.forEach(el => el.classList.add('scroll-reveal'));

        // High-compatibility Intersection Observer configuration
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Trigger hardware float up
                    scrollObserver.unobserve(entry.target); // Free memory footprint
                }
            });
        }, { 
            threshold: 0.01,        /* Trigger as soon as even 1% of the card peeks onto the screen */
            rootMargin: "0px 0px 50px 0px" /* Pre-loads the animation slightly before it scrolls into view */
        });

        animateElements.forEach(el => scrollObserver.observe(el));

        // 🟢 FAIL-SAFE: If the user has animations turned off or browser lags, show them instantly
        setTimeout(() => {
            animateElements.forEach(el => {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                }
            });
        }, 800);
    }
