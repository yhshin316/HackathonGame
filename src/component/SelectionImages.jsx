import { useState, useEffect } from 'react';
import './SelectionImages.css';

function SelectionImages({ images, onStop, isPlaying, setIsPlaying, isLogOpen, canCloseLog, onCloseLog }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setSelectedIndex((prev) => (prev + 1) % images.length);
            }, 100);
        }

        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (isLogOpen) {
                    if (canCloseLog) onCloseLog();
                    return;
                }
                if (isPlaying) {
                    setIsPlaying(false);
                    onStop(selectedIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, selectedIndex, isLogOpen, canCloseLog, images.length, onStop, setIsPlaying, onCloseLog]);

    return (
        <div className="gallery-container">
            <div className="status-message">
                {isLogOpen ? (canCloseLog ? "Read Report - Press Space" : "Analyzing...") : "Press Space to Stop"}
            </div>
            
            <div className="spinner-wrapper">
                <div className="image-grid">
                    {images.map((item, index) => {
                        // Color logic per individual card
                        const cardMultColor = item.mult > 1 ? '#00ff00' : item.mult < 1 ? '#ff4d4d' : '#ffffff';
                        
                        return (
                            <div key={index} className={`image-card ${selectedIndex === index ? 'selected' : ''}`}>
                                <img src={item.img} alt="icon" />
                                <div className="card-multiplier" style={{ color: cardMultColor }}>
                                    x{item.mult.toFixed(1)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default SelectionImages;