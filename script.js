let cart = [];
let totalPrice = 0;
let currentProduct = null;

// Lógica para adicionar produtos ao cardápio
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value; // Corrigido o ID para "productDescription"
    const productPrice = document.getElementById('productPrice').value;
    const productImage = document.getElementById('productImage').files[0];

    if (productImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const productItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = productName;

            const productInfo = document.createElement('div');
            productInfo.classList.add('product-info');
            productInfo.innerHTML = `<strong>${productName}</strong><br>${productDescription}`;

            const productPriceEl = document.createElement('span');
            productPriceEl.classList.add('product-price');
            productPriceEl.textContent = `R$${parseFloat(productPrice).toFixed(2)}`;

            productItem.appendChild(img);
            productItem.appendChild(productInfo);
            productItem.appendChild(productPriceEl);
            productPriceEl.addEventListener('click', () => openIngredientModal(productName, productPrice, e.target.result));

            document.getElementById('productList').appendChild(productItem);
            document.getElementById('productForm').reset();
        };
        reader.readAsDataURL(productImage);
    }
});

// Abrir modal de remoção de ingredientes
function openIngredientModal(name, price, imageSrc) {
    currentProduct = { name, price, imageSrc };
    document.getElementById('ingredientModal').style.display = 'flex';
}

// Confirmar ingredientes e adicionar ao carrinho
document.getElementById('confirmIngredientSelection').addEventListener('click', function() {
    const ingredientsToRemove = document.getElementById('ingredientsInput').value;

    addToCart(currentProduct.name, currentProduct.price, currentProduct.imageSrc, ingredientsToRemove);
    document.getElementById('ingredientModal').style.display = 'none';
});

// Adicionar produto ao carrinho
function addToCart(name, price, imageSrc, ingredients) {
    const cartItem = document.createElement('li');
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = name;

    const removeSpan = document.createElement('span');
    removeSpan.classList.add('remove-btn');
    removeSpan.innerHTML = 'X';
    removeSpan.addEventListener('click', function() {
        removeFromCart(cartItem, price);
    });

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');
    productInfo.innerHTML = `<strong>${name}</strong><br>Ingredientes: ${ingredients}`;

    const productPriceEl = document.createElement('span');
    productPriceEl.classList.add('product-price');
    productPriceEl.textContent = `R$${parseFloat(price).toFixed(2)}`;

    cartItem.appendChild(img);
    cartItem.appendChild(removeSpan);
    cartItem.appendChild(productInfo);
    cartItem.appendChild(productPriceEl);

    document.getElementById('cartList').appendChild(cartItem);

    totalPrice += parseFloat(price);
    updateTotalPrice();
}

// Remover item do carrinho
function removeFromCart(cartItem, price) {
    document.getElementById('cartList').removeChild(cartItem);
    totalPrice -= parseFloat(price);
    updateTotalPrice();
}

// Atualizar o total no carrinho
function updateTotalPrice() {
    document.getElementById('totalPrice').textContent = `Total: R$${totalPrice.toFixed(2)}`;
}

// Abrir modal de finalização de compra
document.getElementById('finalizeOrder').addEventListener('click', function() {
    document.getElementById('finalizeModal').style.display = 'flex';
});

// Fechar modal de finalização de compra
document.querySelector('.closeFinalize').addEventListener('click', function() {
    document.getElementById('finalizeModal').style.display = 'none';
});

// Exibir campos conforme a opção de tipo de pedido e forma de pagamento
document.getElementById('deliveryOption').addEventListener('change', function() {
    const deliveryOption = this.value;
    document.getElementById('addressInput').style.display = deliveryOption === 'entrega' ? 'block' : 'none';
    document.getElementById('paymentOptions').style.display = deliveryOption === 'entrega' ? 'block' : 'none';
});

document.getElementById('paymentMethod').addEventListener('change', function() {
    document.getElementById('changeInput').style.display = this.value === 'dinheiro' ? 'block' : 'none';
});

// Confirmar a compra e enviar mensagem via WhatsApp
document.getElementById('confirmPurchase').addEventListener('click', function() {
    const customerName = document.getElementById('customerName').value;
    const deliveryOption = document.getElementById('deliveryOption').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const address = document.getElementById('address').value;
    const change = document.getElementById('change').value;

    if (customerName.trim()) {
        let details = `Compra finalizada com sucesso, ${customerName}!\n`;
        let items = Array.from(document.querySelectorAll('#cartList li')).map(item => item.querySelector('.product-info').innerText).join('%0A');

        if (deliveryOption === 'entrega') {
            details += `\nEndereço: ${address}`;
            details += `\nForma de pagamento: ${paymentMethod}`;
            if (paymentMethod === 'dinheiro' && change) {
                details += `\nTroco para: R$ ${parseFloat(change).toFixed(2)}`;
            }
        } else {
            details += '\nRetirada na loja.';
        }

        // URL do WhatsApp
        const whatsappNumber = '5532984885431';
        const message = encodeURIComponent(`${details}\n\nItens:\n${items}\n\nTotal: R$ ${totalPrice.toFixed(2)}`);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;

        // Redireciona para o WhatsApp
        window.open(whatsappUrl, '_blank');

        document.getElementById('finalizeModal').style.display = 'none';
        clearCart();
    }
});

// Limpar o carrinho após a compra
function clearCart() {
    document.getElementById('cartList').innerHTML = '';
    totalPrice = 0;
    document.getElementById('totalPrice').textContent = 'Total: R$ 0,00';
}

// Fechar modal de ingredientes ao clicar no "X"
document.querySelector('.closeIngredientModal').addEventListener('click', function() {
    document.getElementById('ingredientModal').style.display = 'none';
    document.getElementById('ingredientsInput').value = ''; // Limpa o campo de entrada
});
