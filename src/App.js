import React, { useState, useEffect } from "react";
import Whiteboard from "./components/whiteboard-component";
import ZoomBar from "./components/zoombar-component";
import DrawButtons from "./components/drawbuttons-component";
import ColorButtons from "./components/colorbuttons-component";
import { initDrawingSettings } from "./configs/init-canvas-config";
import "./App.css";

function App() {
  const [board, setBoard] = useState();
  const [zoom, setZoom] = useState();
  const [canvasDrawingSettings, setCanvasDrawingSettings] =
    useState(initDrawingSettings);

  useEffect(() => {
    if (board) {
      const changeDrawingSettings = () => {
        board.setDrawingSettings(canvasDrawingSettings);
      };
      changeDrawingSettings();
    }
  }, [canvasDrawingSettings]);

  return (
    <div className="container">
      <header className="whiteBoardContainer">
        <div className="canvasContainer">
          <Whiteboard
            board={board}
            setBoard={setBoard}
            setZoom={setZoom}
            canvasDrawingSettings={canvasDrawingSettings}
          />
        </div>
      </header>
      <section className="drawButtonsContainer">
        <DrawButtons
          board={board}
          canvasDrawingSettings={canvasDrawingSettings}
          setCanvasDrawingSettings={setCanvasDrawingSettings}
        />
      </section>
      <section className="colorButtonsContainer">
        <ColorButtons
          board={board}
          canvasDrawingSettings={canvasDrawingSettings}
          setCanvasDrawingSettings={setCanvasDrawingSettings}
        />
      </section>
      <section className="zoomButtonsContainer">
        <ZoomBar
          board={board}
          zoom={zoom}
          canvasDrawingSettings={canvasDrawingSettings}
          setCanvasDrawingSettings={setCanvasDrawingSettings}
        />
      </section>
    </div>
  );
}

export default App;
