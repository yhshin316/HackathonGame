import { useState, useEffect } from "react";
import "./Backpack.css";

// Added onIndexChange and speed props
export default function Backpack({ visible, items, onIndexChange, speed = 250 }) {
    const [localIndex, setLocalIndex] = useState(0);

    useEffect(() => {
        let interval;
        // Only spin if the backpack is visible and has items
        if (visible && items.length > 0) {
            interval = setInterval(() => {
                setLocalIndex((prev) => {
                    const next = (prev + 1) % items.length;
                    // Notify parent of the new index for combat logic
                    if (onIndexChange) onIndexChange(next);
                    return next;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [visible, items.length, speed, onIndexChange]);

    return (
        <div className={`backpack ${visible ? 'open' : ''}`}>
            {items.length > 0 ? (
                items.map((item, index) => (
                    <div 
                        key={index} 
                        className={`item-slot ${localIndex === index ? 'active' : ''}`}
                    >
                        <img src={item.img} alt={item.label} />
                        <span className="qty-tag">x{item.quantity}</span> 
                    </div>
                ))
            ) : (
                <div className="empty-bag-msg">Bag is Empty</div>
            )}
        </div>
    );
}