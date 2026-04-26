import { useState, useEffect, useRef } from 'react';
import { calculateCombatResult, applyDamage } from '../services/CombatServices.jsx';
import { resolveEnemyAction } from '../services/EnemyAI';
import { mainCharacters } from '../models/characterModel';
import { enemymobs } from '../models/enemyModel';
import { spinnerData } from '../models/spinnerModel';

import mainCharacter from '../assets/mainCharacter.png';
import sword from "../assets/attackAbility.jpeg";
import shield from "../assets/shieldAbility.jpeg";
import heal from "../assets/healAbility.png";

import SelectionImages from './SelectionImages';
import Battlefield from './BattleField';
import Backpack from "./Backpack";
import VictoryScreen from './VictoryScreen';
import CombatLog from './CombatLog';
import './Game.css';

function Game() {
    const [enemyIndex, setEnemyIndex] = useState(0);
    const [isCharging, setIsCharging] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(100);
    const [ultimateCooldown, setUltimateCooldown] = useState(0);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [combatData, setCombatData] = useState(null);
    const [isSpinning, setIsSpinning] = useState(true);
    const [canStop, setCanStop] = useState(true);
    const [isGameWon, setIsGameWon] = useState(false);
    const [nextTurnBuff, setNextTurnBuff] = useState(1.0);
    const [isDodging, setIsDodging] = useState(false);

    const [backpackItems, setBackpackItems] = useState([]);
    const [backpackOpen, setBackpackOpen] = useState(false);
    const [backpackIndex, setBackpackIndex] = useState(0);

    const [stats, setStats] = useState({
        player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
        player2: { ...enemymobs[0], hp: 100, maxHp: 100 }
    });

    const holdTimer = useRef(null);
    const holdStartTime = useRef(null);
    const isHoldActionActive = useRef(false);
    const currentSelectionIndex = useRef(0);

    // CRITICAL: stateRef prevents "Stale Closures" so keyboard listeners always see fresh HP
    const stateRef = useRef({});
    useEffect(() => {
        stateRef.current = {
            isLogOpen,
            isGameWon,
            stats,
            backpackOpen,
            backpackIndex,
            isSpinning,
            canStop,
            backpackItems
        };
    }, [isLogOpen, isGameWon, stats, backpackOpen, backpackIndex, isSpinning, canStop, backpackItems]);

    const getRewardForEnemy = (index) => {
        if (index === 0) return [{ label: "Attack", img: sword, quantity: 1 }];
        if (index === 1) return [{ label: "Defend", img: shield, quantity: 1 }, { label: "Heal", img: heal, quantity: 1 }];
        return [];
    };

    const handleNextEnemy = (reward) => {
        const newDrops = getRewardForEnemy(enemyIndex);
        setBackpackItems(prev => [...prev, ...newDrops]);

        const nextIdx = enemyIndex + 1;
        if (nextIdx >= enemymobs.length) {
            setIsGameWon(true);
        } else {
            setEnemyIndex(nextIdx);
            setStats(prev => {
                // Calculate bonuses based on reward type
                const bonusAtk = reward?.type === 'atk' ? reward.value : (reward?.type === 'both' ? reward.atkValue : 0);
                const bonusDef = reward?.type === 'def' ? reward.value : (reward?.type === 'both' ? reward.defValue : 0);
                const bonusHeal = reward?.type === 'heal' ? reward.value : 0;

                return {
                    player1: {
                        ...prev.player1,
                        hp: Math.min(prev.player1.maxHp, prev.player1.hp + bonusHeal),
                        attack: prev.player1.attack + bonusAtk,
                        defense: prev.player1.defense + bonusDef
                    },
                    player2: { ...enemymobs[nextIdx], hp: 100, maxHp: 100 }
                };
            });

            // Reset turn states
            setIsLogOpen(false);
            setIsSpinning(true);
            setCanStop(true);
            setUltimateCooldown(0);
            setIsCharging(false);
            setNextTurnBuff(1.0);
            setIsDodging(false);
            setSpinSpeed(100);
        }
    };

    const restartGame = () => {
        setBackpackItems([]);
        setEnemyIndex(0);
        setStats({
            player1: { hp: 100, maxHp: 100, name: 'Hero', img: mainCharacter, attack: mainCharacters[0][0], defense: mainCharacters[0][1] },
            player2: { ...enemymobs[0], hp: 100, maxHp: 100 }
        });
        setIsGameWon(false);
        setIsLogOpen(false);
        setIsSpinning(true);
        setCanStop(true);
        setUltimateCooldown(0);
        setIsCharging(false);
        setNextTurnBuff(1.0);
        setIsDodging(false);
        setSpinSpeed(100);
    };

    const useBackpackItem = (itemIndex) => {
        const item = stateRef.current.backpackItems[itemIndex];
        if (!item) return;

        setSpinSpeed(100);
        let heroActionDesc = ""; let heroHealVal = 0; let localDodge = false;
        if (item.label === "Attack") { setNextTurnBuff(1.5); heroActionDesc = "Used Buff! Next attack deals 1.5x damage."; }
        else if (item.label === "Defend") { localDodge = true; setIsDodging(true); heroActionDesc = "Used Dodge! Prepared to evade next attack."; }
        else if (item.label === "Heal") { heroHealVal = stats.player1.maxHp; heroActionDesc = "Used Full Restore! HP fully recovered."; }

        setBackpackItems(prev => {
            const updated = [...prev];
            updated[itemIndex].quantity -= 1;
            return updated.filter(i => i.quantity > 0);
        });

        const aiDecision = resolveEnemyAction({ enemy: stats.player2, isCharging, turnsSinceLastUltimate: ultimateCooldown, hpPercent: (stats.player2.hp / stats.player2.maxHp) * 100 });
        const moveRes = aiDecision.move({ enemy: stats.player2, hero: stats.player1, setIsCharging, setSpinSpeed, setDebuffTurns: () => { }, setCombatLog: () => { } });
        const enemyRaw = moveRes?.damage || 0;
        const netDmg = localDodge ? 0 : Math.max(0, enemyRaw - stats.player1.defense);

        setCombatData({ type: 'backpack', heroAction: heroActionDesc, enemyAction: aiDecision.name || moveRes?.name, enemyDamage: enemyRaw, netDamage: netDmg, wasDodged: localDodge });
        setStats(prev => ({ ...prev, player1: { ...prev.player1, hp: heroHealVal > 0 ? prev.player1.maxHp : applyDamage(prev.player1.hp, netDmg) } }));
        setIsLogOpen(true); setIsSpinning(false); setIsDodging(false);
    };

    // Keyboard controls
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                const { isLogOpen, isGameWon, stats } = stateRef.current;
                if (isLogOpen) {
                    setIsLogOpen(false);
                    setIsSpinning(true);
                    setCanStop(true);
                    return;
                }
                if (!isGameWon && stats.player1.hp > 0 && stats.player2.hp <= 0) return;
                if (isGameWon || stats.player1.hp <= 0) {
                    restartGame();
                    return;
                }
                holdStartTime.current = Date.now();
                holdTimer.current = setTimeout(() => {
                    isHoldActionActive.current = true;
                    setBackpackOpen(prev => !prev);
                }, 1000);
            }
        };

        const onKeyUp = (e) => {
            if (e.code === 'Space') {
                clearTimeout(holdTimer.current);
                const { backpackOpen, backpackIndex, isSpinning, isLogOpen, canStop } = stateRef.current;
                if (isHoldActionActive.current) {
                    isHoldActionActive.current = false;
                    holdStartTime.current = null;
                    return;
                }
                if (!holdStartTime.current) return;
                const dur = Date.now() - holdStartTime.current;
                if (dur < 1000) {
                    if (backpackOpen) {
                        useBackpackItem(backpackIndex);
                        setBackpackOpen(false);
                    } else if (isSpinning && !isLogOpen && canStop) {
                        handleCombatStop(currentSelectionIndex.current);
                    }
                }
                holdStartTime.current = null;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    const handleCombatStop = (idx) => {
        const currentData = stateRef.current;
        const currentStats = currentData.stats; // Pull fresh stats from Ref

        if (!currentData.canStop || currentData.isLogOpen || currentStats.player2.hp <= 0) return;

        setSpinSpeed(100);
        const selection = spinnerData[idx];
        setCanStop(false);
        setIsSpinning(false);

        setTimeout(() => {
            setIsSpinning(true);
            setTimeout(() => { setCanStop(true); }, 70);
        }, 200);

        // 1. Player Action
        const res = calculateCombatResult(idx % 3, currentStats.player1, currentStats.player2);

        let heroVal = (selection.type === 'atk') ? Math.floor(res.damage * nextTurnBuff) : 0;
        let heroHeal = (selection.type === 'heal') ? Math.floor((currentStats.player1.maxHp * 0.2) * selection.mult) : 0;
        let heroDef = (selection.type === 'def') ? Math.floor(currentStats.player1.defense * selection.mult) : 0;

        if (selection.type === 'atk') setNextTurnBuff(1.0);

        // 2. Enemy Action
        const hpPercent = ((currentStats.player2.hp - heroVal) / currentStats.player2.maxHp) * 100;
        const aiDecision = resolveEnemyAction({
            enemy: currentStats.player2,
            isCharging,
            turnsSinceLastUltimate: ultimateCooldown,
            hpPercent
        });

        if (aiDecision.type === 'ULTIMATE') { setIsCharging(false); setUltimateCooldown(0); }
        else if (aiDecision.type === 'CHARGE') { setIsCharging(true); }
        else if (currentStats.player2.name === "Dragon" && !isCharging) { setUltimateCooldown(prev => prev + 1); }

        const moveRes = aiDecision.move({
            enemy: currentStats.player2,
            hero: currentStats.player1,
            setIsCharging,
            setSpinSpeed,
            setDebuffTurns: () => { },
            setCombatLog: () => { }
        });

        // 3. Final HP Math
        const enemyRaw = moveRes?.damage || 0;
        const enemyHealAmount = moveRes?.heal || 0;
        const netHeroDmg = isDodging ? 0 : Math.max(0, enemyRaw - heroDef);

        const finalEnemyHp = Math.min(currentStats.player2.maxHp, applyDamage(currentStats.player2.hp, heroVal) + enemyHealAmount);
        const finalHeroHp = Math.min(currentStats.player1.maxHp, applyDamage(currentStats.player1.hp, netHeroDmg) + heroHeal);

        setCombatData({
            type: selection.type,
            value: heroVal || heroHeal || heroDef,
            heroAction: (selection.type === 'atk') ? res.message : `Action: ${selection.type.toUpperCase()}`,
            enemyAction: aiDecision.name || moveRes?.name,
            enemyDamage: enemyRaw,
            netDamage: netHeroDmg,
            wasDodged: isDodging
        });

        setStats({
            player2: { ...currentStats.player2, hp: finalEnemyHp },
            player1: { ...currentStats.player1, hp: finalHeroHp }
        });

        setIsDodging(false);

        if (finalHeroHp <= 0 || finalEnemyHp <= 0) {
            setIsLogOpen(false);
            setIsSpinning(false);
            if (finalEnemyHp <= 0 && enemyIndex + 1 >= enemymobs.length) setIsGameWon(true);
        } else {
            setIsLogOpen(true);
        }
    };

    return (
        <div className="game-screen">
            <Battlefield stats={stats} />
            <CombatLog data={combatData} isOpen={isLogOpen} onClose={() => { setIsLogOpen(false); setIsSpinning(true); setCanStop(true); }} />

            {stats.player1.hp <= 0 && (
                <div className="victory-overlay">
                    <h1>GAME OVER</h1>
                    <button onClick={restartGame}>RESTART</button>
                </div>
            )}

            {isGameWon && (
                <div className="victory-overlay">
                    <h1>CONGRATULATIONS!</h1>
                    <p>You have defeated the {stats.player2.name} and cleared the game!</p>
                    <button onClick={restartGame}>PLAY AGAIN</button>
                </div>
            )}

            {!isGameWon && stats.player1.hp > 0 && stats.player2.hp <= 0 && (
                <VictoryScreen onNext={handleNextEnemy} enemyName={stats.player2.name} rewardImages={spinnerData} />
            )}

            {!isGameWon && stats.player1.hp > 0 && stats.player2.hp > 0 && (
                <>
                    <SelectionImages
                        images={spinnerData}
                        isPlaying={isSpinning}
                        speed={spinSpeed}
                        onIndexChange={i => currentSelectionIndex.current = i}
                    />
                    {backpackOpen && (
                        <Backpack
                            visible={backpackOpen}
                            items={backpackItems}
                            onIndexChange={(idx) => setBackpackIndex(idx)}
                            speed={250}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default Game;