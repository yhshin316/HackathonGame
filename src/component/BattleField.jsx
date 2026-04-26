import './BattleField.css';

function Battlefield({ stats }) { 
  const renderCharacter = (charKey) => {
    const char = stats[charKey];
    const hpPercent = (char.hp / char.maxHp) * 100;

    return (
      <div className="character-node">
        {/* TOP: HP Bar */}
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

        {/* MIDDLE: Image */}
        <div className="image-container">
          <img src={char.img} alt={char.name} className="character-img" />
        </div>
        
        {/* BOTTOM: Stats */}
        <div className="stats-container">
          <h3 className="character-name">{char.name}</h3>
          <div className="stat-row">
            <span>ATK: {char.attack}</span>
            <span>DEF: {char.defense}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="battlefield-container">
      {renderCharacter('player1')}
      <div className="vs-divider">VS</div>
      {renderCharacter('player2')}
    </div>
  );
}

export default Battlefield;