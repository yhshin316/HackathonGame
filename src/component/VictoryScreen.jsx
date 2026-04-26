import { useState, useEffect, useCallback } from 'react';
import './VictoryScreen.css';

function VictoryScreen({ onNext, enemyName, rewardImages }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(true);
    const [rewardWon, setRewardWon] = useState(null);

    useEffect(() => {
        let interval;
        if (isSpinning) {
            interval = setInterval(() => {
                setSelectedIndex((prev) => (prev + 1) % rewardImages.length);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isSpinning, rewardImages.length]);

    const stopAndGrantReward = useCallback(() => {
        setIsSpinning(false);
        const selection = rewardImages[selectedIndex];
        let reward = { type: selection.type, value: 0 };

        if (selectedIndex <= 2) {
            reward.type = 'atk';
            reward.value = (selectedIndex + 1) * 5;
        } else if (selectedIndex <= 5) {
            reward.type = 'def';
            reward.value = (selectedIndex - 2) * 5;
        } else {
            // New logic for dual stat rewards
            reward.type = 'both';
            reward.atkValue = (selectedIndex - 5) * 2; // Index 6=2, 7=4, 8=6
            reward.defValue = (selectedIndex - 5) * 2;
        }
        setRewardWon(reward);
    }, [selectedIndex, rewardImages]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (isSpinning) stopAndGrantReward();
                else if (rewardWon) onNext(rewardWon);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSpinning, rewardWon, stopAndGrantReward, onNext]);

    return (
        <div className="victory-overlay">
            <div className="victory-box">
                <h1>VICTORY!</h1>
                <p>The {enemyName} has been defeated.</p>
                <div className="reward-spinner">
                    <h3>CLAIM YOUR REWARD</h3>
                    <div className="image-grid">
                        {rewardImages.map((item, index) => (
                            <div key={index} className={`image-card ${selectedIndex === index ? 'selected' : ''}`}>
                                <img src={item.img} alt="reward" />
                                <div className="reward-text">
                                    {index <= 2 ? `+${(index + 1) * 5} ATK` :
                                        index <= 5 ? `+${(index - 2) * 5} DEF` :
                                            `+${(index - 5) * 2}/+${(index - 5) * 2}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {rewardWon && (
                    <div className="reward-announcement blink">
                        REWARD: {rewardWon.type === 'both'
                            ? `+${rewardWon.atkValue} ATK & +${rewardWon.defValue} DEF!`
                            : `+${rewardWon.value} ${rewardWon.type.toUpperCase()}!`}
                    </div>
                )}
                <button onClick={() => isSpinning ? stopAndGrantReward() : onNext(rewardWon)} className="action-btn">
                    {isSpinning ? "STOP SPINNER (SPACE)" : "ENTER NEXT BATTLE (SPACE)"}
                </button>
            </div>
        </div>
    );
}

export default VictoryScreen;