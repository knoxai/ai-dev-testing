class Gomoku {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15; // 15x15的棋盘
        this.cellSize = this.canvas.width / (this.boardSize + 1);
        this.pieces = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;

        this.initialize();
    }

    initialize() {
        this.drawBoard();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    drawBoard() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制棋盘线
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        // 绘制横线和竖线
        for (let i = 1; i <= this.boardSize; i++) {
            // 横线
            this.ctx.moveTo(this.cellSize, i * this.cellSize);
            this.ctx.lineTo(this.boardSize * this.cellSize, i * this.cellSize);
            // 竖线
            this.ctx.moveTo(i * this.cellSize, this.cellSize);
            this.ctx.lineTo(i * this.cellSize, this.boardSize * this.cellSize);
        }
        this.ctx.stroke();

        // 绘制天元和星位
        const stars = [
            [3, 3], [11, 3], [3, 11], [11, 11], [7, 7],
            [3, 7], [7, 3], [11, 7], [7, 11]
        ];
        stars.forEach(([x, y]) => {
            this.ctx.beginPath();
            this.ctx.arc((x + 1) * this.cellSize, (y + 1) * this.cellSize, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });
    }

    drawPiece(x, y, color) {
        this.ctx.beginPath();
        this.ctx.arc((x + 1) * this.cellSize, (y + 1) * this.cellSize, this.cellSize * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = color === 'white' ? '#000' : '#000';
        this.ctx.stroke();
    }

    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 计算落子的格子坐标
        const gridX = Math.round(x / this.cellSize - 1);
        const gridY = Math.round(y / this.cellSize - 1);

        // 检查是否在有效范围内
        if (gridX >= 0 && gridX < this.boardSize && gridY >= 0 && gridY < this.boardSize) {
            if (this.pieces[gridY][gridX] === null) {
                this.pieces[gridY][gridX] = this.currentPlayer;
                this.drawPiece(gridX, gridY, this.currentPlayer);

                if (this.checkWin(gridX, gridY)) {
                    this.gameOver = true;
                    setTimeout(() => {
                        alert(this.currentPlayer === 'black' ? '黑子胜！' : '白子胜！');
                    }, 100);
                    return;
                }

                this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
                document.getElementById('player-turn').textContent = 
                    `当前回合: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
            }
        }
    }

    checkWin(x, y) {
        const directions = [
            [[0, 1], [0, -1]],  // 垂直
            [[1, 0], [-1, 0]],  // 水平
            [[1, 1], [-1, -1]], // 主对角线
            [[1, -1], [-1, 1]]  // 副对角线
        ];

        const color = this.pieces[y][x];

        return directions.some(direction => {
            let count = 1;
            direction.forEach(([dx, dy]) => {
                let newX = x + dx;
                let newY = y + dy;
                while (
                    newX >= 0 && newX < this.boardSize &&
                    newY >= 0 && newY < this.boardSize &&
                    this.pieces[newY][newX] === color
                ) {
                    count++;
                    newX += dx;
                    newY += dy;
                }
            });
            return count >= 5;
        });
    }

    restart() {
        this.pieces = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.drawBoard();
        document.getElementById('player-turn').textContent = '当前回合: 黑子';
    }
}

// 游戏初始化
window.onload = () => {
    new Gomoku();
};
