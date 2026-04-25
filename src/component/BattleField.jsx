// src/component/BattleField.jsx
import './BattleField.css';

// 1. Receive 'stats' as a prop
function Battlefield({ stats }) { 
  
  // DELETE the local useState and useEffect that were here!
  // We want this component to be "dumb"—it just displays what Game.jsx tells it to.

  const renderCharacter = (charKey) => {
    const char = stats[charKey];
    const hpPercent = (char.hp / char.maxHp) * 100;

    return (
      <div className="character-node">
        <div className="hp-container">
          <div 
            className="hp-fill" 
            style={{ 
              width: `${hpPercent}%`, 
              backgroundColor: hpPercent < 30 ? '#ff4d4d' : '#4caf50' 
            }} 
          />
          <span className="hp-text">{char.hp} / {char.maxHp}</span>
        </div>
        
        <img src={char.img} alt={char.name} className="character-img" />
        <h3 className="character-name">{char.name}</h3>
      </div>
    );
  };

  return (
    <div className="battlefield-screen">
      <div className="battlefield-container">
        {renderCharacter('player1')}
        <div className="vs-divider">VS</div>
        {renderCharacter('player2')}
      </div>
    </div>
  );
}

export default Battlefield;