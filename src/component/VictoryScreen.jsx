import { useState, useEffect } from 'react';
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

        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (isSpinning) {
                    stopAndGrantReward();
                } else {
                    onNext(rewardWon);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSpinning, selectedIndex, rewardImages, rewardWon, onNext]);

    const stopAndGrantReward = () => {
        setIsSpinning(false);
        const selection = rewardImages[selectedIndex];
        
        let reward = { type: selection.type, value: 0 };
        
        // Reward Logic: 
        // Indices 0,1,2 -> ATK +5, +10, +15
        // Indices 3,4,5 -> DEF +5, +10, +15
        if (selectedIndex <= 2) {
            reward.type = 'atk';
            reward.value = (selectedIndex + 1) * 5;
        } else if (selectedIndex <= 5) {
            reward.type = 'def';
            reward.value = (selectedIndex - 2) * 5;
        } else {
            reward.type = 'heal';
            reward.value = 20; 
        }

        setRewardWon(reward);
    };

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
                                    {index <= 2 ? `+${(index + 1) * 5} ATK` : index <= 5 ? `+${(index - 2) * 5} DEF` : "HEAL"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {rewardWon && (
                    <div className="reward-announcement blink">
                        REWARD CLAIMED: +{rewardWon.value} {rewardWon.type.toUpperCase()}!
                    </div>
                )}

                <button onClick={() => onNext(rewardWon)} className="action-btn">
                    {rewardWon ? "ENTER NEXT BATTLE" : "STOP SPINNER (SPACE)"}
                </button>
            </div>
        </div>
    );
}

export default VictoryScreen;