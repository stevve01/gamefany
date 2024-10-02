// Получение холста и его контекста
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Элементы начального и финального экранов
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');

// Загрузка изображений
const basketImage = new Image();
basketImage.src = 'basket.png';  // Изображение корзины

const appleImage = new Image();
appleImage.src = 'apple.png';  // Изображение яблока

const goldenAppleImage = new Image();
goldenAppleImage.src = 'golden_apple.png';  // Золотое яблоко для бонусов

// Загрузка звуков
const collectSound = new Audio('collect.mp3');
const loseLifeSound = new Audio('lose_life.mp3');

// Размеры корзины
const basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 50,
    speed: 7,
    dx: 0
};

// Яблоки
const apples = [];
const appleRadius = 15;
let score = 0;
let lives = 3;
let gameRunning = false;
let appleInterval;

// Управление корзиной
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        basket.dx = basket.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        basket.dx = -basket.speed;
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        basket.dx = 0;
    }
}

// Сенсорное управление
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', () => {
    basket.dx = 0;
});

function handleTouch(e) {
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;

    if (touchX < basket.x) {
        basket.dx = -basket.speed;
    } else if (touchX > basket.x + basket.width) {
        basket.dx = basket.speed;
    }
    e.preventDefault();
}

// Создаем яблоко
function createApple() {
    const x = Math.random() * (canvas.width - appleRadius * 2) + appleRadius;
    const y = -appleRadius;
    const isGolden = Math.random() < 0.1; // 10% шанс на золотое яблоко
    apples.push({ x, y, dy: 3 + score / 20, isGolden });
}

// Обновляем положение яблок
function updateApples() {
    apples.forEach((apple, index) => {
        apple.y += apple.dy;

        // Проверка столкновения с корзиной
        if (
            apple.y + appleRadius > basket.y &&
            apple.x > basket.x &&
            apple.x < basket.x + basket.width
        ) {
            apples.splice(index, 1);
            score += apple.isGolden ? 5 : 1; // Золотое яблоко стоит 5 очков
            collectSound.play();
        }

        // Удаляем яблоко, если оно упало ниже холста, и уменьшаем жизнь
        if (apple.y - appleRadius > canvas.height) {
            apples.splice(index, 1);
            lives -= 1;
            loseLifeSound.play();
            if (lives <= 0) {
                gameOver();
            }
        }
    });
}

// Обновляем положение корзины
function updateBasket() {
    basket.x += basket.dx;

    // Не позволяем корзине выходить за границы
    if (basket.x < 0) {
        basket.x = 0;
    }

    if (basket.x + basket.width > canvas.width) {
        basket.x = canvas.width - basket.width;
    }
}

// Рисуем корзину
function drawBasket() {
    ctx.drawImage(basketImage, basket.x, basket.y, basket.width, basket.height);
}

// Рисуем яблоки
function drawApples() {
    apples.forEach((apple) => {
        if (apple.isGolden) {
            ctx.drawImage(goldenAppleImage, apple.x - appleRadius, apple.y - appleRadius, appleRadius * 2, appleRadius * 2);
        } else {
            ctx.drawImage(appleImage, apple.x - appleRadius, apple.y - appleRadius, appleRadius * 2, appleRadius * 2);
        }
    });
}

// Отображаем счет и жизни
function drawScoreAndLives() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
}

// Обновляем все элементы игры
function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBasket();
    drawApples();
    drawScoreAndLives();

    updateBasket();
    updateApples();

    requestAnimationFrame(update);
}

// Начальный экран
startButton.addEventListener('click', startGame);

// Экран проигрыша
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

// Начинаем игру
function startGame() {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    score = 0;
    lives = 3;
    gameRunning = true;
    apples.length = 0; // Очистить яблоки
    if (appleInterval) {
        clearInterval(appleInterval);
    }
    appleInterval = setInterval(createApple, 1000);
    update();
}

// Конец игры
function gameOver() {
    gameRunning = false;
    clearInterval(appleInterval);
    finalScore.innerText = `Your Score: ${score}`;
    gameOverScreen.style.display = 'flex';
    canvas.style.display = 'none';
}
