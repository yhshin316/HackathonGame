import { useState, useEffect, useRef } from 'react';
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
import { mainCharacters } from '../models/characterModel'; // Import your new models
import { enemymobs } from '../models/enemyModel';
import mainCharacter from '../assets/mainCharacter.png'; 
import enemy from '../assets/enemy.png';
import mainCharacterAttack from "../assets/mainCharacterAttack.png";
import sword from "../assets/attackAbility.jpeg";
import shield from "../assets/shieldAbility.jpeg";
import heal from "../assets/healAbility.png";
import Backpack from "./Backpack";

function Game() {
  const spinnerImages = [sword, shield, heal]; 

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

  const backpackItems = ["Attack", "Defend", "Heal"];
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [backpackIndex, setBackpackIndex] = useState(0);
  const intervalRef = useRef(null);
  const keyDownRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        // Prevent multiple intervals if space is held down
        if(keyDownRef.current) return;
        keyDownRef.current = true;
        
        setBackpackOpen(true);
        //Start slow rotation (600ms per step)
        intervalRef.current = setInterval(() => {
          setBackpackIndex(i => (i + 1) % backpackItems.length);
        }, 600);
      }
    };

    const onKeyUp = (e) => {
      if (e.code === "Space") {
        keyDownRef.current = false;
        // Stop rotation
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        //apply selection
        const choice = backpackItems[backpackIndex];
        applyBackpackChoice(choice);
        setBackpackOpen(false);
        setBackpackIndex(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [backpackIndex]); // backpackItems length is stable

  const applyBackpackChoice = (choice) => {
    if(choice === "Attack") {
      //apply direct damage to enemy
      const damage = Math.max(5, Math.floor(stats.player1.attack * 1.5));
      setStats(prev => ({
        ...prev,
        player2: {
          ...prev.player2,
          hp: applyDamage(prev.player2.hp, damage)
        }
      }));
      console.log("Backpack: Attack used ->", damage);
    } else if (choice === "Defend") {
      //give temporary defense buff
      setStats(prev => ({
        ...prev,
        player1: {
          ...prev.player1,
          defense: prev.player1.defense + 5
        }
      }));
      console.log("Backpack: Defend used -> +5 defense (temporary)");
      //Remove after enemy attack
    }else if (choice === "Heal") {
      const healAmount = 20;
      setStats(prev => ({
        ...prev,
        player1: {
          ...prev.player1,
          hp: Math.min(prev.player1.maxHp, prev.player1.hp + healAmount)
        }
      }));
      console.log("Backpack: Heal used ->", healAmount);
    }
  };

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
      {/*Backpack model shown while holding space */}
      <Backpack
      visible={backpackOpen}
      items={backpackItems}
      currentIndex={backpackIndex}
       />
    </div>
  );
}

export default Game;