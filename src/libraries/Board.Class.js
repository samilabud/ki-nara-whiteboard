import { fabric } from "fabric";
import { getCursor } from "./cursors";

export const modes = {
  PENCIL: "PENCIL",
  LINE: "LINE",
  RECTANGLE: "RECTANGLE",
  TRIANGLE: "TRIANGLE",
  ELLIPSE: "ELLIPSE",
  ERASER: "ERASER",
  SELECT: "SELECT",
  TEXT: "TEXT",
  DRAG: "DRAG",
};

export class Board {
  canvas;
  modes;
  cursorPencil = getCursor("pencil");
  cursorDrag = getCursor("drag");
  mouseDown = false;
  drawInstance = null;
  drawingSettings;
  canvasConfig = {
    zoom: 1,
    contentJSON: null,
    minZoom: 0.05,
    maxZoom: 9.99,
    viewportTransform: [1, 0, 0, 1, 0, 0],
  };
  canvasState = [];
  currentState = -1;

  constructor(params) {
    if (params) {
      this.drawingSettings = params.drawingSettings;
    }
    this.canvas = this.initCanvas(this.canvasConfig);

    this.canvas.once("after:render", () => {
      this.applyCanvasConfig(params.canvasConfig);
    });

    this.modes = modes;
    this.resetZoom();
    this.setDrawingMode(this.drawingSettings.currentMode);
    this.addZoomListeners();
    this.canvasState = [];
    this.currentState = -1;
  }

  initCanvas() {
    fabric.Canvas.prototype.getItemByAttr = function (attr, name) {
      var object = null,
        objects = this.getObjects();
      for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i][attr] && objects[i][attr] === name) {
          object = objects[i];
          break;
        }
      }
      return object;
    };

    const canvasElement = document.getElementById("canvas");
    if (!canvasElement) return;

    const parentElement = canvasElement.parentNode;

    const canvas = new fabric.Canvas("canvas");
    canvas.perPixelTargetFind = true;

    if (parentElement) {
      this.element = this.handleResize(
        this.resizeCanvas(canvas, parentElement).bind(this)
      );
      this.element.observe(parentElement);
    }
    return canvas;
  }

  applyCanvasConfig(canvasConfig) {
    this.canvasConfig = { ...this.canvasConfig, ...canvasConfig };
    if (this.canvasConfig.zoom) {
      this.canvas.setZoom(this.canvasConfig.zoom);
    }
    if (this.canvasConfig.contentJSON) {
      this.canvas.loadFromJSON(this.canvasConfig.contentJSON);
    }
    if (this.canvasConfig.viewportTransform) {
      this.canvas.viewportTransform = this.canvasConfig.viewportTransform;
      this.changeZoom({ scale: 1 });
    }

    this.saveCanvasState();
    this.canvas.requestRenderAll();
    this.canvas.fire("config:change");
  }

  addZoomListeners() {
    const canvas = this.canvas;
    const that = this;
    canvas.off("mouse:wheel");
    canvas.off("touch:gesture");

    canvas.on("mouse:wheel", function (opt) {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      if (opt.e.ctrlKey) {
        const delta = opt.e.deltaY;
        const scale = 0.995 ** delta;
        const point = { x: opt.e.offsetX, y: opt.e.offsetY };
        that.changeZoom({ point, scale });
      } else {
        const e = opt.e;
        let vpt = canvas.viewportTransform;
        vpt[4] -= e.deltaX;
        vpt[5] -= e.deltaY;

        canvas.requestRenderAll();
      }
    });

    canvas.on("touch:gesture", (event) => {
      if (event.e.touches && event.e.touches.length === 2) {
        const point1 = {
          x: event.e.touches[0].clientX,
          y: event.e.touches[0].clientY,
        };
        const point2 = {
          x: event.e.touches[1].clientX,
          y: event.e.touches[1].clientY,
        };

        let prevDistance = canvas.getPointerDistance(point1, point2);

        canvas.on("touch:gesture", (event) => {
          const newDistance = canvas.getPointerDistance(point1, point2);
          const zoom = newDistance / prevDistance;

          const point = {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2,
          };

          const scale = zoom;

          that.changeZoom({ point, scale });
          canvas.renderAll();

          prevDistance = newDistance;
        });
      }
    });
  }

  setDrawingSettings(drawingSettings) {
    if (!drawingSettings) return;

    this.drawingSettings = { ...this.drawingSettings, ...drawingSettings };
    this.setDrawingMode(this.drawingSettings.currentMode);
  }

  setCanvasConfig(canvasConfig) {
    if (!canvasConfig) return;
    this.applyCanvasConfig(canvasConfig);
  }

  setDrawingMode(mode) {
    this.drawingSettings.currentMode = mode;
    this.resetCanvas();

    switch (mode) {
      case this.modes.PENCIL:
        this.draw();
        break;
      case this.modes.LINE:
        this.createLine();
        break;
      case this.modes.RECTANGLE:
        this.createRect();
        break;
      case this.modes.ELLIPSE:
        this.createEllipse();
        break;
      case this.modes.TRIANGLE:
        this.createTriangle();
        break;
      case this.modes.ERASER:
        this.eraserOn();
        break;
      case this.modes.SELECT:
        this.onSelectMode();
        break;
      case this.modes.TEXT:
        this.createText();
        break;
      case this.modes.DRAG:
        this.dragOn();
        break;
      default:
        this.draw();
    }
  }

  resetCanvas() {
    const canvas = this.canvas;

    this.removeCanvasListener(canvas);
    canvas.selection = false;
    canvas.isDrawingMode = false;
    canvas.defaultCursor = "auto";
    canvas.hoverCursor = "auto";
    canvas.getObjects().map((item) => item.set({ selectable: false }));

    if (this.editedTextObject) {
      this.editedTextObject.exitEditing();
      this.editedTextObject = null;
    }
  }

  throttle(f, delay = 300) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => f.apply(this, args), delay);
    };
  }

  handleResize(callback) {
    const resize_ob = new ResizeObserver(this.throttle(callback, 300));
    return resize_ob;
  }

  resizeCanvas(canvas, whiteboard) {
    return function () {
      const width = whiteboard.clientWidth;
      const height = whiteboard.clientHeight;
      this.changeZoom({ scale: 1 });
      canvas.setDimensions({ width: width, height: height });
      this.saveCanvasState();
    };
  }

  removeCanvasListener() {
    const canvas = this.canvas;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("mouse:over");
  }

  draw() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = drawingSettings.brushWidth;
    canvas.freeDrawingBrush.color = drawingSettings.currentColor;
    canvas.isDrawingMode = true;
    canvas.freeDrawingCursor = this.cursorPencil;
    canvas.on("mouse:up", this.stopDrawing.bind(this));
  }

  createLine() {
    const canvas = this.canvas;

    canvas.on("mouse:down", this.startAddLine().bind(this));
    canvas.on("mouse:move", this.startDrawingLine().bind(this));
    canvas.on("mouse:up", this.stopDrawing.bind(this));

    canvas.defaultCursor = this.cursorPencil;
    canvas.hoverCursor = this.cursorPencil;
    canvas.discardActiveObject().requestRenderAll();
  }

  startAddLine() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    return function ({ e }) {
      this.mouseDown = true;

      let pointer = canvas.getPointer(e);
      this.drawInstance = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          strokeWidth: drawingSettings.brushWidth,
          stroke: drawingSettings.currentColor,
          selectable: false,
        }
      );

      canvas.add(this.drawInstance);
      canvas.requestRenderAll();
    };
  }

  startDrawingLine() {
    const canvas = this.canvas;
    return function ({ e }) {
      if (this.mouseDown) {
        const pointer = canvas.getPointer(e);
        this.drawInstance.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        this.drawInstance.setCoords();
        canvas.requestRenderAll();
      }
    };
  }

  createRect() {
    const canvas = this.canvas;
    canvas.isDrawingMode = true;

    canvas.on("mouse:down", this.startAddRect().bind(this));
    canvas.on("mouse:move", this.startDrawingRect().bind(this));
    canvas.on("mouse:up", this.stopDrawing.bind(this));

    canvas.selection = false;
    canvas.defaultCursor = this.cursorPencil;
    canvas.hoverCursor = this.cursorPencil;
    canvas.isDrawingMode = false;
    canvas.getObjects().map((item) => item.set({ selectable: false }));
    canvas.discardActiveObject().requestRenderAll();
  }

  startAddRect() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    return function ({ e }) {
      this.mouseDown = true;

      const pointer = canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;

      this.drawInstance = new fabric.Rect({
        stroke: drawingSettings.currentColor,
        strokeWidth: drawingSettings.brushWidth,
        fill: drawingSettings.fill
          ? drawingSettings.currentColor
          : "transparent",
        left: this.origX,
        top: this.origY,
        width: 0,
        height: 0,
        selectable: false,
      });

      canvas.add(this.drawInstance);

      this.drawInstance.on(
        "mousedown",
        function (e) {
          if (drawingSettings.currentMode === this.modes.ERASER) {
            canvas.remove(e.target);
          }
        }.bind(this)
      );
    };
  }

  startDrawingRect() {
    const canvas = this.canvas;
    return function ({ e }) {
      if (this.mouseDown) {
        const pointer = canvas.getPointer(e);

        if (pointer.x < this.origX) {
          this.drawInstance.set("left", pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set("top", pointer.y);
        }
        this.drawInstance.set({
          width: Math.abs(pointer.x - this.origX),
          height: Math.abs(pointer.y - this.origY),
        });
        this.drawInstance.setCoords();
        canvas.renderAll();
      }
    };
  }

  stopDrawing() {
    this.mouseDown = false;
    this.saveCanvasState();
  }

  createEllipse() {
    //main
    const canvas = this.canvas;
    canvas.isDrawingMode = true;

    canvas.on("mouse:down", this.startAddEllipse().bind(this));
    canvas.on("mouse:move", this.startDrawingEllipse().bind(this));
    canvas.on("mouse:up", this.stopDrawing.bind(this));

    canvas.selection = false;
    canvas.defaultCursor = this.cursorPencil;
    canvas.hoverCursor = this.cursorPencil;
    canvas.isDrawingMode = false;
    canvas.getObjects().map((item) => item.set({ selectable: false }));
    canvas.discardActiveObject().requestRenderAll();
  }

  startAddEllipse() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    return function ({ e }) {
      this.mouseDown = true;

      const pointer = canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;
      this.drawInstance = new fabric.Ellipse({
        stroke: drawingSettings.currentColor,
        strokeWidth: drawingSettings.brushWidth,
        fill: drawingSettings.fill
          ? drawingSettings.currentColor
          : "transparent",
        left: this.origX,
        top: this.origY,
        cornerSize: 7,
        objectCaching: false,
        selectable: false,
      });

      canvas.add(this.drawInstance);
    };
  }

  startDrawingEllipse() {
    const canvas = this.canvas;

    return function ({ e }) {
      if (this.mouseDown) {
        const pointer = canvas.getPointer(e);
        if (pointer.x < this.origX) {
          this.drawInstance.set("left", pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set("top", pointer.y);
        }
        this.drawInstance.set({
          rx: Math.abs(pointer.x - this.origX) / 2,
          ry: Math.abs(pointer.y - this.origY) / 2,
        });
        this.drawInstance.setCoords();
        canvas.renderAll();
      }
    };
  }

  createTriangle() {
    const canvas = this.canvas;
    canvas.isDrawingMode = true;

    canvas.on("mouse:down", this.startAddTriangle().bind(this));
    canvas.on("mouse:move", this.startDrawingTriangle().bind(this));
    canvas.on("mouse:up", this.stopDrawing.bind(this));

    canvas.selection = false;
    canvas.defaultCursor = this.cursorPencil;
    canvas.hoverCursor = this.cursorPencil;
    canvas.isDrawingMode = false;
    canvas.getObjects().map((item) => item.set({ selectable: false }));
    canvas.discardActiveObject().requestRenderAll();
  }

  startAddTriangle() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    return function ({ e }) {
      this.mouseDown = true;
      drawingSettings.currentMode = this.modes.TRIANGLE;

      const pointer = canvas.getPointer(e);
      this.origX = pointer.x;
      this.origY = pointer.y;
      this.drawInstance = new fabric.Triangle({
        stroke: drawingSettings.currentColor,
        strokeWidth: drawingSettings.brushWidth,
        fill: drawingSettings.fill
          ? drawingSettings.currentColor
          : "transparent",
        left: this.origX,
        top: this.origY,
        width: 0,
        height: 0,
        selectable: false,
      });

      canvas.add(this.drawInstance);
    };
  }

  startDrawingTriangle() {
    const canvas = this.canvas;
    return function ({ e }) {
      if (this.mouseDown) {
        const pointer = canvas.getPointer(e);
        if (pointer.x < this.origX) {
          this.drawInstance.set("left", pointer.x);
        }
        if (pointer.y < this.origY) {
          this.drawInstance.set("top", pointer.y);
        }
        this.drawInstance.set({
          width: Math.abs(pointer.x - this.origX),
          height: Math.abs(pointer.y - this.origY),
        });

        this.drawInstance.setCoords();
        canvas.renderAll();
      }
    };
  }

  createText() {
    const canvas = this.canvas;
    canvas.isDrawingMode = true;

    canvas.on("mouse:down", (e) => this.addText.call(this, e));

    canvas.isDrawingMode = false;

    this.saveCanvasState();
  }

  addText(e) {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;

    const pointer = canvas.getPointer(e);
    this.origX = pointer.x;
    this.origY = pointer.y;
    const text = new fabric.Textbox("", {
      left: this.origX - 10,
      top: this.origY - 10,
      fontSize: drawingSettings.brushWidth * 3 + 10,
      fill: drawingSettings.currentColor,
      editable: true,
      perPixelTargetFind: false,
      keysMap: {
        13: "exitEditing",
      },
    });

    canvas.add(text);
    canvas.renderAll();

    text.enterEditing();

    this.editedTextObject = text;

    canvas.off("mouse:down");
    canvas.once(
      "mouse:down",
      function (e1) {
        if (text.isEditing) {
          text.exitEditing();
          this.editedTextObject = null;
          canvas.once("mouse:down", (e2) => {
            this.addText.call(this, e2);
          });
        } else {
          this.addText.call(this, e1);
        }
      }.bind(this)
    );

    this.saveCanvasState();
  }

  eraserOn() {
    const canvas = this.canvas;
    canvas.isDrawingMode = false;

    canvas.on("mouse:down", (event) => {
      if (event.target) {
        canvas.remove(event.target);
        canvas.remove(event.target);
        this.saveCanvasState();
      } else {
        canvas.on("mouse:move", (e) => {
          if (e.target && e.target.opacity === 0.2) {
            canvas.remove(e.target);
            this.saveCanvasState();
          }
        });
      }
    });

    canvas.on("mouse:up", () => {
      canvas.off("mouse:move");
    });

    canvas.on("mouse:over", (event) => {
      const hoveredObject = event.target;
      if (hoveredObject) {
        hoveredObject.set({
          opacity: 0.2,
        });
        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:out", (event) => {
      const hoveredObject = event.target;
      if (hoveredObject) {
        hoveredObject.set({
          opacity: 1,
        });
        canvas.requestRenderAll();
      }
    });

    canvas.defaultCursor = getCursor("eraser");
    canvas.hoverCursor = getCursor("eraser");
  }

  dragOn() {
    const canvas = this.canvas;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    const drawingSettings = this.drawingSettings;
    drawingSettings.currentMode = "DRAG";
    canvas.isDrawingMode = false;

    canvas.on("mouse:down", function (opt) {
      var evt = opt.e;
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    });
    canvas.on("mouse:move", function (opt) {
      if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });
    canvas.on("mouse:up", function (opt) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });

    canvas.defaultCursor = this.cursorDrag;
    canvas.hoverCursor = this.cursorDrag;
  }

  onSelectMode() {
    const canvas = this.canvas;
    const drawingSettings = this.drawingSettings;
    drawingSettings.currentMode = "";
    canvas.isDrawingMode = false;

    canvas.getObjects().map((item) => item.set({ selectable: true }));
    canvas.hoverCursor = "all-scroll";
  }

  clearCanvas() {
    const canvas = this.canvas;
    canvas.getObjects().forEach(function (item) {
      if (item !== canvas.backgroundImage) {
        canvas.remove(item);
      }
    });
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    this.saveCanvasState();
  }

  changeZoom({ point, scale }) {
    if (!point) {
      const width = this.canvas.width;
      const height = this.canvas.height;
      point = { x: width / 2, y: height / 2 };
    }

    const minZoom = this.canvasConfig.minZoom;
    const maxZoom = this.canvasConfig.maxZoom;

    scale = this.canvas.getZoom() * scale;
    scale = scale < minZoom ? minZoom : scale > maxZoom ? maxZoom : scale;
    this.canvas.zoomToPoint(point, scale);
    this.onZoom({ point, scale });
  }

  resetZoom() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const point = { x: width / 2, y: height / 2 };
    const scale = 1;
    this.canvas.zoomToPoint(point, scale);
    this.onZoom({ point, scale });
  }

  onZoom(params) {
    this.addZoomListeners();
    this.canvas.fire("zoom:change", params);
  }

  openPage(page) {
    const canvas = this.canvas;
    const center = canvas.getCenter();

    fabric.Image.fromURL(page, (img) => {
      if (img.width > img.height) {
        img.scaleToWidth(canvas.width);
      } else {
        img.scaleToHeight(canvas.height - 100);
      }
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        top: center.top,
        left: center.left,
        originX: "center",
        originY: "center",
      });

      canvas.renderAll();
    });
  }

  getCanvasContentBoundaries() {
    const canvas = this.canvas;
    const objects = canvas.getObjects();

    // Initialize variables for min and max coordinates
    let minX = 10000;
    let minY = 10000;
    let maxX = -10000;
    let maxY = -10000;

    // Iterate through objects to find minimum and maximum coordinates
    objects.forEach((object) => {
      const objectBoundingBox = object.getBoundingRect();

      minX = Math.min(minX, objectBoundingBox.left);
      minY = Math.min(minY, objectBoundingBox.top);
      maxX = Math.max(maxX, objectBoundingBox.left + objectBoundingBox.width);
      maxY = Math.max(maxY, objectBoundingBox.top + objectBoundingBox.height);
    });

    // Calculate canvas size based on content
    const width = maxX - minX;
    const height = maxY - minY;
    return { minX, minY, maxX, maxY, width, height };
  }

  removeBoard() {
    this.element.disconnect();
    if (this.canvas) {
      this.canvas.off();
      this.canvas.dispose();
    }
    this.canvas = null;
  }

  saveCanvasState() {
    this.currentState++;
    this.canvasState[this.currentState] = JSON.stringify(this.canvas);
    this.canvasState = this.canvasState.slice(0, this.currentState + 1);
  }

  undo() {
    if (this.currentState > 0) {
      this.currentState--;
      this.canvas.loadFromJSON(
        this.canvasState[this.currentState],
        this.canvas.renderAll.bind(this.canvas)
      );
      this.canvas.requestRenderAll();
    }
  }

  redo() {
    if (this.currentState < this.canvasState.length - 1) {
      this.currentState++;
      this.canvas.loadFromJSON(
        this.canvasState[this.currentState],
        this.canvas.renderAll.bind(this.canvas)
      );
      this.canvas.requestRenderAll();
    }
  }

  // function drawBackground(canvas) {
  //   const dotSize = 4; // Adjust the size of the dots as needed
  //   const dotSvg = `
  //       <svg xmlns="http://www.w3.org/2000/svg" width="${dotSize * 10}" height="${
  //     dotSize * 10
  //   }" viewBox="0 0 ${dotSize * 10} ${dotSize * 10}">
  //         <circle cx="${dotSize / 2}" cy="${dotSize / 2}" r="${dotSize / 2}" fill="#00000010" />
  //       </svg>
  //     `;

  //   let rect;

  //   return new Promise((resolve) => {
  //     const dotImage = new Image();
  //     dotImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dotSvg);
  //     dotImage.onload = function () {
  //       const dotPattern = new fabric.Pattern({
  //         source: dotImage,
  //         repeat: 'repeat', // Adjust the repeat property to change the pattern repetition
  //       });

  //       const width = canvas.getWidth();
  //       const height = canvas.getHeight();

  //       const rect = new fabric.Rect({
  //         itemId: 'background-id-rectangle',
  //         width: width,
  //         height: height,
  //         fill: dotPattern,
  //         selectable: false, // Prevent the dot from being selected
  //         evented: false, // Prevent the dot from receiving events
  //         lockMovementX: true, // Prevent horizontal movement of the dot
  //         lockMovementY: true, // Prevent vertical movement of the dot
  //       });

  //       canvas.add(rect);
  //       resolve(rect);
  //     };
  //   });
  // }
}
