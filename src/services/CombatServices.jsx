/**
 * Calculates damage based on stats: (Attack * Multiplier) - Defense
 */
export const calculateCombatResult = (stoppedIndex, attacker, defender) => {
  let multiplier = 0;
  let message = "";
  const target = 'player2'; 

  // Determine luck based on selection index
  switch (stoppedIndex) {
    case 0:
      multiplier = 0; // Miss
      message = `${attacker.name} missed entirely!`;
      break;
    case 1:
      multiplier = 1; // Standard
      message = `${attacker.name} landed a steady strike.`;
      break;
    case 2:
      multiplier = 2; // Critical
      message = `CRITICAL HIT! ${attacker.name} found a weak spot!`;
      break;
    default:
      multiplier = 1;
  }

  // Combat Math: Ensure damage is at least 0
  const baseDamage = attacker.attack * multiplier;
  const finalDamage = Math.max(0, baseDamage - defender.defense);

  const fullMessage = `${message} Dealt ${finalDamage} damage to ${defender.name}.`;

  return { target, damage: finalDamage, message: fullMessage };
};

export const applyDamage = (currentHp, damage) => {
  return Math.max(0, currentHp - damage);
};