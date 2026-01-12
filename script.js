// ==================== Variáveis / Elementos ====================
const menu = document.getElementById("menu"); // só usar se precisar; eventos usam delegation abaixo
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");

const sizeModal = document.getElementById("sizeModal");
const productModalImg = document.getElementById("productModalImg");
const sizeOptionsContainer = document.getElementById("sizeOptionsContainer");
const cancelSizeBtn = document.getElementById("cancelSizeBtn");

const nameInput = document.getElementById("name");
const cellphoneInput = document.getElementById("cellphone");
const addressInput = document.getElementById("address");
const addressContainer = document.getElementById("address-container");
const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');

let cart = [];
let selectedProduct = null; // { name: string, price: number, img: string }

// ==================== Helpers ====================
function toNumber(v, fallback = 0) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function formatBRL(n) {
  return `R$ ${n.toFixed(2)}`;
}

function updateCartCountAndTotal() {
  const count = cart.reduce((acc, i) => acc + (i.quantity || 0), 0);
  cartCounter.textContent = String(count);
  const total = cart.reduce((acc, i) => acc + (toNumber(i.price) * (i.quantity || 0)), 0);
  cartTotalEl.textContent = cart.length > 0 ? formatBRL(total) : "R$ 0.00";
}

// ==================== Abrir modal de tamanhos (delegation) ====================
// Ao clicar num botão .add-to-cart-btn avaliamos data-has-size
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart-btn");
  if (!addBtn) return;

  const name = String(addBtn.dataset.name || "Produto");
  const rawPrice = addBtn.dataset.price;
  const price = toNumber(rawPrice, 0);
  const hasSize = String(addBtn.dataset.hasSize || "false") === "true";

  // tenta pegar img dentro do mesmo bloco .flex (ou primeira img próxima)
  const parentFlex = addBtn.closest(".flex");
  const imgEl = parentFlex ? parentFlex.querySelector("img") : null;
  const imgSrc = imgEl ? imgEl.src : "./assets/pizzagraulogo.jpg";

  if (hasSize) {
    openSizeModal(name, price, imgSrc);
  } else {
    // item sem tamanho: adiciona direto
    addToCart(name, price, null);
    Toastify({
      text: `✅ ${name} adicionada ao carrinho!`,
      duration: 2000,
      gravity: "top",
      position: "right",
      style: { background: "#22c55e" }
    }).showToast();
  }
});

// ==================== openSizeModal ====================
function openSizeModal(name, price, img) {
  selectedProduct = { name: String(name), price: toNumber(price, 0), img: img || "./assets/pizzagraulogo.jpg" };
  // mostra modal
  sizeModal.classList.remove("hidden");
  // preencher imagem e nome
  if (productModalImg) {
    productModalImg.src = selectedProduct.img;
    productModalImg.alt = selectedProduct.name;
  }
  const modalNameEl = document.getElementById("modalProductName");
  if (modalNameEl) modalNameEl.textContent = selectedProduct.name;

  // tamanhos definidos: P = 30.00 (fixo), G = preço original
  const sizes = [
    { label: "P", price: 30.0 },
    { label: "G", price: selectedProduct.price }
  ];

  sizeOptionsContainer.innerHTML = sizes.map(s => {
    const p = toNumber(s.price, 0);
    return `
      <div class="flex flex-col items-center justify-center">
        <button
          data-size="${s.label}"
          data-price="${p}"
          class="option w-16 h-16 rounded-full bg-yellow-500 text-black text-2xl font-bold shadow-md
                hover:bg-yellow-600 hover:scale-110 transition-all duration-200
                flex items-center justify-center">
          ${s.label}
        </button>

        <p class="mt-2 text-sm font-semibold text-gray-700">
          ${formatBRL(p)}
        </p>
      </div>
    `;
  }).join("");
}

// ==================== Seleção de tamanho (delegation) ====================
sizeOptionsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".option");
  if (!btn) return;

  const size = String(btn.dataset.size || "G");
  const sizePrice = toNumber(btn.dataset.price, 0);

  // Segurança: selectedProduct deve existir
  const prodName = selectedProduct && selectedProduct.name ? String(selectedProduct.name) : "Produto";
  addToCart(prodName, sizePrice, size);

  sizeModal.classList.add("hidden");
  selectedProduct = null;

  Toastify({
    text: `✅ ${prodName} (${size}) adicionado ao carrinho!`,
    duration: 2000,
    gravity: "top",
    position: "right",
    style: { background: "#22c55e" }
  }).showToast();
});

// ==================== fechar modal ====================
cancelSizeBtn.addEventListener("click", () => {
  sizeModal.classList.add("hidden");
  selectedProduct = null;
});
sizeModal.addEventListener("click", (e) => {
  if (e.target === sizeModal) {
    sizeModal.classList.add("hidden");
    selectedProduct = null;
  }
});

// ==================== adicionar ao carrinho (robusto) ====================
function addToCart(name, price, size = null) {
  const safeName = typeof name === "string" ? name : JSON.stringify(name);
  const safePrice = toNumber(price, 0);
  const safeSize = size === null ? null : String(size);

  const existing = cart.find(i => i.name === safeName && (i.size || null) === safeSize);
  if (existing) {
    existing.quantity = (existing.quantity || 0) + 1;
  } else {
    cart.push({ name: safeName, price: safePrice, size: safeSize, quantity: 1 });
  }

  updateCartModal();
  updateCartCountAndTotal();
}

// ==================== render do carrinho ====================
function updateCartModal() {
  cartItemsContainer.innerHTML = "";

  cart.forEach(item => {
    const sizeText = item.size ? `<p class="text-sm text-gray-500">Tamanho: ${item.size}</p>` : "";
    const line = document.createElement("div");
    line.className = "flex justify-between items-center w-full mb-4 border-b border-gray-200 pb-3";

    line.innerHTML = `
      <div>
        <p class="font-medium">${item.name}</p>
        ${sizeText}
        <p>${item.quantity}x</p>
        <p class="font-bold">${formatBRL(toNumber(item.price,0) * item.quantity)}</p>
      </div>
      <div>
        <button class="remove-item-btn bg-red-500 text-white px-4 py-1 rounded">Remover</button>
      </div>
    `;

    // remover botão
    line.querySelector(".remove-item-btn").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart = cart.filter(ci => !(ci.name === item.name && (ci.size || null) === (item.size || null)));
      }
      updateCartModal();
      updateCartCountAndTotal();
    });

    cartItemsContainer.appendChild(line);
  });

  updateCartCountAndTotal();
}

// ==================== MODAL CARRINHO ====================
cartBtn.addEventListener("click", () => { cartModal.style.display = "flex"; updateCartModal(); });
closeModalBtn.addEventListener("click", () => { cartModal.style.display = "none"; });
cartModal.addEventListener("click", (e) => { if (e.target === cartModal) cartModal.style.display = "none"; });

// ==================== endereço (mostrar/ocultar) ====================
function updateAddressVisibility() {
  const selected = document.querySelector('input[name="deliveryType"]:checked')?.value;
  if (selected === "delivery") {
    addressContainer.classList.remove("hidden");
  } else {
    addressContainer.classList.add("hidden");
    if (addressInput) addressInput.value = "";
  }
}
deliveryTypeRadios.forEach(r => r.addEventListener("change", updateAddressVisibility));
updateAddressVisibility();

// ==================== validação / checkout ====================
function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10;
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) { alert("Seu carrinho está vazio!"); return; }

  // validações simples
  if (!nameInput.value.trim()) { alert("Informe seu nome"); nameInput.focus(); return; }
  if (!isValidPhone(cellphoneInput.value)) { alert("Informe telefone válido"); cellphoneInput.focus(); return; }
  const selectedDelivery = document.querySelector('input[name="deliveryType"]:checked')?.value;
  if (selectedDelivery === "delivery" && !addressInput.value.trim()) { alert("Informe endereço"); addressInput.focus(); return; }

    const itemsText = cart.map(item => {
    return `✅ ${item.name} (${item.size || "Único"}) – ${item.quantity}x – ${formatBRL(item.price * item.quantity)}`;
  }).join("\n");

  const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const deliveryText =
    selectedDelivery === "delivery"
      ? `🚚 *Forma de entrega:* Delivery\n📍 *Endereço:* ${addressInput.value}`
      : `🚶 *Forma de entrega:* Retirada no local`;

  const message = `
  🍕 *NOVO PEDIDO – PIZZA GRAU*

  📦 *Itens do pedido:*
  ${itemsText}

  💰 *Total:* ${formatBRL(total)}

  ${deliveryText}

  👤 *Cliente:* ${nameInput.value}
  📞 *Contato:* ${cellphoneInput.value}

  📝 Pedido enviado via cardápio online
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const phone = "+5547984179856";

  window.open(
    `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`,
    "_blank"
  );


  // limpa
  cart = [];
  updateCartModal();
  updateCartCountAndTotal();
  cartModal.style.display = "none";
  nameInput.value = cellphoneInput.value = addressInput.value = "";
  updateAddressVisibility();
});

// ==================== horário funcionamento visual ====================
(function updateOpenBadge() {
  const spanItem = document.getElementById("date-span");
  if (!spanItem) return;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado

  const isOpenDay = day !== 1; // fechado na segunda
  const isOpenHour = hour >= 18 && hour < 23;

  if (isOpenDay && isOpenHour) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
  } else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
  }
})();