document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');

    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game state
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150; // milliseconds
    let gameInterval;
    let isGameRunning = false;
    let lastDirection = '';

    // Initialize high score display
    highScoreElement.textContent = highScore;

    // Initialize game
    function initGame() {
        // Create initial snake (3 segments)
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // Set initial direction (right)
        dx = 1;
        dy = 0;
        lastDirection = 'right';
        
        // Reset score
        score = 0;
        scoreElement.textContent = score;
        
        // Create initial food
        createFood();
        
        // Draw initial state
        draw();
    }

    // Create food at random position
    function createFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                createFood(); // Try again
                break;
            }
        }
    }

    // Draw everything on canvas
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50'; // Green head
            } else {
                ctx.fillStyle = '#8BC34A'; // Lighter green body
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
        
        // Draw food
        ctx.fillStyle = '#FF5722'; // Orange food
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
    }

    // Move snake
    function moveSnake() {
        // Create new head based on current direction
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        // Add new head to beginning of snake array
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Create new food
            createFood();
            
            // Increase game speed slightly
            if (gameSpeed > 50) {
                gameSpeed -= 2;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // Remove tail if snake didn't eat food
            snake.pop();
        }
    }

    // Check for collisions
    function checkCollisions() {
        const head = snake[0];
        
        // Check wall collisions
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }
        
        // Check self collisions (start from index 1 to avoid checking head against itself)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    // Game loop
    function gameLoop() {
        moveSnake();
        
        // Check for collisions
        if (checkCollisions()) {
            gameOver();
            return;
        }
        
        draw();
    }

    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        // Update start button text
        startButton.textContent = 'Play Again';
    }

    // Start game
    function startGame() {
        if (isGameRunning) return;
        
        initGame();
        isGameRunning = true;
        startButton.textContent = 'Pause';
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    // Reset game
    function resetGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        startButton.textContent = 'Start Game';
        initGame();
    }

    // Event listeners
    startButton.addEventListener('click', () => {
        if (isGameRunning) {
            // Pause game
            clearInterval(gameInterval);
            isGameRunning = false;
            startButton.textContent = 'Resume';
        } else {
            startGame();
        }
    });

    resetButton.addEventListener('click', resetGame);

    // Direction button controls
    const upButton = document.getElementById('up-btn');
    const downButton = document.getElementById('down-btn');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');

    upButton.addEventListener('click', () => {
        if (isGameRunning && lastDirection !== 'down') {
            dx = 0;
            dy = -1;
            lastDirection = 'up';
        }
    });

    downButton.addEventListener('click', () => {
        if (isGameRunning && lastDirection !== 'up') {
            dx = 0;
            dy = 1;
            lastDirection = 'down';
        }
    });

    leftButton.addEventListener('click', () => {
        if (isGameRunning && lastDirection !== 'right') {
            dx = -1;
            dy = 0;
            lastDirection = 'left';
        }
    });

    rightButton.addEventListener('click', () => {
        if (isGameRunning && lastDirection !== 'left') {
            dx = 1;
            dy = 0;
            lastDirection = 'right';
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent arrow keys from scrolling the page
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        // Only change direction if game is running
        if (!isGameRunning) return;
        
        // Prevent 180-degree turns (can't go directly opposite of current direction)
        switch (e.key) {
            case 'ArrowUp':
                if (lastDirection !== 'down') {
                    dx = 0;
                    dy = -1;
                    lastDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (lastDirection !== 'up') {
                    dx = 0;
                    dy = 1;
                    lastDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (lastDirection !== 'right') {
                    dx = -1;
                    dy = 0;
                    lastDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (lastDirection !== 'left') {
                    dx = 1;
                    dy = 0;
                    lastDirection = 'right';
                }
                break;
        }
    });

    // Initialize game on load
    initGame();
});
