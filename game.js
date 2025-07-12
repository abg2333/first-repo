// 游戏常量
const GRID_SIZE = 30;  // 扩大地图
const CELL_SIZE = 15;  // 调整单元格大小以保持合理显示
const GAME_SPEED = 200;  // 降低速度

// 游戏变量
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let snake = [{x: 10, y: 10}];
let food = generateFood();
let direction = 'RIGHT';
let score = 0;
let gameInterval;

// 初始化游戏
function initGame() {
    document.addEventListener('keydown', changeDirection);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    drawGame();
}

// 移动蛇
function moveSnake() {
    let head = {...snake[0]};
    
    switch(direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

// 生成食物
function generateFood() {
    return {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 身体部分
        if (index > 0 && index < snake.length - 1) {
            ctx.fillStyle = 'green';
            ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        // 头部
        else if (index === 0) {
            ctx.fillStyle = 'darkgreen';
            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE/2, 
                segment.y * CELL_SIZE + CELL_SIZE/2, 
                CELL_SIZE/2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // 眼睛
            ctx.fillStyle = 'white';
            const eyeOffset = CELL_SIZE/4;
            const eyeSize = CELL_SIZE/6;
            if (direction === 'RIGHT' || direction === 'LEFT') {
                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + (direction === 'RIGHT' ? CELL_SIZE - eyeOffset : eyeOffset),
                    segment.y * CELL_SIZE + eyeOffset,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + (direction === 'RIGHT' ? CELL_SIZE - eyeOffset : eyeOffset),
                    segment.y * CELL_SIZE + CELL_SIZE - eyeOffset,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + eyeOffset,
                    segment.y * CELL_SIZE + (direction === 'DOWN' ? CELL_SIZE - eyeOffset : eyeOffset),
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + CELL_SIZE - eyeOffset,
                    segment.y * CELL_SIZE + (direction === 'DOWN' ? CELL_SIZE - eyeOffset : eyeOffset),
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        // 尾部
        else {
            ctx.fillStyle = 'lightgreen';
            ctx.beginPath();
            ctx.moveTo(segment.x * CELL_SIZE, segment.y * CELL_SIZE);
            ctx.lineTo(segment.x * CELL_SIZE + CELL_SIZE, segment.y * CELL_SIZE);
            ctx.lineTo(segment.x * CELL_SIZE + CELL_SIZE/2, segment.y * CELL_SIZE + CELL_SIZE);
            ctx.closePath();
            ctx.fill();
        }
    });
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// 改变方向（改进版，更符合直觉）
function changeDirection(e) {
    const key = e.keyCode;
    const currentDir = direction;
    
    // 左箭头：相对于当前方向向左转
    if (key === 37) {
        if (currentDir === 'UP') direction = 'LEFT';
        else if (currentDir === 'LEFT') direction = 'DOWN';
        else if (currentDir === 'DOWN') direction = 'RIGHT';
        else if (currentDir === 'RIGHT') direction = 'UP';
    }
    // 右箭头：相对于当前方向向右转
    else if (key === 39) {
        if (currentDir === 'UP') direction = 'RIGHT';
        else if (currentDir === 'RIGHT') direction = 'DOWN';
        else if (currentDir === 'DOWN') direction = 'LEFT';
        else if (currentDir === 'LEFT') direction = 'UP';
    }
    // 上箭头：相对于当前方向直行（不改变方向）
    else if (key === 38) {
        // 保持当前方向
    }
    // 下箭头：相对于当前方向掉头
    else if (key === 40) {
        if (currentDir === 'UP') direction = 'DOWN';
        else if (currentDir === 'RIGHT') direction = 'LEFT';
        else if (currentDir === 'DOWN') direction = 'UP';
        else if (currentDir === 'LEFT') direction = 'RIGHT';
    }
}

// 检查碰撞
function checkCollision() {
    let head = snake[0];
    
    // 撞墙
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    alert('游戏结束！你的分数是: ' + score);
}

// 开始游戏
initGame();
