import { useState, useEffect } from 'react';
import './SelectionImages.css';

function SelectionImages({ images = [], mode = 'left-to-right', onStop }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setSelectedIndex((prevIndex) => {
                    if (mode === 'left-to-right') return (prevIndex + 1) % images.length;
                    if (mode === 'right-to-left') return prevIndex <= 0 ? images.length - 1 : prevIndex - 1;
                    if (mode === 'random') return Math.floor(Math.random() * images.length);
                    return prevIndex;
                });
            }, 100);
        }

        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();

                setIsPlaying((prev) => {
                    const wasPlaying = prev;
                    // If we were spinning and are now stopping, trigger the callback
                    if (wasPlaying && onStop) {
                        onStop(selectedIndex); 
                    }
                    return !prev;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
        // Dependency array ensures the listener sees current index and the stop function
    }, [images.length, mode, isPlaying, selectedIndex, onStop]); 

    return (
        <div className="gallery-container">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`image-card ${selectedIndex === index ? 'selected' : ''}`}
                >   
                    <img src={img} alt={`option-${index}`} />
                </div>
            ))}
            <div className="status-message">
                {!isPlaying ? <strong>Spacebar Pressed - Action Locked!</strong> : "Press Space to Stop"}
            </div>
        </div>
    );
}

export default SelectionImages;