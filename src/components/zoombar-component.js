import ZoomInIcon from "../images/buttons/zoom-in.svg";
import ZoomOutIcon from "../images/buttons/zoom-out.svg";

const ZoomBar = ({ board, zoom }) => {
  const handleZoomIn = () => {
    board.changeZoom({ scale: 1.1 });
  };

  const handleZoomOut = () => {
    board.changeZoom({ scale: 0.9 });
  };

  const handleResetZoom = () => {
    board.resetZoom(1);
  };
  return (
    <>
      <button onClick={handleZoomIn} title="Zoom In">
        <img src={ZoomInIcon} alt="Zoom In" />
      </button>
      <button onClick={handleResetZoom}>
        <span style={{ fontSize: "11px" }}>{Math.floor(zoom * 100)}%</span>
      </button>
      <button onClick={handleZoomOut} title="Zoom Out">
        <img src={ZoomOutIcon} alt="Zoom Out" />
      </button>
    </>
  );
};

export default ZoomBar;
