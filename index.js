const ANIMATE = "animate";
const SPACING = "spacing";
const CREATE_CURVE = "create-curve";

const state = {
  curves: [],
  index: -1,
  dragging: false,
  pointIndex: 0,
  spacing: 16,
  steps: 100,
  increment: 0.01,
  delay: 5,
};
document.addEventListener("click", (event) => {
  console.log(event);
  switch (event.target.id) {
    case ANIMATE:
      animate();
      break;
    case CREATE_CURVE:
      createCurve();
      break;
    case SPACING:
      spacing();
      break;
  }
});

document.addEventListener("mousedown", (event) => {
  const clientX = event.clientX - 11;
  const clientY = event.clientY - 31;
  focusPoint(clientX, clientY);
});

document.addEventListener("mousemove", (event) => {
  let clientX = event.clientX - 11;
  let clientY = event.clientY - 31;

  clientX -= clientX % state.spacing;
  clientY -= clientY % state.spacing;
  movePoint(clientX, clientY);
});

document.addEventListener("mouseup", (event) => {
  unfocusPoint(event.clientX, event.clientY);
});

function focusPoint(x, y) {
  const [index, pointIndex] = pointCollision(x, y);
  if (index === -1) return;
  state.dragging = true;
  state.index = index;
  state.pointIndex = pointIndex;
}

function movePoint(x, y) {
  if (!state.dragging) return;
  const curve = state.curves[state.index];
  curve[state.pointIndex] = x;
  curve[state.pointIndex + 1] = y;
  drawCurve(...curve);
}

function unfocusPoint() {
  if (!state.dragging) return;
  state.dragging = false;
}

function pointCollision(x, y) {
  if (state.curves.length === 0) return [-1, -1];
  for (let i = 0; i < state.curves.length; i++) {
    const curve = state.curves[i];
    if (Math.abs(curve[0] - x) < 5 && Math.abs(curve[1] - y) < 5) {
      return [i, 0];
    } else if (Math.abs(curve[2] - x) < 5 && Math.abs(curve[3] - y) < 5) {
      return [i, 2];
    } else if (Math.abs(curve[4] - x) < 5 && Math.abs(curve[5] - y) < 5) {
      return [i, 4];
    } else if (Math.abs(curve[6] - x) < 5 && Math.abs(curve[7] - y) < 5) {
      return [i, 6];
    }
    return [-1, -1];
  }
}

function drawLetter() {
  const canvas = document.getElementById("app");
  const context = canvas.getContext("2d");
  context.font = "48px serif";
  const metrics = context.measureText("H");
  console.log(metrics);

  const x = 600;
  const y = 200;
  context.rect(
    x + metrics.width,
    y - metrics.fontBoundingBoxAscent,
    metrics.width,
    metrics.fontBoundingBoxAscent,
  );
  context.stroke();
  context.strokeText("H", x, y);
}

function createCurve() {
  const curve = [50, 20, 230, 30, 150, 80, 250, 100];
  state.index++;
  state.current = state.index;
  state.curves[state.index] = curve;

  drawCurve(...curve);
}

function drawCurve(x0, y0, cx0, cy0, cx1, cy1, x1, y1) {
  const canvas = document.getElementById("app");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 1200, 600);

  context.beginPath();
  context.moveTo(x0, y0);
  context.bezierCurveTo(cx0, cy0, cx1, cy1, x1, y1);
  context.stroke();

  context.fillStyle = "blue";
  context.beginPath();
  context.arc(x0, y0, 5, 0, 2 * Math.PI);
  context.arc(x1, y1, 5, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = "red";
  context.beginPath();
  context.arc(cx0, cy0, 5, 0, 2 * Math.PI);
  context.arc(cx1, cy1, 5, 0, 2 * Math.PI);
  context.fill();
}

function spacing() {
  if (state.spacing < 100) {
    state.spacing = state.spacing * 2;
  } else {
    state.spacing = 16;
  }
  document.getElementById(SPACING).textContent = state.spacing;
}

function animate() {
  const canvas = document.getElementById("app");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 1200, 600);

  const curve = state.curves[state.index];
  const points = animateCurve(...curve);
  for (let i = 0; i < state.steps; i++) {
    const [_x, _y, x, y] = points.slice(2 * i, 2 * i + 4);
    setTimeout(() => {
      context.beginPath();
      context.moveTo(_x, _y);
      context.lineTo(x, y);
      context.stroke();
    }, i * state.delay);
  }
}

function animateCurve(x0, y0, cx0, cy0, cx1, cy1, x1, y1) {
  let _x = x0;
  let _y = y0;
  const animate = [_x, _y];
  for (let i = 0; i < state.steps; i++) {
    const t = i * state.increment;
    const compliment = 1 - t;
    const factor0 = compliment * compliment * compliment;
    const factor1 = 3 * compliment * compliment * t;
    const factor2 = 3 * compliment * t * t;
    const factor3 = t * t * t;

    const x = factor0 * x0 + factor1 * cx0 + factor2 * cx1 + factor3 * x1;
    const y = factor0 * y0 + factor1 * cy0 + factor2 * cy1 + factor3 * y1;
    animate.push(x, y);
    _x = x;
    _y = y;
  }
  return animate;
}
