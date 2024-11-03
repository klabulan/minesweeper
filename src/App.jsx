import { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import Board from './components/Board/Board';
import './App.css';

function App() {
  const [state, dispatch] = useGame();
  const [showHighScores, setShowHighScores] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [playerName, setPlayerName] = useState('');

  // Timer effect
  useEffect(() => {
    let interval;
    // Start timer if game has started (board exists) and is not over
    if (state.board.length > 0 && !state.isGameOver) {
      interval = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.board, state.isGameOver, dispatch]);

  const handleNewGame = () => {
    dispatch({ type: 'SHOW_DIFFICULTY_SELECT' });
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      dispatch({
        type: 'ADD_HIGH_SCORE',
        payload: {
          name: playerName.trim(),
          time: state.time,
          difficulty: state.difficulty
        }
      });
      setPlayerName('');
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">NEON MINER</h1>
        <div className="game-stats">
          <div className="stat-box">
            <div>Time</div>
            <div>{Math.floor(state.time / 60)}:{String(state.time % 60).padStart(2, '0')}</div>
          </div>
          <div className="stat-box">
            <div>Moves</div>
            <div>{state.moves}</div>
          </div>
          <div className="stat-box">
            <div>Difficulty</div>
            <div>{state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1)}</div>
          </div>
        </div>
      </div>

      {state.isGameOver && !state.isWin && (
        <div className="game-message">💥 BOOM! Game Over! 💥</div>
      )}

      {state.isGameOver && state.isWin && (
        <div className="game-message win">🎉 Congratulations! You Won! 🎉</div>
      )}

      <Board />

      <div className="game-controls">
        <button className="btn" onClick={handleNewGame}>
          New Game
        </button>
        <button className="btn" onClick={() => setShowHighScores(true)}>
          High Scores
        </button>
      </div>

      {state.showNameInput && (
        <div className="modal active">
          <div className="modal-content">
            <h2>New High Score!</h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="name-input"
                autoFocus
                required
              />
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        </div>
      )}

      {showHighScores && (
        <div className="modal active" onClick={() => setShowHighScores(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>High Scores</h2>
            <div className="difficulty-tabs">
              <button 
                className={`btn ${selectedDifficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
              >
                Easy
              </button>
              <button 
                className={`btn ${selectedDifficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('medium')}
              >
                Medium
              </button>
              <button 
                className={`btn ${selectedDifficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
              >
                Hard
              </button>
            </div>
            <div className="scores-table">
              {state.highScores[selectedDifficulty]?.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Time</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.highScores[selectedDifficulty].map((score, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{score.name}</td>
                        <td>{Math.floor(score.time / 60)}:{String(score.time % 60).padStart(2, '0')}</td>
                        <td>{new Date(score.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-scores">No scores yet</div>
              )}
            </div>
            <button className="btn" onClick={() => setShowHighScores(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
