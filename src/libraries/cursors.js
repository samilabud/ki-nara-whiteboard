import EraserIcon from "./../images/buttons/eraser.svg";
import PencilIcon from "./../images/buttons/pencil.svg";

export const cursors = {
  eraser: `url(${EraserIcon}) 0 30, auto`,
  pencil: `url(${PencilIcon}) 0 80, auto`,
};

export const getCursor = (type) => {
  return cursors[type];
};
