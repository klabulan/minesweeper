import { useCallback, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { generateBoard, revealCell, checkWin, revealAllBombs, toggleFlag } from '../../utils/board';
import { DIFFICULTY_CONFIG } from '../../context/GameContext';
import Cell from './Cell';
import './Board.css';

const Board = () => {
  const [state, dispatch] = useGame();
  const { board, selectedFields, difficulty, showDifficultySelect, isGameOver, isWin } = state;
  const [isFirstMove, setIsFirstMove] = useState(true);

  // Calculate remaining safe tiles
  const getRemainingMovesCount = useCallback(() => {
    let remainingSafeTiles = 0;
    let configMoves = DIFFICULTY_CONFIG[difficulty].movesPerTurn;

    // Count unrevealed and unflagged tiles that don't have bombs
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        const cell = board[row][col];
        if (!cell.isRevealed && !cell.isMarked && !cell.isBomb) {
          remainingSafeTiles++;
        }
      }
    }

    // Return the minimum between config moves and remaining safe tiles
    return Math.min(configMoves, remainingSafeTiles);
  }, [board, difficulty]);

  const handleCellClick = useCallback((row, col, e) => {
    e.preventDefault(); // Prevent default context menu
    
    // Prevent clicks if game is over
    if (isGameOver) return;
    
    const cell = board[row][col];
    
    // Handle right click for marking
    if (e.button === 2) {
      const newBoard = JSON.parse(JSON.stringify(board));
      // If cell is selected, unselect it when flagging
      if (selectedFields.some(field => field.row === row && field.col === col)) {
        dispatch({ 
          type: 'UNSELECT_FIELD', 
          payload: { row, col } 
        });
      }
      dispatch({
        type: 'TOGGLE_FLAG',
        payload: toggleFlag(newBoard, row, col)
      });
      return;
    }

    // Left click on flagged cell should do nothing
    if (cell.isMarked) return;

    if (cell.isRevealed) return;

    // Handle first move
    if (isFirstMove) {
      const newBoard = generateBoard(difficulty, row, col); // Pass click position for safe first move
      dispatch({ 
        type: 'START_GAME', 
        payload: { 
          board: revealCell(newBoard, row, col),
          difficulty 
        } 
      });
      setIsFirstMove(false);
      return;
    }

    const isSelected = selectedFields.some(
      field => field.row === row && field.col === col
    );

    if (isSelected) {
      dispatch({ 
        type: 'UNSELECT_FIELD', 
        payload: { row, col } 
      });
    } else {
      // Check if we can select more fields
      const maxMoves = getRemainingMovesCount();
      if (selectedFields.length >= maxMoves) return;

      dispatch({ 
        type: 'SELECT_FIELD', 
        payload: { row, col } 
      });

      // If we have enough selections, reveal one random tile
      if (selectedFields.length + 1 >= maxMoves) {
        let newBoard = JSON.parse(JSON.stringify(board));
        let isGameOver = false;
        let isWin = false;

        // Get all selected fields including the current one
        const allSelectedFields = [...selectedFields, { row, col }];
        
        // Choose one random field to reveal
        const randomIndex = Math.floor(Math.random() * allSelectedFields.length);
        const fieldToReveal = allSelectedFields[randomIndex];
        
        // Reveal only the randomly selected field
        newBoard = revealCell(newBoard, fieldToReveal.row, fieldToReveal.col);
        
        // Check if revealed field was a bomb
        if (newBoard[fieldToReveal.row][fieldToReveal.col].isBomb) {
          newBoard = revealAllBombs(newBoard);
          isGameOver = true;
        }

        // Check win condition if no bomb was hit
        if (!isGameOver) {
          isWin = checkWin(newBoard);
          isGameOver = isWin;
          
          if (isWin) {
            const currentTime = state.time;
            if (currentTime < state.bestTime || state.bestTime === 0) {
              dispatch({
                type: 'UPDATE_BEST_TIME',
                payload: currentTime
              });
            }
          }
        }

        dispatch({ 
          type: 'REVEAL_FIELDS', 
          payload: { 
            board: newBoard,
            isGameOver,
            isWin
          } 
        });
      }
    }
  }, [board, selectedFields, difficulty, dispatch, state.time, state.bestTime, isFirstMove, isGameOver, getRemainingMovesCount]);

  const handleNewGame = useCallback((newDifficulty = difficulty) => {
    const newBoard = generateBoard(newDifficulty);
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        board: newBoard, 
        difficulty: newDifficulty 
      } 
    });
    setIsFirstMove(true);
  }, [difficulty, dispatch]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  if (!board.length) return null;

  return (
    <>
      <div className={`game-grid ${isGameOver ? 'inactive' : ''}`} onContextMenu={handleContextMenu}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                {...cell}
                isSelected={selectedFields.some(
                  field => field.row === rowIndex && field.col === colIndex
                )}
                onMouseUp={(e) => handleCellClick(rowIndex, colIndex, e)}
              />
            ))}
          </div>
        ))}
      </div>

      {showDifficultySelect && (
        <div className="modal active">
          <div className="modal-content">
            <h2>Select Difficulty</h2>
            <div className="difficulty-buttons">
              <button className="btn" onClick={() => handleNewGame('easy')}>Easy</button>
              <button className="btn" onClick={() => handleNewGame('medium')}>Medium</button>
              <button className="btn" onClick={() => handleNewGame('hard')}>Hard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Board;
