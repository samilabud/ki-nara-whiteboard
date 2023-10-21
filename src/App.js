import React, { useState, useEffect, useRef } from "react";
import Whiteboard from "./components/whiteboard-component";
import ZoomBar from "./components/zoombar-component";
import DrawButtons from "./components/drawbuttons-component";
import ColorButtons, {
  ColorThicker,
} from "./components/colorbuttons-component";
import { initDrawingSettings } from "./configs/init-canvas-config";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
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
            canvasRef={canvasRef}
            board={board}
            setBoard={setBoard}
            setZoom={setZoom}
            canvasDrawingSettings={canvasDrawingSettings}
          />
        </div>
      </header>
      <section className="drawButtonsContainer">
        <DrawButtons
          canvasRef={canvasRef}
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
        <ColorThicker
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
