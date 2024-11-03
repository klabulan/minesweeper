import { createContext, useReducer, useContext } from 'react';
import { generateBoard } from '../utils/board';

const GameContext = createContext();

const DIFFICULTY_CONFIG = {
  easy: {
    rows: 8,
    cols: 12,
    bombs: 10,
    movesPerTurn: 2
  },
  medium: {
    rows: 8,
    cols: 12,
    bombs: 15,
    movesPerTurn: 3
  },
  hard: {
    rows: 8,
    cols: 12,
    bombs: 20,
    movesPerTurn: 4
  }
};

// Load scores from local storage as backup
const loadScores = () => {
  const scores = localStorage.getItem('highScores');
  if (scores) {
    return JSON.parse(scores);
  }
  return {
    easy: [],
    medium: [],
    hard: []
  };
};

// Initialize with a board
const initialState = {
  board: generateBoard('easy'),
  selectedFields: [],
  difficulty: 'easy',
  isGameOver: false,
  isWin: false,
  time: 0,
  highScores: loadScores(),
  showNameInput: false,
  moves: 0,
  showDifficultySelect: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        board: action.payload.board,
        difficulty: action.payload.difficulty,
        showDifficultySelect: false,
        highScores: state.highScores
      };
      
    case 'SELECT_FIELD':
      if (state.selectedFields.length >= DIFFICULTY_CONFIG[state.difficulty].movesPerTurn) {
        return state;
      }
      return {
        ...state,
        selectedFields: [...state.selectedFields, action.payload]
      };

    case 'UNSELECT_FIELD':
      return {
        ...state,
        selectedFields: state.selectedFields.filter(
          field => !(field.row === action.payload.row && field.col === action.payload.col)
        )
      };

    case 'REVEAL_FIELDS':
      return {
        ...state,
        board: action.payload.board,
        selectedFields: [],
        moves: state.moves + 1,
        isGameOver: action.payload.isGameOver,
        isWin: action.payload.isWin,
        showNameInput: action.payload.isWin
      };

    case 'UPDATE_TIME':
      return {
        ...state,
        time: state.time + 1
      };

    case 'ADD_HIGH_SCORE': {
      const { name, time, difficulty } = action.payload;
      const newScores = [...state.highScores[difficulty], { name, time, date: new Date().toISOString() }]
        .sort((a, b) => a.time - b.time)
        .slice(0, 10);

      const newHighScores = {
        ...state.highScores,
        [difficulty]: newScores
      };

      // Save to localStorage as backup
      localStorage.setItem('highScores', JSON.stringify(newHighScores));

      return {
        ...state,
        highScores: newHighScores,
        showNameInput: false
      };
    }

    case 'TOGGLE_FLAG':
      return {
        ...state,
        board: action.payload
      };

    case 'SHOW_DIFFICULTY_SELECT':
      return {
        ...state,
        showDifficultySelect: true
      };

    case 'HIDE_DIFFICULTY_SELECT':
      return {
        ...state,
        showDifficultySelect: false
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={[state, dispatch]}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { DIFFICULTY_CONFIG };
