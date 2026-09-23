const RESTAURANT_PHONE = "2347081485609";
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
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

                categorySection.style.display = visibleCardsInSectionCount > 0 ? "block" : "none";
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
                if (tabBtns.length > 0) tabBtns[0].classList.add("active");
                filterCatalog();
            });
        }
    }

    if (cartToggleBadge && cartDrawer && closeCartBtn) {
        cartToggleBadge.addEventListener("click", () => cartDrawer.classList.add("open"));
        closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("open"));
    }

    if (productCards.length > 0) {
        productCards.forEach(card => {
            const minusBtn = card.querySelector(".minus-btn");
            const plusBtn = card.querySelector(".plus-btn");
            const qtyInput = card.querySelector(".quantity-input");
            const addBtn = card.querySelector(".add-to-cart-btn");
            
            const name = card.getAttribute("data-name");
            const price = parseFloat(card.getAttribute("data-price"));

            if (plusBtn && qtyInput) {
                plusBtn.addEventListener("click", () => {
                    let currentVal = parseFloat(qtyInput.value);
                    qtyInput.value = (currentVal + 0.5).toFixed(1);
                });
            }

            if (minusBtn && qtyInput) {
                minusBtn.addEventListener("click", () => {
                    let currentVal = parseFloat(qtyInput.value);
                    if (currentVal > 0.5) {
                        qtyInput.value = (currentVal - 0.5).toFixed(1);
                    }
                });
            }

            if (addBtn && qtyInput) {
                addBtn.addEventListener("click", () => {
                    let yards = parseFloat(qtyInput.value);
                    const existing = cart.find(item => item.name === name);
                    if (existing) {
                        existing.quantity += yards;
                    } else {
                        cart.push({ name, price, quantity: yards });
                    }
                    renderCart();
                    qtyInput.value = "1.0";
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
        let totalUnitsCount = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            grandTotal += subtotal;
            totalUnitsCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
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
        if (cartCountBadge) cartCountBadge.innerText = totalUnitsCount.toFixed(1);
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

            messageText += `\n💰 *Total Invoice Balance:* ₦${billingTotal.toLocaleString()}\n\nRequesting automatic billing payment link settlement details...`;
            window.location.href = "https://wa.me" + RESTAURANT_PHONE + "?text=" + encodeURIComponent(messageText);
        });
    }

    const animateElements = document.querySelectorAll('.food-card, .menu-category');
    if (animateElements.length > 0) {
        animateElements.forEach(el => el.classList.add('scroll-reveal'));
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.01, rootMargin: "0px 0px 40px 0px" });

        animateElements.forEach(el => scrollObserver.observe(el));
        setTimeout(() => {
            animateElements.forEach(el => {
                if (!el.classList.contains('visible')) el.classList.add('visible');
            });
        }, 800);
    }
});
