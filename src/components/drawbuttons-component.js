import React, { useRef } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";
import SelectIcon from "./../images/buttons/cross.svg";
import EraserIcon from "./../images/buttons/eraser.svg";
import TextIcon from "./../images/buttons/text.svg";
import RectangleIcon from "./../images/buttons/rectangle.svg";
import LineIcon from "./../images/buttons/line.svg";
import EllipseIcon from "./../images/buttons/ellipse.svg";
import TriangleIcon from "./../images/buttons/triangle.svg";
import PencilIcon from "./../images/buttons/pencil.svg";
import DeleteIcon from "./../images/buttons/delete.svg";
import DownloadIcon from "./../images/buttons/download.svg";
import UploadIcon from "./../images/buttons/add-photo.svg";
// import FillIcon from './../images/buttons/color-fill.svg';
import UndoIcon from "./../images/buttons/undo.svg";
import RedoIcon from "./../images/buttons/redo.svg";
import { modes } from "../libraries/Board.Class";

const fileReaderInfo = {
  file: { name: "whiteboard" },
  totalPages: 1,
  currentPageNumber: 0,
  currentPage: "",
};

const DrawButtons = ({
  board,
  canvasDrawingSettings,
  setCanvasDrawingSettings,
  canvasRef,
}) => {
  const uploadPdfRef = useRef(null);

  const changeMode = (mode, e) => {
    if (canvasDrawingSettings.currentMode === mode) return;
    const newOptions = { ...canvasDrawingSettings, currentMode: mode };
    setCanvasDrawingSettings(newOptions);
  };

  const handleSaveCanvasAsImage = () => {
    canvasRef.current.toBlob(function (blob) {
      saveAs(
        blob,
        `${fileReaderInfo.file.name}${
          fileReaderInfo.currentPage ? "_page-" : ""
        }.png`,
      );
    });
  };

  const uploadImage = (e, board) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.addEventListener("load", () => {
      fabric.Image.fromURL(reader.result, (img) => {
        img.scaleToHeight(board.canvas.height);
        board.canvas.add(img);
      });
    });

    reader.readAsDataURL(file);
  };

  const onFileChange = (event, board) => {
    if (!event.target.files[0]) return;

    if (event.target.files[0].type.includes("image/")) {
      uploadImage(event, board);
    } else if (event.target.files[0].type.includes("pdf")) {
      board.clearCanvas();
    }
  };

  const bringControlTOStartPosition = (board) => {
    board.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    board.resetZoom(1);
  };

  const getControls = () => {
    const modeButtons = {
      [modes.PENCIL]: { icon: PencilIcon, name: "Pencil" },
      [modes.LINE]: { icon: LineIcon, name: "Line" },
      [modes.RECTANGLE]: { icon: RectangleIcon, name: "Rectangle" },
      [modes.ELLIPSE]: { icon: EllipseIcon, name: "Ellipse" },
      [modes.TRIANGLE]: { icon: TriangleIcon, name: "Triangle" },
      [modes.TEXT]: { icon: TextIcon, name: "Text" },
      [modes.SELECT]: { icon: SelectIcon, name: "Select" },
      [modes.ERASER]: { icon: EraserIcon, name: "Eraser" },
    };

    return Object.keys(modeButtons).map((buttonKey) => {
      const btn = modeButtons[buttonKey];
      return (
        <button
          key={buttonKey}
          className={`${
            canvasDrawingSettings.currentMode === buttonKey ? "selected" : ""
          }`}
          onClick={(e) => changeMode(buttonKey, e)}
        >
          <img src={btn.icon} alt={btn.name} />
        </button>
      );
    });
  };

  return (
    <>
      {getControls()}
      <button type="button" onClick={() => board.clearCanvas()}>
        <img src={DeleteIcon} alt="Delete" />
      </button>
      <button type="button" onClick={() => board.undo()}>
        <img src={UndoIcon} alt="Undo" />
      </button>
      <button type="button" onClick={() => board.redo()}>
        <img src={RedoIcon} alt="Redo" />
      </button>
      <div className="separator" />
      <input
        ref={uploadPdfRef}
        hidden
        accept="image/*,.pdf"
        type="file"
        onChange={(event) => onFileChange(event, board)}
      />
      <button onClick={() => uploadPdfRef.current.click()}>
        <img src={UploadIcon} alt="Upload" />
      </button>

      <button onClick={() => handleSaveCanvasAsImage(canvasRef)}>
        <img src={DownloadIcon} alt="Download" />
      </button>

      <button onClick={() => bringControlTOStartPosition(board)}>
        Move to initial location
      </button>
    </>
  );
};

export default DrawButtons;
