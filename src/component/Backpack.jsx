import React  from "react";
import "./Backpack.css";

export default function Backpack({ visible, items = [], currentIndex = 0}) {
    if (!visible) return null;
    return (
        <div className="backpack-overlay">
            <div className="backpack-panel">
                <h3>Backpack</h3>
                <ul className="backpack-list">
                    {items.map((it, idx) => (
                        <li key={it} className={idx === currentIndex ? "selected" : ''}>
                            {it}
                        </li>
                    ))}
                </ul>
                <div className="backpack-hint">Release Space to choose</div>
            </div>
        </div>
    );
}
