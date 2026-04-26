// src/services/CombatServices.jsx

/**
 * Calculates damage for any attacker vs any defender.
 * Formula: (Attack * Multiplier) - Defense
 * * @param {number} stoppedIndex - The "luck" index (0, 1, or 2)
 * @param {object} attacker - Object containing the attacker's 'attack' and 'name'
 * @param {object} defender - Object containing the defender's 'defense' and 'name'
 * @returns {object} - Contains the final damage amount and a flavor text message
 */
export const calculateCombatResult = (stoppedIndex, attacker, defender) => {
  let multiplier = 1;
  let message = "";

  // 1. Determine luck based on selection index
  switch (stoppedIndex) {
    case 0:
      multiplier = 0.5; // Weak/Glancing blow
      message = `${attacker.name}'s hit was weak!`;
      break;
    case 1:
      multiplier = 1.0; // Standard hit
      message = `${attacker.name} landed a steady strike.`;
      break;
    case 2:
      multiplier = 1.5; // Critical hit
      message = `${attacker.name} landed a CRITICAL strike!`;
      break;
    default:
      multiplier = 1.0;
  }

  // 2. Combat Math: (Attack * Multiplier) - Defense
  const baseDamage = attacker.attack * multiplier;

  // Math.max ensures damage never goes below 0 (which would heal the target)
  const finalDamage = Math.max(0, Math.floor(baseDamage - defender.defense));

  const fullMessage = `${message} Dealt ${finalDamage} damage to ${defender.name}.`;

  // We return only the data; Game.jsx decides which player's HP to reduce
  return {
    damage: finalDamage,
    message: fullMessage
  };
};

/**
 * Helper to subtract health safely without going below zero
 */
export const applyDamage = (currentHp, damage) => {
  return Math.max(0, currentHp - damage);
};