(() => {
  const canvas = document.getElementById("draw-canvas");
  const clearButton = document.getElementById("clear-canvas");
  const sizeInput = document.getElementById("brush-size");
  const colorInput = document.getElementById("brush-color");

  if (!canvas || !clearButton || !sizeInput || !colorInput) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const state = {
    drawing: false,
    lastX: 0,
    lastY: 0,
    brushSize: Number(sizeInput.value) || 4,
    brushColor: colorInput.value || "#111111"
  };

  const setBrushStyle = () => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = state.brushSize;
    ctx.strokeStyle = state.brushColor;
  };

  const paintCanvasBackground = () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.max(1, Math.round(rect.width * dpr));
    const targetHeight = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width === targetWidth && canvas.height === targetHeight) {
      return;
    }

    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    const snapshotCtx = snapshot.getContext("2d");
    if (snapshotCtx && canvas.width > 0 && canvas.height > 0) {
      snapshotCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    paintCanvasBackground();

    if (snapshot.width > 0 && snapshot.height > 0) {
      ctx.drawImage(
        snapshot,
        0,
        0,
        snapshot.width,
        snapshot.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setBrushStyle();
  };

  const getCanvasPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const drawLine = (x1, y1, x2, y2) => {
    setBrushStyle();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const startDrawing = (event) => {
    state.drawing = true;
    const point = getCanvasPoint(event);
    state.lastX = point.x;
    state.lastY = point.y;
    drawLine(point.x, point.y, point.x, point.y);
    canvas.setPointerCapture(event.pointerId);
  };

  const continueDrawing = (event) => {
    if (!state.drawing) {
      return;
    }

    const point = getCanvasPoint(event);
    drawLine(state.lastX, state.lastY, point.x, point.y);
    state.lastX = point.x;
    state.lastY = point.y;
  };

  const stopDrawing = (event) => {
    if (!state.drawing) {
      return;
    }
    state.drawing = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const clearCanvas = () => {
    paintCanvasBackground();
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setBrushStyle();
  };

  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", continueDrawing);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);

  clearButton.addEventListener("click", clearCanvas);
  sizeInput.addEventListener("input", () => {
    state.brushSize = Number(sizeInput.value) || 4;
  });
  colorInput.addEventListener("input", () => {
    state.brushColor = colorInput.value || "#111111";
  });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
})();
