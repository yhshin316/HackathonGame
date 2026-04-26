import { useState } from 'react'
import './App.css'
import Game from './component/Game'
import StartScreen from './component/StartScreen' 

function App() {
  // 1. Initialize state. 'false' means the game hasn't started yet.
  const [gameStarted, setGameStarted] = useState(false);

  // 2. This function flips the switch to 'true'
  const handleStart = () => {
    setGameStarted(true);
  };

  return (
    <div className="app-wrapper">
      {/* 3. Conditional Rendering logic */}
      {gameStarted ? (
        <Game />
      ) : (
        <StartScreen startGame={handleStart} />
      )}
    </div>
  )
}

export default App