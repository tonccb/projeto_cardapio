const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter =document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = []


// Abrir o modal do carrinho
cartBtn.addEventListener("click", () => {
    cartModal.style.display = "flex"    
})

// Fechar o modal do carrinho
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal || event.target === closeModalBtn){
        cartModal.style.display = "none"
    }
})


menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn") // Seleciona o botão pai mais próximo com a classe "add-to-cart-btn"
    
    if(parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))

        addToCart(name, price)

}})

function addToCart(name, price){

    const existingItem = cart.find(item => item.name === name)
    if(existingItem){
        existingItem.quantity += 1
        
    } else {
        cart.push({name, price, quantity:1})
    }

    updateCartModal()
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0)
    
    }
    
function updateCartModal() {
  cartItemsContainer.innerHTML = "";

  let total = 0;
  let itemCount = 0;

  cart.forEach(item => {
    const cartItemsElement = document.createElement("div");
    cartItemsElement.className =
      "flex justify-between items-center w-full mb-6 border-b border-gray-300 pb-3";

    cartItemsElement.innerHTML = `
      <div>
        <p class="font-medium">${item.name}</p>
        <p>${item.quantity}x</p>
        <p class="font-bold">R$ ${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div>
        <button class="bg-red-500 text-white px-5 rounded hover:bg-red-600 duration-200 remove-item-btn">
          Remover
        </button>
      </div>
    `;

    total += item.price * item.quantity;
    itemCount += item.quantity;

    // Funcionalidade de remoção
    const removeBtn = cartItemsElement.querySelector(".remove-item-btn");

    removeBtn.addEventListener("click", () => {
    if (item.quantity > 1) {
        item.quantity -= 1; // Diminui apenas uma unidade
    } else {
        // Remove completamente o item quando a quantidade chega a 1
        cart = cart.filter(cartItem => cartItem.name !== item.name);
    }

    // Atualiza o modal e o contador sempre após a ação
    updateCartModal();
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    });


    cartItemsContainer.appendChild(cartItemsElement);
    });

    // Atualizar total no final do loop
    cartTotal.textContent = cart.length > 0 ? `R$ ${total.toFixed(2)}` : "R$ 0.00"; // se o carrinho estiver vazio, mostrar R$ 0.00
}



addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;


})



// Exibir aviso se o endereço estiver vazio ao tentar finalizar a compra
checkoutBtn.addEventListener("click", () => {
    if(cart.length === 0){
        alert("Seu carrinho está vazio!")
        return;
    }

    if(addressInput.value.trim() === ""){
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    } else {
        addressWarn.style.display = "none";
    }

const isOpen = checkIfOpen()
if(!isOpen){
    Toastify({
  text: "Ops, estamos fechados no momento!",
  duration: 3000,
  destination: "https://github.com/apvarun/toastify-js",
  close: true,
  gravity: "top", // `top` or `bottom`
  position: "right", // `left`, `center` or `right`
  stopOnFocus: true, // Prevents dismissing of toast on hover
  style: {
    background: "#ef4444 ",
  },
  onClick: function(){} // Callback after click
}).showToast();
    return;
}

const cartItems = cart.map((item) => {
  return (
    `✅ ${item.name} - Quantidade: ${item.quantity} - Preço: R$ ${(item.price * item.quantity).toFixed(2)} |`
  );
}).join("\n"); // Une os itens do carrinho em uma única string

const message = encodeURIComponent(cartItems);
const phone = "+5547984179856"; // Substitua pelo número de telefone desejado, incluindo o código do país

window.open(
  `https://api.whatsapp.com/send?phone=${phone}&text=💬 Olá! Quero finalizar meu Pedido:%0A %0A${message}%0A %0A📍 Endereço de entrega: ${addressInput.value}`,
  "_blank"
);

cart = [];
updateCartModal();
cartCounter.textContent = "0";
addressInput.value = "";

})

    function checkIfOpen(){
        const data = new Date();
        const hora = data.getHours();
        return hora >= 18 && hora < 23;

    }

    const spanItem = document.getElementById("date-span")
    const isOpen = checkIfOpen()

    if(isOpen){
        spanItem.classList.remove("bg-red-500")
        spanItem.classList.add("bg-green-600")
    }else {
        spanItem.classList.remove("bg-green-600")
        spanItem.classList.add("bg-red-500")
    }