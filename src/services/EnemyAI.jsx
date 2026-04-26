import { enemyMoves } from '../models/enemyModel';

export const resolveEnemyAction = (context) => {
    const { enemy, isCharging, hpPercent, turnsSinceLastUltimate } = context;
    const isDragon = enemy.name === "Dragon";
    const cooldownReady = turnsSinceLastUltimate >= 3;
    const isBelowHalfHP = hpPercent <= 50;

    if (isCharging) return { type: 'ULTIMATE', move: enemyMoves.ultimate.move, name: enemyMoves.ultimate.name };
    if (isDragon && isBelowHalfHP && cooldownReady) return { type: 'CHARGE', move: enemyMoves.charge.move, name: "Preparing Ultimate Breath!" };

    // Standard move selection
    const movePool = (enemy.moves && enemy.moves.length > 0) ? enemy.moves : [enemyMoves.standardAttack];
    const selectedObj = movePool[Math.floor(Math.random() * movePool.length)];

    if (selectedObj.name === "Haste") {
        const originalMove = selectedObj.move;
        return {
            type: 'STANDARD',
            name: "Haste",
            move: (params) => {
                const res = originalMove(params);
                return { ...res, damage: Math.floor(enemy.attack * 0.5) }; 
            }
        };
    }
    return { type: 'STANDARD', move: selectedObj.move, name: selectedObj.name };
};