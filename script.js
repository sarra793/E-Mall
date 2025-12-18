// ===== GLOBAL FUNCTIONS =====
function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== SHOPPING SECTION =====

const products = {
    women: [
        {
            id: 1,
            name: 'Red Dress',
            price: 49.99,
            description: 'Elegant red dress perfect for evening occasions',
            image: 'assets/womenDress.jpg'
        },
        {
            id: 2,
            name: 'Blue Handbag',
            price: 39.50,
            description: 'Stylish blue handbag with multiple compartments',
            image: 'assets/womeBag.jpg'
        },
        {
            id: 3,
            name: 'Silver Necklace',
            price: 29.99,
            description: 'Beautiful silver necklace with pendant',
            image: 'assets/womenNecklace.jpg'
        }
    ],
    men: [
        {
            id: 4,
            name: 'Black Jacket',
            price: 89.99,
            description: 'Premium black leather jacket',
            image: 'assets/men-jacket.jpg'
        },
        {
            id: 5,
            name: 'White Sneakers',
            price: 59.99,
            description: 'Comfortable white sneakers for everyday wear',
            image: 'assets/men-sneakers.jpg'
        },
        {
            id: 6,
            name: 'Leather Belt',
            price: 24.99,
            description: 'Genuine leather belt with metal buckle',
            image: 'assets/men-belt.jpg'
        }
    ]
};

let cart = {};
let favorites = {};

function scrollToAndShowSection(sectionId) {
    document.querySelectorAll('.shop-section').forEach(sec => sec.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.scrollIntoView({ behavior: 'smooth' });
        renderProducts(sectionId);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateFavCount();
});

function showSection(section) {
    document.getElementById(section).classList.remove('hidden');
    renderProducts(section);
}

function renderProducts(section) {
    const container = document.getElementById(section);
    container.innerHTML = `<h3>${section.charAt(0).toUpperCase() + section.slice(1)}'s Section</h3>`;

    const searchValue = document.getElementById('search').value.trim().toLowerCase();

    products[section]
        .filter(product =>
            product.name.toLowerCase().includes(searchValue) ||
            product.description.toLowerCase().includes(searchValue)
        )
        .forEach(product => {
            const inFav = favorites[product.id] ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
            const quantity = cart[product.id]?.quantity || 0;

            const productHTML = `
                <div class="product" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <p class="price">$${product.price.toFixed(2)}</p>
                    </div>
                    <div class="product-controls">
                        <button onclick="toggleFavorite(${product.id}, '${section}')">${inFav}</button>
                        <div class="quantity-controls">
                            <button onclick="adjustCartQuantity(${product.id}, -1, '${section}')">-</button>
                            <span>${quantity}</span>
                            <button onclick="adjustCartQuantity(${product.id}, 1, '${section}')">+</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', productHTML);
        });

    updateCartCount();
    updateFavCount();
}

function searchProduct() {
    if (!document.getElementById('women').classList.contains('hidden')) {
        renderProducts('women');
    } else {
        renderProducts('men');
    }
}

function toggleFavorite(productId, section) {
    if (favorites[productId]) {
        delete favorites[productId];
    } else {
        favorites[productId] = true;
    }
    renderProducts(section);
    updateFavoritesPopup();
    updateFavCount();
}

function adjustCartQuantity(productId, change, section) {
    if (!cart[productId]) {
        cart[productId] = { quantity: 0, product: findProductById(productId) };
    }

    cart[productId].quantity += change;

    if (cart[productId].quantity <= 0) {
        delete cart[productId];
    }

    renderProducts(section);
    updateCartPopup();
    updateCartCount();
}

function findProductById(productId) {
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

function toggleCart() {
    const popup = document.getElementById('cart-popup');
    popup.classList.toggle('hidden');
    popup.setAttribute('aria-hidden', popup.classList.contains('hidden'));

    if (!popup.classList.contains('hidden')) {
        updateCartPopup();
    }
}

function toggleFavorites() {
    const popup = document.getElementById('favorites-popup');
    popup.classList.toggle('hidden');
    popup.setAttribute('aria-hidden', popup.classList.contains('hidden'));

    if (!popup.classList.contains('hidden')) {
        updateFavoritesPopup();
    }
}

function updateCartPopup() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (Object.keys(cart).length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    for (const productId in cart) {
        const item = cart[productId];
        const product = item.product;
        const subtotal = product.price * item.quantity;
        total += subtotal;

        const itemHTML = `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="item-details">
                    <h4>${product.name}</h4>
                    <p>$${product.price.toFixed(2)} × ${item.quantity}</p>
                    <p class="item-price">$${subtotal.toFixed(2)}</p>
                </div>
                <div class="item-controls">
                    <button onclick="adjustCartQuantity(${product.id}, -1)">-</button>
                    <button onclick="adjustCartQuantity(${product.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${product.id})">×</button>
                </div>
            </div>
        `;
        cartItems.insertAdjacentHTML('beforeend', itemHTML);
    }

    cartTotal.textContent = total.toFixed(2);
}

function updateFavoritesPopup() {
    const favItems = document.querySelector('.fav-items');

    if (Object.keys(favorites).length === 0) {
        favItems.innerHTML = '<p class="empty-favs">Your favorites list is empty</p>';
        return;
    }

    favItems.innerHTML = '';

    for (const productId in favorites) {
        const product = findProductById(parseInt(productId));
        if (!product) continue;

        // Find the section this product belongs to
    let section = '';
    for (const key in products) {
        if (products[key].some(p => p.id === product.id)) {
            section = key;
            break;
        }
    }

        const itemHTML = `
            <div class="fav-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="item-details">
                    <h4>${product.name}</h4>
                    <p>$${product.price.toFixed(2)}</p>
                </div>
                <button onclick="toggleFavorite(${product.id}, '${section}')">×</button>
            </div>
        `;
        favItems.insertAdjacentHTML('beforeend', itemHTML);
    }
}

function removeFromCart(productId) {
    delete cart[productId];
    updateCartPopup();
    updateCartCount();

    // Re-render the current product section
    const currentSection = document.querySelector('.shop-section:not(.hidden)').id;
    renderProducts(currentSection);
}

function updateCartCount() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function updateFavCount() {
    const count = Object.keys(favorites).length;
    document.getElementById('fav-count').textContent = count;
}

function checkout() {
    if (Object.keys(cart).length === 0) {
        alert('Your cart is empty!');
        return;
    }

    alert('Thank you for your purchase! Your order has been placed.');
    cart = {};
    updateCartPopup();
    updateCartCount();

    // Re-render the current product section
    const currentSection = document.querySelector('.shop-section:not(.hidden)').id;
    renderProducts(currentSection);
}

// ===== GAMES SECTION =====
function showGame(gameId) {
    ['quiz-game', 'memory-game', 'rps-game'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(gameId).classList.remove('hidden');

    if (gameId === 'memory-game') {
        setupMemoryBoard();
    }
}

// Quiz Game
const quizData = [
    {
        question: "What does HTML stand for?",
        options: ["Hyperlinks and Text Markup Language", "Home Tool Markup Language", "HyperText Markup Language", "Hyper Transfer Markup Language"],
        answer: "HyperText Markup Language"
    },
    {
        question: "What does DOM stand for?",
        options: ["Document Object Model", "Document Order Model", "Digital Object Mapper", "Dynamic Object Manipulator"],
        answer: "Document Object Model"
    },
    {
        question: "What programming language is primarily used to add interactivity to web pages?",
        options: ["Python", "Java", "JavaScript", "C++"],
        answer: "JavaScript"
    },
    {
        question: "Which method is commonly used in JavaScript to select an element by its ID?",
        options: ["document.querySelector()", "document.getElementByClass()", "document.selectId()", "document.getElementById()"],
        answer: "document.getElementById()"
    }
];

let currentQuizIndex = 0;
let quizScore = 0;

function loadQuiz() {
    const q = quizData[currentQuizIndex];
    document.getElementById('quiz-question').textContent = q.question;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';

    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option);
        optionsDiv.appendChild(btn);
    });

    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-next').classList.add('hidden');
    document.getElementById('quiz-restart').classList.add('hidden');
    updateQuizScore();
}

function checkAnswer(selected) {
    const q = quizData[currentQuizIndex];
    const feedback = document.getElementById('quiz-feedback');

    if (selected === q.answer) {
        feedback.textContent = 'Correct!';
        feedback.style.color = '#4CAF50';
        quizScore++;
    } else {
        feedback.textContent = `Wrong! Correct answer: ${q.answer}`;
        feedback.style.color = '#f44336';
    }

    document.getElementById('quiz-next').classList.remove('hidden');
    updateQuizScore();
}

function updateQuizScore() {
    document.getElementById('quiz-score').textContent = `Score: ${quizScore}/${quizData.length}`;
}

document.getElementById('quiz-next').onclick = () => {
    currentQuizIndex++;
    if (currentQuizIndex >= quizData.length) {
        document.getElementById('quiz-feedback').textContent = 'Quiz completed!';
        document.getElementById('quiz-next').classList.add('hidden');
        document.getElementById('quiz-restart').classList.remove('hidden');
        updateQuizScore();
    } else {
        loadQuiz();
    }
};

document.getElementById('quiz-restart').onclick = () => {
    currentQuizIndex = 0;
    quizScore = 0;
    loadQuiz();
};

// Memory Game
const memoryCards = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍎', '🍌', '🍇', '🍊', '🍓', '🍒'];
let memoryFlipped = [];
let memoryMatched = [];
let memoryMoves = 0;

function setupMemoryBoard() {
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    memoryFlipped = [];
    memoryMatched = [];
    memoryMoves = 0;

    // Shuffle cards
    const shuffledCards = [...memoryCards].sort(() => Math.random() - 0.5);

    shuffledCards.forEach((card, index) => {
        const cardElem = document.createElement('div');
        cardElem.className = 'memory-card';
        cardElem.dataset.index = index;
        cardElem.dataset.value = card;
        cardElem.onclick = () => flipMemoryCard(cardElem);
        board.appendChild(cardElem);
    });

    document.getElementById('memory-moves').textContent = `Moves: ${memoryMoves}`;
    document.getElementById('memory-pairs').textContent = `Pairs Found: ${memoryMatched.length / 2}/${memoryCards.length / 2}`;
    document.getElementById('memory-message').textContent = '';
}

function flipMemoryCard(cardElem) {
    // Don't allow flipping if already flipped or matched
    if (memoryFlipped.includes(cardElem) || memoryMatched.includes(cardElem.dataset.index)) {
        return;
    }

    // Don't allow more than 2 cards flipped at once
    if (memoryFlipped.length === 2) {
        return;
    }

    // Flip the card
    cardElem.textContent = cardElem.dataset.value;
    cardElem.classList.add('flipped');
    memoryFlipped.push(cardElem);

    // Check for match when two cards are flipped
    if (memoryFlipped.length === 2) {
        memoryMoves++;
        document.getElementById('memory-moves').textContent = `Moves: ${memoryMoves}`;

        const [card1, card2] = memoryFlipped;

        if (card1.dataset.value === card2.dataset.value) {
            // Match found
            memoryMatched.push(card1.dataset.index, card2.dataset.index);
            document.getElementById('memory-pairs').textContent = `Pairs Found: ${memoryMatched.length / 2}/${memoryCards.length / 2}`;

            // Mark as matched
            card1.classList.add('matched');
            card2.classList.add('matched');

            memoryFlipped = [];

            // Check if game is complete
            if (memoryMatched.length === memoryCards.length) {
                document.getElementById('memory-message').textContent = `Congratulations! You won in ${memoryMoves} moves!`;
            }
        } else {
            // No match - flip back after delay
            setTimeout(() => {
                card1.textContent = '';
                card1.classList.remove('flipped');
                card2.textContent = '';
                card2.classList.remove('flipped');
                memoryFlipped = [];
            }, 1000);
        }
    }
}

document.getElementById('memory-reset').onclick = setupMemoryBoard;

// Rock Paper Scissors Game
let rpsScore = { player: 0, computer: 0, ties: 0 };

function playRPS(choice) {
    const options = ['rock', 'paper', 'scissors'];
    const computer = options[Math.floor(Math.random() * options.length)];
    let result = '';

    if (choice === computer) {
        result = `Draw! Both chose ${choice}`;
        rpsScore.ties++;
    } else if (
        (choice === 'rock' && computer === 'scissors') ||
        (choice === 'scissors' && computer === 'paper') ||
        (choice === 'paper' && computer === 'rock')
    ) {
        result = `You win! ${choice} beats ${computer}`;
        rpsScore.player++;
    } else {
        result = `You lose! ${computer} beats ${choice}`;
        rpsScore.computer++;
    }

    document.getElementById('rps-result').textContent = result;
    updateRPSScore();
}

function updateRPSScore() {
    document.getElementById('rps-score').textContent =
        `Player: ${rpsScore.player} | Computer: ${rpsScore.computer} | Ties: ${rpsScore.ties}`;
}

document.getElementById('rps-reset').onclick = () => {
    rpsScore = { player: 0, computer: 0, ties: 0 };
    document.getElementById('rps-result').textContent = '';
    updateRPSScore();
};

// ===== CONTACT FORM =====
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('form-status');

    // Simple validation
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
        status.textContent = 'Please fill all fields.';
        status.style.color = '#f44336';
        return;
    }

    // Simulate form submission
    status.textContent = 'Sending message...';
    status.style.color = '#2196F3';

    // In a real app, you would use fetch() to send the form data
    setTimeout(() => {
        status.textContent = 'Thank you! Your message has been sent.';
        status.style.color = '#4CAF50';
        form.reset();
    }, 1500);
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the quiz game
    loadQuiz();

    // Initialize the memory game
    setupMemoryBoard();

    // Initialize the shopping section
    renderProducts('women');

    // Add keyboard navigation for games
    document.querySelectorAll('.game').forEach(game => {
        game.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const gameId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                showGame(gameId);
            }
        });
    });
});

const reviews = [
    {
        name: "Alice Dupont",
        quote: "Excellent service, very responsive and professional."
    },
    {
        name: "Mohammed El Amrani",
        quote: "Fast delivery, great customer service, and a clean website design. Highly recommended!"
    },
    {
        name: "Sophie Martin",
        quote: "I love shopping here! The selection is amazing and knowing my purchases support Palestine makes it even better."
    },
    {
        name: "Hanae M.",
        quote: "Honestly one of the best online shopping experiences I've had. Everything just works!"
    },
    {
        name: "David L.",
        quote: "Refreshing concept. Being able to shop and play while supporting good causes is the future of e-commerce."
    },
    {
        name: "Samar D",
        quote:  "The e-mall has completely changed the way I shop online. I can find everything in one place—from clothes to gadgets—and even enjoy games while I browse. It’s fast, intuitive, and genuinely enjoyable. Highly recommend!"
    },
];

const container = document.getElementById("testimonials");

reviews.forEach(review => {
    const div = document.createElement("div");
    div.classList.add("testimonial");

    div.innerHTML = `
      ${review.quote}
      <div class="client-name">– ${review.name}</div>
    `;

    container.appendChild(div);
});