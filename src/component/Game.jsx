import { useState, useEffect } from 'react';
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
import { resolveEnemyAction } from '../services/EnemyAI';
import { mainCharacters } from '../models/characterModel';
import { enemymobs } from '../models/enemyModel';
import { spinnerData } from '../models/spinnerModel';

import mainCharacter from '../assets/mainCharacter.png';
import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
import VictoryScreen from './VictoryScreen';
import './Game.css';

function Game() {
    const [enemyIndex, setEnemyIndex] = useState(0);
    const [isCharging, setIsCharging] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(100);
    const [debuffTurns, setDebuffTurns] = useState(0);
    const [hasTriggeredHalfHP, setHasTriggeredHalfHP] = useState(false);
    const [ultimateCooldown, setUltimateCooldown] = useState(3);
    
    const [stats, setStats] = useState({
        player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
        player2: { ...enemymobs[0], hp: 100, maxHp: 100 }
    });

    const [combatLog, setCombatLog] = useState(null);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isSpinning, setIsSpinning] = useState(true);
    const [canStop, setCanStop] = useState(true); 
    const [isGameWon, setIsGameWon] = useState(false);

    const restartGame = () => {
        setEnemyIndex(0);
        setStats({
            player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
            player2: { ...enemymobs[0], hp: 100, maxHp: 100 }
        });
        setIsGameWon(false);
        setIsLogOpen(false);
        setIsSpinning(true);
        setCanStop(true);
        setHasTriggeredHalfHP(false);
        setUltimateCooldown(3);
        setIsCharging(false);
    };

    useEffect(() => {
        const handleRestartKey = (e) => {
            if (e.code === 'Space' && (stats.player1.hp <= 0 || isGameWon)) {
                restartGame();
            }
        };
        window.addEventListener('keydown', handleRestartKey);
        return () => window.removeEventListener('keydown', handleRestartKey);
    }, [stats.player1.hp, isGameWon]);

    const handleCombatStop = (stoppedIndex) => {
        if (!canStop || stats.player1.hp <= 0 || isGameWon) return;

        const selection = spinnerData[stoppedIndex];
        setCanStop(false); 
        setIsSpinning(false); 
        
        setStats(prev => {
            let heroActionMsg = "";
            let heroDamageDealt = 0;
            let heroHealAmount = 0;
            let heroDefBonus = 0;

            if (selection.type === 'atk') {
                const res = calculateCombatResult(stoppedIndex % 3, prev.player1, prev.player2);
                heroDamageDealt = res.damage;
                heroActionMsg = res.message;
            } else if (selection.type === 'def') {
                heroDefBonus = Math.floor(prev.player1.defense * selection.mult);
                heroActionMsg = `Hero Defended! (x${selection.mult} DEF)`;
            } else {
                heroHealAmount = Math.floor((prev.player1.maxHp * 0.2) * selection.mult);
                heroActionMsg = `Hero Healed for ${heroHealAmount} HP!`;
            }

            let currentTempLog = { hero: heroActionMsg, enemy: "", final: "" };
            const localLogSetter = (val) => {
                const update = typeof val === 'function' ? val(currentTempLog) : val;
                currentTempLog = { ...currentTempLog, ...update };
            };

            const aiDecision = resolveEnemyAction({
                enemy: prev.player2,
                isCharging,
                hpPercent: ((prev.player2.hp - heroDamageDealt) / prev.player2.maxHp) * 100,
                hasTriggeredHalfHP,
                turnsSinceLastUltimate: ultimateCooldown
            });

            const moveRes = aiDecision.move({
                enemy: prev.player2, hero: prev.player1,
                setCombatLog: localLogSetter, setIsCharging, setSpinSpeed, setDebuffTurns
            });

            if (aiDecision.type === 'ULTIMATE') setUltimateCooldown(0);
            else if (aiDecision.type === 'STANDARD' && prev.player2.name === "Dragon") {
                setUltimateCooldown(c => c + 1);
            } else if (aiDecision.type === 'CHARGE' && aiDecision.isEmergency) {
                setHasTriggeredHalfHP(true);
            }

            const enemyDmg = moveRes?.damage || 0;
            const enemyHeal = moveRes?.heal || 0;
            const netHeroDmg = Math.max(0, enemyDmg - heroDefBonus);
            const finalHeroHp = Math.min(prev.player1.maxHp, applyDamage(prev.player1.hp, netHeroDmg) + heroHealAmount);
            const finalEnemyHp = Math.min(prev.player2.maxHp, applyDamage(prev.player2.hp, heroDamageDealt) + enemyHeal);

            currentTempLog.final = `End of turn: Hero took ${netHeroDmg} damage.`;
            setCombatLog(currentTempLog);
            setIsLogOpen(true);

            // Logic to skip reward spinner for final boss
            if (finalEnemyHp <= 0 && enemyIndex + 1 >= enemymobs.length) {
                setIsGameWon(true);
                setIsLogOpen(false);
            } else {
                setTimeout(() => {
                    if (finalHeroHp > 0 && finalEnemyHp > 0) {
                        setIsSpinning(true);
                        setSpinSpeed(10); 
                        setTimeout(() => {
                            setSpinSpeed(100);
                            setCanStop(true);
                        }, 100);
                    }
                }, 100);
            }

            return {
                player1: { ...prev.player1, hp: finalHeroHp },
                player2: { ...prev.player2, hp: finalEnemyHp }
            };
        });
    };

    const handleNextEnemy = (reward) => {
        const nextIdx = enemyIndex + 1;
        if (nextIdx < enemymobs.length) {
            setEnemyIndex(nextIdx);
            setStats(prev => ({
                player1: { 
                    ...prev.player1, 
                    hp: 100, 
                    attack: reward?.type === 'atk' ? prev.player1.attack + reward.value : prev.player1.attack,
                    defense: reward?.type === 'def' ? prev.player1.defense + reward.value : prev.player1.defense
                },
                player2: { ...enemymobs[nextIdx], hp: 100, maxHp: 100 }
            }));
            setIsLogOpen(false);
            setIsSpinning(true);
            setCanStop(true);
            setHasTriggeredHalfHP(false);
            setUltimateCooldown(3);
            setIsCharging(false);
        }
    };

    return (
        <div className="game-screen">
            {stats.player1.hp <= 0 && (
                <div className="victory-overlay">
                    <div className="victory-box" style={{ borderColor: '#ff4d4d' }}>
                        <h1 style={{ color: '#ff4d4d' }}>GAME OVER</h1>
                        <p className="blink">SPACE TO RESTART</p>
                    </div>
                </div>
            )}

            {isGameWon && (
                <div className="victory-overlay">
                    <div className="victory-box" style={{ borderColor: '#ffd700' }}>
                        <h1 style={{ color: '#ffd700' }}>CONGRATULATIONS!</h1>
                        <p>The Dragon is fallen. You have cleared the dungeon!</p>
                        <p className="blink">SPACE TO RESTART JOURNEY</p>
                    </div>
                </div>
            )}

            {!isGameWon && stats.player1.hp > 0 && (
                <>
                    {isLogOpen && combatLog && (
                        <div className="combat-log-overlay">
                            <div className="combat-log-box">
                                <p>{combatLog.hero}</p>
                                <p>{combatLog.enemy}</p>
                                <hr />
                                <p><strong>{combatLog.final}</strong></p>
                                <button className="action-btn" onClick={() => setIsLogOpen(false)}>Close (Space)</button>
                            </div>
                        </div>
                    )}

                    <Battlefield stats={stats} />
                    
                    {stats.player2.hp <= 0 ? (
                        <VictoryScreen onNext={handleNextEnemy} enemyName={stats.player2.name} rewardImages={spinnerData} />
                    ) : (
                        <SelectionImages 
                            images={spinnerData} onStop={handleCombatStop} 
                            isPlaying={isSpinning} setIsPlaying={setIsSpinning}
                            speed={spinSpeed} isLogOpen={isLogOpen}
                            canCloseLog={true} onCloseLog={() => setIsLogOpen(false)}
                            canStop={canStop}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default Game;