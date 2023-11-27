import EraserIcon from "./../images/buttons/eraser.svg";
import PencilIcon from "./../images/buttons/pencil.svg";
import DragIcon from "./../images/buttons/drag.svg";

export const cursors = {
  eraser: `url(${EraserIcon}) 0 30, auto`,
  pencil: `url(${PencilIcon}) 0 80, auto`,
  drag: `url(${DragIcon}) 0 80, auto`,
};

export const getCursor = (type) => {
  return cursors[type];
};
