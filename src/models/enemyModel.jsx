import slime from "../assets/slime.png";
import goblin from "../assets/goblin.webp";
import dragon from "../assets/dragon.png";
import { calculateCombatResult } from "../services/CombatServices.jsx";

export const enemyMoves = {
    standardAttack: {
        name: "Standard Attack",
        move: ({ enemy, hero }) => {
            const res = calculateCombatResult(Math.floor(Math.random() * 3), enemy, hero);
            return { damage: res.damage, name: "Standard Attack" };
        }
    },
    haste: {
        name: "Haste",
        move: ({ enemy, setSpinSpeed }) => {
            setSpinSpeed(40);
            return { damage: 0, name: "Haste" };
        }
    },
    heal: {
        name: "Recover",
        move: ({ enemy }) => {
            const healAmount = Math.floor(enemy.maxHp * 0.15);
            return { damage: 0, heal: healAmount, name: "Recover" };
        }
    },
    charge: {
        name: "Preparing Ultimate Breath!",
        move: ({ setIsCharging }) => {
            setIsCharging(true);
            return { damage: 0, name: "Preparing Ultimate Breath!" };
        }
    },
    ultimate: {
        name: "Ultimate Breath",
        move: ({ enemy, hero, setIsCharging, setSpinSpeed }) => {
            setIsCharging(false);
            setSpinSpeed(100);
            const res = calculateCombatResult(2, enemy, hero);
            return { damage: Math.floor(res.damage * 2.5), name: "Ultimate Breath" };
        }
    }
};

export const enemymobs = [
    { name: "Slime", img: slime, attack: 10, defense: 2, moves: [enemyMoves.standardAttack, enemyMoves.heal] },
    { name: "Goblin", img: goblin, attack: 18, defense: 5, moves: [enemyMoves.standardAttack, enemyMoves.haste, enemyMoves.heal] },
    { name: "Dragon", img: dragon, attack: 40, defense: 15, moves: [enemyMoves.standardAttack, enemyMoves.heal] }
];