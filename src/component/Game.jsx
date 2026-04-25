import { useState } from 'react';
// Import the service math
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
// Import UI components
import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
// Import Assets (Ensure extensions are correct!)
import mainCharacter from '../assets/mainCharacter.png'; 
import enemy from '../assets/enemy.png';
import viteLogo from '../assets/vite.svg'; 
// Add other logos as needed for the spinner

function Game() {
  // 1. Define the images that appear in the spinning selector
  const spinnerImages = [viteLogo, viteLogo, viteLogo]; 

  // 2. Centralized State for both characters
  const [stats, setStats] = useState({
    player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter },
    player2: { hp: 100, maxHp: 100, name: 'Villain', img: enemy }
  });

  // 3. The logic triggered when the spacebar is pressed
  const handleCombatStop = (stoppedIndex) => {
    // Call the external service for math
    const { target, damage, message } = calculateCombatResult(stoppedIndex);
    
    console.log("Combat Log:", message);

    // Update the state based on service results
    setStats(prev => ({
      ...prev,
      [target]: {
        ...prev[target],
        hp: applyDamage(prev[target].hp, damage)
      }
    }));
  };

  return (
    <div className="game-screen">
      <h1>React Battle Game</h1>
      
      {/* Battlefield receives data via props */}
      <Battlefield stats={stats} />
      
      <hr />
      
      {/* SelectionImages receives images and the callback function */}
      <SelectionImages 
        images={spinnerImages} 
        onStop={handleCombatStop} 
        mode="left-to-right"
      />
    </div>
  );
}

export default Game;