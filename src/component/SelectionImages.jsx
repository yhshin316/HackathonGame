import { useState, useEffect } from 'react';
import './SelectionImages.css';

function SelectionImages({ images, isPlaying, speed, onIndexChange }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const next = (prev + 1) % images.length;
                onIndexChange(next);
                return next;
            });
        }, speed); 
        return () => clearInterval(interval);
    }, [isPlaying, speed, images.length, onIndexChange]);

    return (
        <div className="selection-container">
            <div className="image-display">
                {images.map((item, index) => (
                    <div key={index} className={`image-card ${currentIndex === index ? 'active' : ''}`}>
                        <img src={item.img} alt={item.type} />
                        <div className="mult-badge">{item.mult}x</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SelectionImages;