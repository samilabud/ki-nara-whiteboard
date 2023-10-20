import React, { useEffect } from "react";
import { Board } from "../libraries/Board.Class";
import PropTypes from "prop-types";
import { canvasConfig } from "../configs/init-canvas-config";

function addListeners(canvas, setZoom) {
  canvas.on("after:render", (e) => {
    // const data = getFullData(canvas);
    // onCanvasRender(data, e, canvas);
  });

  canvas.on("zoom:change", function (data) {
    setZoom(data.scale);
  });

  canvas.on("object:added", (event) => {
    // onObjectAdded(event.target.toJSON(), event, canvas);
    // onCanvasChange(event.target.toJSON(), event, canvas);
  });

  canvas.on("object:removed", (event) => {
    // onObjectRemoved(event.target.toJSON(), event, canvas);
    // onCanvasChange(event.target.toJSON(), event, canvas);
  });

  canvas.on("object:modified", (event) => {
    // onObjectModified(event.target.toJSON(), event, canvas);
    // onCanvasChange(event.target.toJSON(), event, canvas);
  });
}

const Whiteboard = ({
  canvasRef,
  board,
  setBoard,
  setZoom,
  canvasDrawingSettings,
}) => {
  useEffect(() => {
    if (board) {
      return;
    }
    const implementBoard = () => {
      const newBoard = new Board({
        drawingSettings: canvasDrawingSettings,
        canvasConfig: canvasConfig,
      });

      setZoom(canvasConfig.zoom);
      setBoard(newBoard);
      addListeners(newBoard.canvas, setZoom);
    };
    return () => implementBoard();
  }, []);

  return <canvas ref={canvasRef} id="canvas" />;
};

Whiteboard.propTypes = {
  aspectRatio: PropTypes.number,
};

export default Whiteboard;
