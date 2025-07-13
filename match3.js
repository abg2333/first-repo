// 游戏常量
const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const TILE_TYPES = 5;
const SCORE_PER_MATCH = 10;

// 游戏变量
let board = [];
let score = 0;
let selectedTile = null;
let isProcessing = false;

// 初始化游戏
function initGame() {
    createBoard();
    renderBoard();
    setupEventListeners();
    updateScore();
}

// 创建游戏板
function createBoard() {
    board = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = getRandomTileType();
        }
    }
}

// 获取随机方块类型
function getRandomTileType() {
    return Math.floor(Math.random() * TILE_TYPES) + 1;
}

// 渲染游戏板
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${board[y][x]}`;
            tile.dataset.x = x;
            tile.dataset.y = y;
            gameBoard.appendChild(tile);
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('gameBoard').addEventListener('click', handleTileClick);
}

// 处理方块点击
function handleTileClick(e) {
    if (isProcessing) return;
    
    const tile = e.target;
    if (!tile.classList.contains('tile')) return;
    
    const x = parseInt(tile.dataset.x);
    const y = parseInt(tile.dataset.y);
    
    if (!selectedTile) {
        // 第一次选择
        selectedTile = { x, y };
        tile.classList.add('selected');
    } else {
        // 第二次选择
        const prevTile = document.querySelector('.selected');
        prevTile.classList.remove('selected');
        
        // 检查是否相邻
        if (isAdjacent(selectedTile.x, selectedTile.y, x, y)) {
            // 交换方块
            swapTiles(selectedTile.x, selectedTile.y, x, y);
        }
        
        selectedTile = null;
    }
}

// 检查两个方块是否相邻
function isAdjacent(x1, y1, x2, y2) {
    return (Math.abs(x1 - x2) === 1 && y1 === y2) || 
           (Math.abs(y1 - y2) === 1 && x1 === x2);
}

// 交换方块
function swapTiles(x1, y1, x2, y2) {
    isProcessing = true;
    
    // 交换数组中的位置
    [board[y1][x1], board[y2][x2]] = [board[y2][x2], board[y1][x1]];
    
    // 重新渲染
    renderBoard();
    
    // 检查匹配
    const matches = findMatches();
    if (matches.length > 0) {
        // 有匹配
        removeMatches(matches);
    } else {
        // 无匹配，交换回来
        [board[y1][x1], board[y2][x2]] = [board[y2][x2], board[y1][x1]];
        renderBoard();
        isProcessing = false;
    }
}

// 查找匹配
function findMatches() {
    const matches = [];
    
    // 检查水平匹配
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH - 2; x++) {
            const type = board[y][x];
            if (type === board[y][x + 1] && type === board[y][x + 2]) {
                // 找到匹配
                let match = [{x, y}, {x: x + 1, y}, {x: x + 2, y}];
                
                // 检查更长的匹配
                for (let i = x + 3; i < BOARD_WIDTH; i++) {
                    if (board[y][i] === type) {
                        match.push({x: i, y});
                    } else {
                        break;
                    }
                }
                
                matches.push(...match);
            }
        }
    }
    
    // 检查垂直匹配
    for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let y = 0; y < BOARD_HEIGHT - 2; y++) {
            const type = board[y][x];
            if (type === board[y + 1][x] && type === board[y + 2][x]) {
                // 找到匹配
                let match = [{x, y}, {x, y: y + 1}, {x, y: y + 2}];
                
                // 检查更长的匹配
                for (let i = y + 3; i < BOARD_HEIGHT; i++) {
                    if (board[i][x] === type) {
                        match.push({x, y: i});
                    } else {
                        break;
                    }
                }
                
                matches.push(...match);
            }
        }
    }
    
    return matches;
}

// 移除匹配的方块
function removeMatches(matches) {
    // 标记要移除的方块
    const matchedTiles = new Set();
    matches.forEach(match => {
        matchedTiles.add(`${match.x},${match.y}`);
    });
    
    // 添加消除动画
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        const x = parseInt(tile.dataset.x);
        const y = parseInt(tile.dataset.y);
        
        if (matchedTiles.has(`${x},${y}`)) {
            tile.classList.add('matched');
        }
    });
    
    // 延迟执行后续操作
    setTimeout(() => {
        // 移除匹配的方块
        matches.forEach(match => {
            board[match.y][match.x] = null;
        });
        
        // 更新分数
        score += matches.length * SCORE_PER_MATCH;
        updateScore();
        
        // 方块下落
        dropTiles();
    }, 300);
}

// 方块下落
function dropTiles() {
    // 下落现有方块
    for (let x = 0; x < BOARD_WIDTH; x++) {
        let emptyY = BOARD_HEIGHT - 1;
        
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (board[y][x] !== null) {
                board[emptyY][x] = board[y][x];
                if (emptyY !== y) {
                    board[y][x] = null;
                }
                emptyY--;
            }
        }
        
        // 填充顶部空白
        for (let y = emptyY; y >= 0; y--) {
            board[y][x] = getRandomTileType();
        }
    }
    
    // 重新渲染
    renderBoard();
    
    // 检查新的匹配
    const matches = findMatches();
    if (matches.length > 0) {
        removeMatches(matches);
    } else {
        isProcessing = false;
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 开始游戏
initGame();
