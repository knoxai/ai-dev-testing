class Weiqi {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 19; // 19x19棋盘
        this.cellSize = this.canvas.width / (this.boardSize + 1);
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.koPosition = null; // 劫争位置

        this.initialize();
    }

    initialize() {
        this.drawBoard();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    drawBoard() {
        // 绘制棋盘背景
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

        // 绘制星位
        const stars = [
            [3, 3], [9, 3], [15, 3],
            [3, 9], [9, 9], [15, 9],
            [3, 15], [9, 15], [15, 15]
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
        this.ctx.strokeStyle = color === 'white' ? '#000' : '#fff';
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
            if (this.isValidMove(gridX, gridY)) {
                this.placeStone(gridX, gridY);
            }
        }
    }

    isValidMove(x, y) {
        // 检查位置是否为空
        if (this.board[y][x] !== null) return false;

        // 检查是否为劫争禁着点
        if (this.koPosition && x === this.koPosition.x && y === this.koPosition.y) {
            return false;
        }

        // 检查是否为自杀手
        const testBoard = JSON.parse(JSON.stringify(this.board));
        testBoard[y][x] = this.currentPlayer;
        if (this.countLiberties(x, y, testBoard) === 0) {
            return false;
        }

        return true;
    }

    placeStone(x, y) {
        // 落子
        this.board[y][x] = this.currentPlayer;
        this.drawPiece(x, y, this.currentPlayer);

        // 提子
        const capturedStones = this.captureStones(x, y);
        if (capturedStones.length > 0) {
            capturedStones.forEach(([cx, cy]) => {
                this.board[cy][cx] = null;
                this.clearPiece(cx, cy);
            });
        }

        // 更新游戏状态
        this.updateGameState(x, y);
    }

    countLiberties(x, y, board) {
        if (board[y][x] === null) return 0;
        
        const visited = new Set();
        const stack = [[x, y]];
        let liberties = 0;
        const color = board[y][x];

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);

            // 检查四个方向
            const directions = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1]
            ];

            for (const [nx, ny] of directions) {
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                    if (board[ny][nx] === null) {
                        liberties++;
                    } else if (board[ny][nx] === color && !visited.has(`${nx},${ny}`)) {
                        stack.push([nx, ny]);
                    }
                }
            }
        }
        return liberties;
    }

    captureStones(x, y) {
        const captured = [];
        const color = this.board[y][x];
        const opponent = color === 'black' ? 'white' : 'black';
        
        // 检查四个方向
        const directions = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
        ];

        for (const [nx, ny] of directions) {
            if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                if (this.board[ny][nx] === opponent) {
                    const testBoard = JSON.parse(JSON.stringify(this.board));
                    if (this.countLiberties(nx, ny, testBoard) === 0) {
                        // 记录所有被提的棋子
                        const stack = [[nx, ny]];
                        while (stack.length > 0) {
                            const [cx, cy] = stack.pop();
                            if (this.board[cy][cx] === opponent) {
                                captured.push([cx, cy]);
                                this.board[cy][cx] = null;
                                // 继续检查相邻棋子
                                stack.push(
                                    [cx + 1, cy],
                                    [cx - 1, cy],
                                    [cx, cy + 1],
                                    [cx, cy - 1]
                                );
                            }
                        }
                    }
                }
            }
        }
        return captured;
    }

    clearPiece(x, y) {
        // 清除棋子
        this.ctx.clearRect(
            (x + 0.6) * this.cellSize,
            (y + 0.6) * this.cellSize,
            this.cellSize * 0.8,
            this.cellSize * 0.8
        );
        // 重绘交叉点
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
        this.ctx.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
        this.ctx.stroke();
    }

    updateGameState(x, y) {
        // 检查是否形成劫争
        const captured = this.captureStones(x, y);
        if (captured.length === 1) {
            this.koPosition = { x: captured[0][0], y: captured[0][1] };
        } else {
            this.koPosition = null;
        }

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        document.getElementById('player-turn').textContent = 
            `当前回合: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
    }

    restart() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.koPosition = null;
        this.drawBoard();
        document.getElementById('player-turn').textContent = '当前回合: 黑子';
    }
}

// 游戏初始化
window.onload = () => {
    new Weiqi();
};
