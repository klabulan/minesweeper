import { memo } from 'react';
import './Cell.css';

const Cell = memo(({ 
  isRevealed, 
  isBomb, 
  isMarked, 
  neighborBombs, 
  isSelected,
  onMouseUp 
}) => {
  const getCellContent = () => {
    if (isMarked) return '🚩';
    if (isRevealed) {
      if (isBomb) return '💣';
      if (neighborBombs > 0) return neighborBombs;
    }
    return '';
  };

  const cellClass = `cell${isRevealed ? ' revealed' : ''}${isSelected ? ' selected' : ''}${
    isRevealed && isBomb ? ' bomb' : ''
  }${isRevealed && neighborBombs > 0 ? ` number-${neighborBombs}` : ''}`;

  return (
    <div 
      className={cellClass} 
      onMouseUp={onMouseUp}
    >
      {getCellContent()}
    </div>
  );
});

Cell.displayName = 'Cell';

export default Cell;
