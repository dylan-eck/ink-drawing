const NOISE_FREQ = 10;

const controlPoints = [
  { x: 2 * 10, y: 2 * 390 },
  { x: 2 * 40, y: 2 * 150 },
  { x: 2 * 200, y: 2 * 200 },
  { x: 2 * 390, y: 2 * 10 },
];

function setup() {
  createCanvas(800, 800);
  noiseSeed(0);
  noLoop();
}

function draw() {
  background(255);

  const numPoints = 256;
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const p = getBezierPoint(controlPoints, t);
    points.push(p);
  }

  let topPoints = new Array(numPoints);
  let bottomPoints = new Array(numPoints);

  for (let i = 0; i < numPoints - 1; i++) {
    const currPoint = createVector(points[i].x, points[i].y);
    const nextPoint = createVector(points[i + 1].x, points[i + 1].y);

    const dir = p5.Vector.sub(nextPoint, currPoint);
    const normalDir = createVector(-dir.y, dir.x).normalize();

    const thickness = 20 * noise((NOISE_FREQ * i) / (numPoints - 1));

    topPoints[i] = {
      x: currPoint.x + (normalDir.x * thickness) / 2,
      y: currPoint.y + (normalDir.y * thickness) / 2,
    };

    bottomPoints[numPoints - 1 - i] = {
      x: currPoint.x - (normalDir.x * thickness) / 2,
      y: currPoint.y - (normalDir.y * thickness) / 2,
    };
  }

  noStroke();
  fill(0);
  beginShape();
  topPoints.forEach((p) => vertex(p.x, p.y));
  bottomPoints.forEach((p) => vertex(p.x, p.y));
  endShape(CLOSE);
}

function getBezierPoint(controlPoints, sampleVal) {
  const firstOrderPoints = [];
  for (let i = 1; i < controlPoints.length; i++) {
    const x = lerp(controlPoints[i - 1].x, controlPoints[i].x, sampleVal);
    const y = lerp(controlPoints[i - 1].y, controlPoints[i].y, sampleVal);

    firstOrderPoints.push({ x, y });
  }

  const secondOrderPoints = [];
  for (let i = 1; i < firstOrderPoints.length; i++) {
    const x = lerp(firstOrderPoints[i - 1].x, firstOrderPoints[i].x, sampleVal);
    const y = lerp(firstOrderPoints[i - 1].y, firstOrderPoints[i].y, sampleVal);

    secondOrderPoints.push({ x, y });
  }

  const curvePoint = {
    x: lerp(secondOrderPoints[0].x, secondOrderPoints[1].x, sampleVal),
    y: lerp(secondOrderPoints[0].y, secondOrderPoints[1].y, sampleVal),
  };

  return curvePoint;
}
