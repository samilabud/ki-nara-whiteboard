import React from 'react';
import Whiteboard from './components/whiteboard-component';
import './App.css';

function App() {
  return (
    <div className="container">
      <header className="whiteBoardContainer">
        <div className='canvasContainer'>
          <Whiteboard />
        </div>
      </header>
      <section className='drawButtonsContainer'>
w
      </section>
      <section className='colorButtonsContainer'>
        e
      </section>
      <section className='zoomButtonsContainer'>
        e
      </section>
    </div>
  );
}

export default App;
