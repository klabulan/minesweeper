import { DIFFICULTY_CONFIG } from '../context/GameContext';

/**
 * Generates a new game board based on difficulty settings
 * @param {string} difficulty - Game difficulty level ('easy', 'medium', 'hard')
 * @param {number} firstRow - First click row position (for safe first click)
 * @param {number} firstCol - First click column position (for safe first click)
 * @returns {Array} Generated game board
 */
export const generateBoard = (difficulty, firstRow = -1, firstCol = -1) => {
  const { rows, cols, bombs } = DIFFICULTY_CONFIG[difficulty];
  
  // Initialize empty board
  const board = Array(rows).fill().map(() => 
    Array(cols).fill().map(() => ({
      isBomb: false,
      isRevealed: false,
      isMarked: false,
      neighborBombs: 0
    }))
  );

  // Place bombs randomly, avoiding first click position
  let bombsPlaced = 0;
  while (bombsPlaced < bombs) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    
    // Skip if bomb already placed or if it's the first click position
    if (!board[row][col].isBomb && 
        (row !== firstRow || col !== firstCol) && 
        !isAdjacent(row, col, firstRow, firstCol)) {
      board[row][col].isBomb = true;
      bombsPlaced++;
    }
  }

  // Calculate neighbor bombs for each cell
  return calculateNeighbors(board);
};

/**
 * Checks if two positions are adjacent
 */
const isAdjacent = (row1, col1, row2, col2) => {
  if (row2 === -1 || col2 === -1) return false;
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
};

/**
 * Calculates the number of neighboring bombs for each cell
 */
const calculateNeighbors = (board) => {
  const rows = board.length;
  const cols = board[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!board[row][col].isBomb) {
        let count = 0;
        // Check all adjacent cells
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < rows && 
                newCol >= 0 && newCol < cols && 
                board[newRow][newCol].isBomb) {
              count++;
            }
          }
        }
        board[row][col].neighborBombs = count;
      }
    }
  }
  return board;
};

/**
 * Reveals a cell and its neighbors if it's empty
 */
export const revealCell = (board, row, col) => {
  if (!board[row][col].isRevealed && !board[row][col].isMarked) {
    board[row][col].isRevealed = true;

    // If cell is empty (no neighboring bombs), reveal neighbors
    if (board[row][col].neighborBombs === 0 && !board[row][col].isBomb) {
      const rows = board.length;
      const cols = board[0].length;

      // Check all adjacent cells
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          const newRow = row + r;
          const newCol = col + c;
          if (newRow >= 0 && newRow < rows && 
              newCol >= 0 && newCol < cols && 
              !board[newRow][newCol].isRevealed) {
            revealCell(board, newRow, newCol);
          }
        }
      }
    }
  }
  return board;
};

/**
 * Checks if the game is won
 */
export const checkWin = (board) => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (!cell.isBomb && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Toggles flag marking on a cell
 */
export const toggleFlag = (board, row, col) => {
  if (!board[row][col].isRevealed) {
    board[row][col].isMarked = !board[row][col].isMarked;
  }
  return [...board]; // Return new array reference to trigger re-render
};

/**
 * Reveals all bombs on the board (game over)
 */
export const revealAllBombs = (board) => {
  return board.map(row => 
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isBomb ? true : cell.isRevealed
    }))
  );
};
