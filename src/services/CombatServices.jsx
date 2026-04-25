// src/services/CombatService.js

/**
 * Determines what happens based on the index where the spinner stopped.
 */
export const calculateCombatResult = (stoppedIndex) => {
  // Logic example: 
  // Index 0: Miss
  // Index 1: Standard Hit
  // Index 2: Critical Hit
  
  let damage = 0;
  let message = "";
  const target = 'player2'; // The Hero (player1) is attacking the Villain (player2)

  switch (stoppedIndex) {
    case 0:
      damage = 0;
      message = "The Hero missed! 0 Damage.";
      break;
    case 1:
      damage = 15;
      message = "A solid hit! 15 Damage.";
      break;
    case 2:
      damage = 35;
      message = "CRITICAL STRIKE! 35 Damage!";
      break;
    default:
      damage = 10;
      message = "Scratched the enemy for 10 Damage.";
  }

  return { target, damage, message };
};

/**
 * A helper to calculate the new health without going below 0.
 */
export const applyDamage = (currentHp, damage) => {
  return Math.max(0, currentHp - damage);
};