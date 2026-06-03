# 小游戏工具

> 四个可离线运行的经典小游戏，均使用 Vue 3 响应式状态管理，支持键盘与触屏操作。

## 工具概览

| 游戏 | 路由 | 规模 | 核心算法 |
|------|------|------|----------|
| 2048 | `game-2048` | 4×4 网格 | 旋转-滑动模式，分布式合并 |
| 贪吃蛇 | `game-snake` | 20×20 网格 | 方向锁定 + 排除蛇身的食物随机放置 |
| 扫雷 | `game-minesweeper` | 9×9 / 16×16 / 16×30 | 首击安全生成，DFS 展开空白 |
| 数独 | `game-sudoku` | 9×9 标准盘面 | 回溯法生成唯一解盘面 |

---

## 2048 (`game-2048`)

### 工具概览

经典 2048 在 4×4 网格上进行。使用方向键或触屏滑动控制所有方块移动，相同数字方块合并。达到 2048 为胜利，无可用移动为失败。

### UI 描述

- 4×4 网格，每个格子有固定背景色，数字方块颜色随数值变化（2 浅灰到 2048 金色）。
- 顶部显示当前分数和历史最高分。
- 游戏结束后弹出胜利/失败遮罩层，提供"重新开始"按钮。

### 核心算法 —— 旋转-滑动模式

通过将网格旋转，把四个方向的滑动统一为"向左滑动"一个操作，合并逻辑只写一次。

```ts
type Grid = number[][];

function rotateGrid(grid: Grid, times: number): Grid {
  let rotated = grid.map(row => [...row]);
  for (let t = 0; t < times; t++) {
    rotated = rotated[0].map((_, i) =>
      rotated.map(row => row[i]).reverse()
    );
  }
  return rotated;
}

function slideLeft(grid: Grid): { grid: Grid; score: number } {
  let score = 0;
  const newGrid = grid.map(row => {
    // 1. 过滤非零值
    let cells = row.filter(v => v !== 0);
    // 2. 合并相邻相等值
    for (let i = 0; i < cells.length - 1; i++) {
      if (cells[i] === cells[i + 1]) {
        cells[i] *= 2;
        score += cells[i];
        cells[i + 1] = 0;
      }
    }
    // 3. 再次过滤零值并补零到行宽
    cells = cells.filter(v => v !== 0);
    while (cells.length < 4) cells.push(0);
    return cells;
  });
  return { grid: newGrid, score };
}

function move(grid: Grid, direction: 'up' | 'down' | 'left' | 'right'): {
  grid: Grid; score: number;
} {
  const rotations: Record<string, number> = {
    up: 3, down: 1, left: 0, right: 2,
  };
  // 逆时针旋转使目标方向对齐左滑
  let rotated = rotateGrid(grid, rotations[direction]);
  const { grid: slid, score } = slideLeft(rotated);
  // 转回原始方向
  const result = rotateGrid(slid, (4 - rotations[direction]) % 4);
  return { grid: result, score };
}
```

### 边界情况

- **无移动时不出新块**：滑动前后网格无变化时不生成新数字，避免用户卡死前多出无意义的 2。
- **胜利后继续**：达到 2048 后弹出胜利提示但允许玩家继续游戏冲击更高分。
- **胜利/失败检测**：胜利 = 任一格子 ≥ 2048；失败 = 所有格子非零且四个方向均不可移动。
- **触屏支持**：监听 `touchstart` 和 `touchend` 坐标差判断滑动方向，最小滑动距离阈值 30px 防止误触。
- **新方块随机**：在空白格子中随机选取一个位置，90% 概率生成 2，10% 概率生成 4。

---

## 贪吃蛇 (`game-snake`)

### 工具概览

经典贪吃蛇在 20×20 网格上进行。吃掉随机出现的食物使蛇变长，分数增加。碰墙或碰到自身则游戏结束。最高分保存在 `localStorage`。

### UI 描述

- 20×20 网格画布，蛇身绿色，蛇头深绿色，食物红色圆点。
- 顶部显示当前分数和历史最高分。
- 游戏结束弹出得分汇总，提供"再来一局"按钮。
- 移动端底部提供方向按钮。

### 核心算法 —— 游戏循环

```ts
interface SnakeState {
  body: [number, number][];
  food: [number, number];
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  gameOver: boolean;
  speed: number;
}

const GRID_SIZE = 20;
const OPPOSITE: Record<string, string> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

function updateGame(state: SnakeState): SnakeState {
  const head = state.body[0];
  const nextHead: [number, number] = [head[0], head[1]];
  switch (state.direction) {
    case 'up':    nextHead[1]--; break;
    case 'down':  nextHead[1]++; break;
    case 'left':  nextHead[0]--; break;
    case 'right': nextHead[0]++; break;
  }

  // 边界检测
  if (nextHead[0] < 0 || nextHead[0] >= GRID_SIZE ||
      nextHead[1] < 0 || nextHead[1] >= GRID_SIZE) {
    return { ...state, gameOver: true };
  }

  // 自身碰撞检测（排除尾部，因为蛇移动后尾部会移开）
  if (state.body.slice(0, -1).some(([x, y]) =>
    x === nextHead[0] && y === nextHead[1])) {
    return { ...state, gameOver: true };
  }

  const newBody = [nextHead, ...state.body];

  // 吃到食物
  if (nextHead[0] === state.food[0] && nextHead[1] === state.food[1]) {
    const newFood = randomFood(newBody);
    const newSpeed = Math.max(50, state.speed - 2); // 速度加快
    return { ...state, body: newBody, food: newFood,
      score: state.score + 10, speed: newSpeed };
  }

  newBody.pop(); // 没吃到食物则移除尾部
  return { ...state, body: newBody };
}

function randomFood(snake: [number, number][]): [number, number] {
  const occupied = new Set(snake.map(([x, y]) => `${x},${y}`));
  const available: [number, number][] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) available.push([x, y]);
    }
  }
  return available[Math.floor(Math.random() * available.length)];
}
```

### 边界情况

- **方向锁定防 180° 反转**：记录当前方向，新方向与当前方向相反时忽略输入，防止蛇原地掉头撞到自己。
- **食物不生成在蛇身上**：`randomFood` 遍历所有格子排除蛇身位置后随机选择。
- **速度递增**：每吃到一个食物 `speed` 减 2ms（间隔变短），下限 50ms 防止过快到不可操作。
- **localStorage 高分的防御**：读取高分数值前做 `try/catch` 防止 `localStorage` 不可用或数据损坏；值解析失败时回退为 0。
- **键盘事件限流**：同一帧内多次方向键输入只取最后一次，避免快速按键导致蛇在游戏循环内多次转向。
- **页面失焦处理**：`visibilitychange` 事件暂停游戏循环，恢复后不自动开始，需用户手动操作。

---

## 扫雷 (`game-minesweeper`)

### 工具概览

经典扫雷游戏，支持三种难度。首次点击保证安全（点击后才生成雷）。左键揭开格子，右键/长按标记旗帜。

### 三种难度

| 难度 | 网格 | 雷数 |
|------|------|------|
| 初级 | 9×9 | 10 |
| 中级 | 16×16 | 40 |
| 高级 | 16×30 | 99 |

### UI 描述

- 圆角方形网格，每个格子根据状态显示：空白（未揭开）、数字（已揭开，数字颜色按 1-8 各有专属色）、旗帜、问号（可选标记）。
- 顶部状态栏：剩余雷数计数器（数字 LED 风格）、计时器（从首次点击开始计时）、重置按钮（笑脸/惊讶脸/哭脸）。
- 双击或同时点击左右键（Chord）展开已揭露数字周围的安全格子。

### 核心算法 —— 首击安全 + DFS 展开

```ts
interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

function generateMines(
  rows: number, cols: number, mineCount: number, safeRow: number, safeCol: number
): boolean[][] {
  // 首击安全区：safeRow, safeCol 及其 8 邻域不能有雷
  const safeZone = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeRow + dr, c = safeCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        safeZone.add(`${r},${c}`);
      }
    }
  }

  const mines = Array.from({ length: rows }, () => Array(cols).fill(false));
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!mines[r][c] && !safeZone.has(`${r},${c}`)) {
      mines[r][c] = true;
      placed++;
    }
  }
  return mines;
}

function revealCell(grid: Cell[][], row: number, col: number): void {
  const cell = grid[row][col];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  // 如果是零邻雷格子，递归展开相邻安全区域
  if (cell.adjacentMines === 0 && !cell.isMine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
          revealCell(grid, nr, nc);
        }
      }
    }
  }
}
```

### 边界情况

- **首击安全**：雷在首次点击后才生成，确保第一个格子揭开后安全。安全区域包括点击格及其 8 邻域（最大 9 格），防止开局即面临"猜雷"困境。
- **雷数不够时安全区溢出**：如 9×9 初级难度放入 10 个雷，安全区占 9 格，剩余 72 格足够。极端情况（如自定义极高高密度）下如果安全区 + 雷数 > 总格数，则缩小安全区为仅限点击格。
- **旗帜状态不揭开**：已标记旗子的格子被左键点击时不执行任何操作，防止误触。
- **Chord 操作**：左键+右键同时点击已揭开的数字格，若周围旗帜数 = 数字，则自动揭开周围所有未标记格；若旗帜位置错误则引爆地雷。
- **胜利条件判断**：所有非雷格子被揭开即胜利，而非所有雷被标记。旗帜只是辅助手段。
- **数字颜色**：1 蓝、2 绿、3 红、4 深蓝、5 棕红、6 青、7 黑、8 灰，经典配色。
- **计时器**：首次点击启动，胜利或失败时停止，最高显示 999 秒。

---

## 数独 (`game-sudoku`)

### 工具概览

标准 9×9 数独游戏，提供三种难度（通过移除不同数量的格子实现）。支持键盘输入（1-9）、候选笔记模式、冲突高亮和答案验证。

### 三种难度

| 难度 | 移除格数 | 剩余格数 |
|------|---------|---------|
| 简单 | 30 | 51 |
| 中等 | 45 | 36 |
| 困难 | 55 | 26 |

### UI 描述

- 9×9 宫格，粗线分隔 3×3 宫。预填数字为固定深色，玩家填入的数字为蓝色。
- 选中格高亮，同行同列同宫浅色背景标注。
- 与选中格数字相同的所有格高亮。
- 冲突数字红色标记（同行/同列/同宫有重复）。
- 底部数字键盘 1-9 + 擦除 + 笔记模式切换。

### 核心算法 —— 回溯法生成 + 唯一解验证

```ts
function generateCompleteBoard(): number[][] {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(board); // 回溯求解得到一个完整解
  return board;
}

function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        // 随机排列 1-9 增加生成盘面的多样性
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true; // 所有格子已填满
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  // 检查行
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // 检查列
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // 检查 3×3 宫
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function createPuzzle(difficulty: number): { puzzle: number[][]; solution: number[][] } {
  const solution = generateCompleteBoard();
  const puzzle = solution.map(row => [...row]);

  const removeCounts = { easy: 30, medium: 45, hard: 55 };
  const toRemove = removeCounts[difficulty] || 45;

  // 随机移除格子，每次移除后验证唯一解
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= toRemove) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    // 验证唯一解：回溯时计数，超过 1 个解则回退
    if (!hasUniqueSolution(puzzle)) {
      puzzle[r][c] = backup;
    } else {
      removed++;
    }
  }
  return { puzzle, solution };
}

function hasUniqueSolution(board: number[][]): boolean {
  let count = 0;
  countSolutions(board, () => { count++; return count >= 2; });
  return count === 1; // 恰好一个解
}
```

### 边界情况

- **唯一解保证**：每移除一个格子后运行求解器验证，如果出现多解则恢复该格。这确保生成的谜题总有唯一解。
- **生成超时保护**：回溯生成在大难度下可能耗时，设置 5 秒超时，超时后返回已生成的最佳盘面。
- **冲突高亮**：用户填入数字后实时检测行/列/宫内是否有相同数字，冲突以红色高亮。注意这不是判断"对错"——用户数字可能与最终解不同但尚未冲突。
- **笔记模式**：点击底部"笔记"开关启用后，点击数字不是填入而是切换该格的候选数字标记（小字显示 1-9）。笔记模式下不触发冲突检测。
- **答案验证**：提供"检查答案"按钮，对比当前填入数字与完整解。错误格标红，缺失格标黄，全部正确显示通关提示。
- **键盘输入**：方向键移动选中格，数字键 1-9 填入，Delete/Backspace 清除，空格键切换笔记模式。
- **不可修改预填数字**：原始盘面中的给定数字不可被覆盖或清除，选中时无操作效果。
- **完成检测**：每次玩家填入数字后检查是否所有空格已填且无冲突——注意这里只需检查无冲突，因为唯一解保证了冲突消除即正确。
