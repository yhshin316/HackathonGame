import { useState } from 'react';
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
import { mainCharacters } from '../models/characterModel'; // Import your new models
import { enemymobs } from '../models/enemyModel';
import mainCharacter from '../assets/mainCharacter.png'; 
import enemy from '../assets/enemy.png';
import viteLogo from '../assets/vite.svg';

function Game() {
  const spinnerImages = [viteLogo, viteLogo, viteLogo]; 

  // Select which character/enemy to use from the arrays
  const heroIndex = 0; 
  const enemyIndex = 0;

  const [stats, setStats] = useState({
    player1: { 
      hp: 100, 
      maxHp: 100, 
      name: 'Hero', 
      img: mainCharacter,
      // Accessing [attack, defense] from your characterModel.jsx array
      attack: mainCharacters[heroIndex][0],
      defense: mainCharacters[heroIndex][1]
    },
    player2: { 
      hp: 100, 
      maxHp: 100, 
      name: 'Villain', 
      img: enemy,
      // Accessing [attack, defense] from your enemyModel.jsx array
      attack: enemymobs[enemyIndex][0],
      defense: enemymobs[enemyIndex][1]
    }
  });

  const handleCombatStop = (stoppedIndex) => {
    // Pass both characters to the service so it can check their stats
    const { target, damage, message } = calculateCombatResult(
      stoppedIndex, 
      stats.player1, 
      stats.player2
    );
    
    console.log("Combat Log:", message);

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
      <Battlefield stats={stats} />
      <hr />
      <SelectionImages 
        images={spinnerImages} 
        onStop={handleCombatStop} 
        mode="left-to-right"
      />
    </div>
  );
}

export default Game;