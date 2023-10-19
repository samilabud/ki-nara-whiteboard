import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Board } from '../libraries/Board.Class';

  const initDrawingSettings = {
    brushWidth: 5,
    currentMode: 'PENCIL',
    currentColor: '#000000',
    fill: false,
  };

  const initSettings = {
    zoom: 1,
    contentJSON: null,
  };


const Whiteboard = () => {
    const [board, setBoard] = useState();
    const [canvasDrawingSettings, setCanvasDrawingSettings] = useState({
      ...initDrawingSettings,
    });
    const canvasConfig = initSettings;
    const canvasRef = useRef(null);
  
    useEffect(() => {
      setCanvasDrawingSettings({ ...canvasDrawingSettings });
    }, []);
  
    useEffect(() => {
      if (!board || !canvasConfig) return;
      board.setCanvasConfig(canvasConfig);
    }, [board, canvasConfig]);
  
    useEffect(() => {
      if (board) {
        return;
      }
  
      const newBoard = new Board({
        drawingSettings: canvasDrawingSettings,
        canvasConfig: canvasConfig,
      });
  
      setBoard(newBoard);
  
      return () => {
        if (board) {
          board.removeBoard();
        }
      };
    }, [board,canvasConfig, canvasDrawingSettings]);
  
    useEffect(() => {
      if (!board || !canvasDrawingSettings) return;
  
      board.setDrawingSettings(canvasDrawingSettings);
    }, [canvasDrawingSettings, board]);

    return (
        <canvas ref={canvasRef} id="canvas" />
    );
  };
  
  export default Whiteboard;