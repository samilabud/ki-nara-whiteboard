import { RangeInputS } from "./styles/thicker-styles";

function _extends() {
  _extends = Object.assign
    ? Object.assign.bind()
    : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
  return _extends.apply(this, arguments);
}

function changeCurrentColor(
  board,
  canvasDrawingSettings,
  setCanvasDrawingSettings,
  color,
  e,
) {
  board.canvas.freeDrawingBrush.color = color;

  var newOptions = _extends({}, canvasDrawingSettings, {
    currentColor: color,
  });

  setCanvasDrawingSettings(newOptions);
  // onOptionsChange(newOptions, e, board.canvas);
}

const ColorButtons = ({
  board,
  canvasDrawingSettings,
  setCanvasDrawingSettings,
}) => {
  const colors = ["#6161ff", "#ff4f4f", "#3fd18d", "#ec70ff", "#000000"];
  return colors.map((color) => (
    <div key={color}>
      <button
        className="colorButton"
        color={color}
        onClick={(e) =>
          changeCurrentColor(
            board,
            canvasDrawingSettings,
            setCanvasDrawingSettings,
            color,
            e,
          )
        }
        style={{ backgroundColor: color }}
      />
    </div>
  ));
};

const changeBrushWidth = (
  e,
  board,
  canvasDrawingSettings,
  setCanvasDrawingSettings,
) => {
  const intValue = parseInt(e.target.value);
  board.canvas.freeDrawingBrush.width = intValue;
  const newOptions = { ...canvasDrawingSettings, brushWidth: intValue };
  setCanvasDrawingSettings(newOptions);
};

export const ColorThicker = ({
  board,
  canvasDrawingSettings,
  setCanvasDrawingSettings,
}) => (
  <RangeInputS
    type="range"
    min={1}
    max={30}
    step={1}
    thumbcolor={canvasDrawingSettings.currentColor}
    value={canvasDrawingSettings.brushWidth}
    onChange={(event) =>
      changeBrushWidth(
        event,
        board,
        canvasDrawingSettings,
        setCanvasDrawingSettings,
      )
    }
  />
);

export default ColorButtons;
