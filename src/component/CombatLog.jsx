import React from 'react';
import './CombatLog.css';

const CombatLog = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    // Messaging Logic: We transform the raw data into strings here
    const getHeroMessage = () => {
        const { heroAction, value, type } = data;
        if (type === 'backpack') return heroAction; // Already a string from Game.jsx
        if (type === 'atk') return `Hero used Attack! Dealt ${value} damage.`;
        if (type === 'def') return `Hero used Guard! Blocked ${value} damage.`;
        if (type === 'heal') return `Hero used Heal! Restored ${value} HP.`;
        return "Hero prepares for battle...";
    };

    // src/component/CombatLog.jsx
    const getEnemyMessage = () => {
        const { enemyAction, enemyDamage } = data;

        // Specific handler for the preparation phase
        if (enemyAction === "Preparing Ultimate Breath!") {
            return "The Dragon gathers fire in its throat! (Preparing Breath)";
        }

        if (enemyDamage > 0) {
            return `${enemyAction} (Dealt ${enemyDamage} damage)`;
        }

        // Fallback if somehow still empty
        return enemyAction || "The Dragon glares at you...";
    };

    const getFinalMessage = () => {
        const { netDamage, wasDodged } = data;
        if (wasDodged) return "AMAZING! You dodged the entire attack!";
        return `End of turn: Hero took ${netDamage} damage.`;
    };

    return (
        <div className="combat-log-overlay">
            <div className="combat-log-box">
                <div className="log-content">
                    <div className="log-row hero-row">
                        <span className="log-label">HERO:</span>
                        <span className="log-text">{getHeroMessage()}</span>
                    </div>
                    <div className="log-row enemy-row">
                        <span className="log-label">ENEMY:</span>
                        <span className="log-text">{getEnemyMessage()}</span>
                    </div>
                    <hr className="log-divider" />
                    <div className="log-row final-row">
                        <span className="log-text-highlight">{getFinalMessage()}</span>
                    </div>
                </div>
                <button className="log-close-btn" onClick={onClose}>
                    CONTINUE (SPACE)
                </button>
            </div>
        </div>
    );
};

export default CombatLog;