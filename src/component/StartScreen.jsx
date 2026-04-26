import { useEffect } from 'react';

function StartScreen({ startGame }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame]);

  return (
    <div className="start-screen">
      <h1>Slot Battle</h1>
      <p>Press <strong>Spacebar</strong> to Start</p>
    </div>
  );
}

export default StartScreen;