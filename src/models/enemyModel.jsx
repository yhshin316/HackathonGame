import slime from "../assets/slime.png";
import goblin from "../assets/goblin.webp";
import dragon from "../assets/dragon.png";
import { calculateCombatResult } from "../services/CombatServices.jsx";

export const enemyMoves = {
    standardAttack: ({ enemy, hero, setCombatLog, setSpinSpeed }) => {
        const res = calculateCombatResult(Math.floor(Math.random() * 3), enemy, hero);
        setSpinSpeed(100);
        setCombatLog(log => ({ ...log, enemy: res.message }));
        return { damage: res.damage };
    },
    haste: ({ enemy, setCombatLog, setSpinSpeed }) => {
        setSpinSpeed(40);
        setCombatLog(log => ({ ...log, enemy: `${enemy.name} cast HASTE! The spinner is moving faster!` }));
        return { damage: 0 };
    },
    heal: ({ enemy, setCombatLog }) => {
        const healAmount = Math.floor(enemy.maxHp * 0.15);
        setCombatLog(log => ({ ...log, enemy: `${enemy.name} used RECOVER and healed for ${healAmount} HP!` }));
        return { damage: 0, heal: healAmount };
    },
    charge: ({ enemy, setCombatLog, setIsCharging, setDebuffTurns }) => {
        setIsCharging(true);
        setDebuffTurns(3);
        setCombatLog(log => ({ ...log, enemy: `${enemy.name} is GATHERING POWER and weakened the Hero!` }));
        return { damage: 0 };
    },
    ultimate: ({ enemy, hero, setCombatLog, setIsCharging, setSpinSpeed }) => {
        setIsCharging(false);
        setSpinSpeed(100);
        const res = calculateCombatResult(2, enemy, hero);
        const damage = res.damage * 2.5;
        setCombatLog(log => ({ ...log, enemy: `ULTIMATE: ${enemy.name} unleashed energy for ${damage} damage!` }));
        return { damage };
    }
};

export const enemymobs = [
    { name: "Slime", img: slime, attack: 10, defense: 5, moves: [enemyMoves.standardAttack] },
    { name: "Goblin", img: goblin, attack: 18, defense: 8, moves: [enemyMoves.standardAttack, enemyMoves.haste] },
    { name: "Dragon", img: dragon, attack: 40, defense: 20, moves: [enemyMoves.standardAttack, enemyMoves.heal] }
];