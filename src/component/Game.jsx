import { useState, useEffect } from 'react';
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
import { mainCharacters } from '../models/characterModel';
import { enemymobs } from '../models/enemyModel';
import mainCharacter from '../assets/mainCharacter.png';
import atkIcon from '../assets/vite.svg';
import defendIcon from '../assets/react.svg';
import healIcon from '../assets/hero.png';
import './Game.css';

function Game() {
    const [enemyIndex, setEnemyIndex] = useState(0);

    // Updated spinnerData: Defense now uses 1.25, 1.5, and 2.0
    const spinnerData = [
        { img: atkIcon, mult: 0.5, type: 'atk' },
        { img: atkIcon, mult: 1.0, type: 'atk' },
        { img: atkIcon, mult: 1.5, type: 'atk' },
        { img: defendIcon, mult: 1.25, type: 'def' },
        { img: defendIcon, mult: 1.5, type: 'def' },
        { img: defendIcon, mult: 2.0, type: 'def' },
        { img: healIcon, mult: 0.5, type: 'heal' },
        { img: healIcon, mult: 1.0, type: 'heal' },
        { img: healIcon, mult: 1.5, type: 'heal' }
    ];

    const getEnemyStats = (index) => {
        const mobData = enemymobs[index] || enemymobs[0];
        return { 
            hp: 100, maxHp: 100, 
            name: mobData[0], img: mobData[1], 
            attack: mobData[2], defense: mobData[3] 
        };
    };

    const [stats, setStats] = useState({
        player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
        player2: getEnemyStats(0)
    });

    const [combatLog, setCombatLog] = useState(null);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [canCloseLog, setCanCloseLog] = useState(false);
    const [isSpinning, setIsSpinning] = useState(true);

    const handleNextEnemy = () => {
        const nextIdx = enemyIndex + 1;
        if (nextIdx < enemymobs.length) {
            setEnemyIndex(nextIdx);
            setStats(prev => ({
                ...prev,
                player1: { ...prev.player1, hp: 100 },
                player2: getEnemyStats(nextIdx)
            }));
            resetUI();
        } else {
            restartGame();
        }
    };

    const restartGame = () => {
        setEnemyIndex(0);
        setStats({
            player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
            player2: getEnemyStats(0)
        });
        resetUI();
    };

    const resetUI = () => {
        setCombatLog(null);
        setIsLogOpen(false);
        setCanCloseLog(false);
        setIsSpinning(true);
    };

    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.code === 'Space') {
                if (stats.player1.hp <= 0) { event.preventDefault(); restartGame(); }
                else if (stats.player2.hp <= 0) { event.preventDefault(); handleNextEnemy(); }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [stats.player1.hp, stats.player2.hp, enemyIndex]);

    const handleCombatStop = (stoppedIndex) => {
        const selection = spinnerData[stoppedIndex];
        const iconMult = selection.mult;

        setStats(prev => {
            let heroDamageDealt = 0;
            let heroHealAmount = 0;
            let heroDefBonus = 0;
            let heroActionMsg = "";

            if (selection.type === 'atk') {
                const luckIndex = stoppedIndex % 3;
                const res = calculateCombatResult(luckIndex, prev.player1, prev.player2);
                heroDamageDealt = res.damage;
                heroActionMsg = res.message;
            } else if (selection.type === 'def') {
                heroDefBonus = Math.floor(prev.player1.defense * iconMult);
                heroActionMsg = `Hero Defended! (x${iconMult} DEF)`;
            } else {
                heroHealAmount = Math.floor((prev.player1.maxHp * 0.2) * iconMult);
                heroActionMsg = `Hero Healed for ${heroHealAmount} HP!`;
            }

            const enemyRes = calculateCombatResult(Math.floor(Math.random() * 3), prev.player2, prev.player1);
            const incomingDamage = Math.max(0, enemyRes.damage - heroDefBonus);
            const netChange = incomingDamage - heroHealAmount;

            setCombatLog({
                hero: heroActionMsg,
                enemy: enemyRes.message,
                final: netChange > 0 ? `Hero lost ${netChange} HP.` : `Hero recovered/held ground!`
            });

            setIsLogOpen(true);
            setCanCloseLog(false);

            // --- TIMING UPDATES ---
            
            // 1. Log becomes interactable (Space to close) after 1 second
            setTimeout(() => setCanCloseLog(true), 1000);

            // 2. Spin starts again after 0.5 seconds
            setTimeout(() => setIsSpinning(true), 500);

            return {
                ...prev,
                player2: { ...prev.player2, hp: applyDamage(prev.player2.hp, heroDamageDealt) },
                player1: { ...prev.player1, hp: Math.min(prev.player1.maxHp, Math.max(0, prev.player1.hp - netChange)) }
            };
        });
    };

    return (
        <div className="game-screen">
            {isLogOpen && (
                <div className="combat-log-overlay">
                    <div className="combat-log-box">
                        <h3>BATTLE REPORT</h3>
                        <p>{combatLog?.hero}</p>
                        <p>{combatLog?.enemy}</p>
                        <hr />
                        <p><strong>{combatLog?.final}</strong></p>
                        <div className="log-footer">
                            {canCloseLog ? <span className="blink">SPACE TO CONTINUE</span> : "..."}
                        </div>
                    </div>
                </div>
            )}

            {stats.player1.hp <= 0 ? (
                <div className="game-over-overlay"><h1>GAME OVER</h1><button onClick={restartGame}>Restart</button></div>
            ) : stats.player2.hp <= 0 ? (
                <div className="victory-overlay"><h1>VICTORY!</h1><button onClick={handleNextEnemy}>Next</button></div>
            ) : (
                <>
                    <Battlefield stats={stats} />
                    <SelectionImages
                        images={spinnerData}
                        onStop={handleCombatStop}
                        isPlaying={isSpinning}
                        setIsPlaying={setIsSpinning}
                        isLogOpen={isLogOpen}
                        canCloseLog={canCloseLog}
                        onCloseLog={() => setIsLogOpen(false)}
                    />
                </>
            )}
        </div>
    );
}

export default Game;