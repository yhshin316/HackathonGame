import { enemyMoves } from '../models/enemyModel';

export const resolveEnemyAction = (context) => {
    const { 
        enemy, 
        isCharging, 
        hpPercent, 
        hasTriggeredHalfHP, 
        turnsSinceLastUltimate 
    } = context;

    const isDragon = enemy.name === "Dragon";
    const canUseUltimate = turnsSinceLastUltimate >= 3;
    const isFirstTimeBelowHalf = isDragon && !hasTriggeredHalfHP && hpPercent <= 50;
    const randomChance = Math.random() < 0.25;

    if (isCharging) {
        return { type: 'ULTIMATE', move: enemyMoves.ultimate };
    }

    if (isDragon && canUseUltimate && (isFirstTimeBelowHalf || randomChance)) {
        return { 
            type: 'CHARGE', 
            move: enemyMoves.charge, 
            isEmergency: isFirstTimeBelowHalf 
        };
    }

    const movePool = enemy.moves || [enemyMoves.standardAttack];
    const selectedMove = movePool[Math.floor(Math.random() * movePool.length)];
    return { type: 'STANDARD', move: selectedMove };
};