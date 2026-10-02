const NOISE_FREQ = 10;

const controlPoints = [
  { x: 2 * 10, y: 2 * 390 },
  { x: 2 * 40, y: 2 * 150 },
  { x: 2 * 200, y: 2 * 200 },
  { x: 2 * 390, y: 2 * 10 },
];

function setup() {
  createCanvas(800, 800);
  // noiseSeed(0);
  noLoop();
}

function draw() {
  background(255);

  // path length velocity only
  const { centerPoints: centerPointsA, shapePoints: shapePointsA } = inkPath(
    controlPoints,
    (x) => sin(PI * x),
    false,
    30,
    256,
  );

  noStroke();
  fill(0);
  beginShape();
  shapePointsA.forEach((p) => vertex(p.x, p.y));
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

function inkPath(
  controlPoints,
  velocityFunc,
  useCurveVel,
  baseThickness,
  resolution,
) {
  let centerPoints = new Array(resolution);
  for (let i = 0; i < resolution; i++) {
    const t = i / (resolution - 1);
    const p = getBezierPoint(controlPoints, t);
    centerPoints[i] = p;
  }

  let curvatureVelocities = new Array(resolution);
  for (let i = 0; i < resolution; i++) {
    const currPoint = createVector(centerPoints[i].x, centerPoints[i].y);

    let nextPoint;
    if (i === resolution - 1) {
      nextPoint = createVector(centerPoints[i - 1].x, centerPoints[i - 1].y);
    } else {
      nextPoint = createVector(centerPoints[i + 1].x, centerPoints[i + 1].y);
    }

    const dir = p5.Vector.sub(nextPoint, currPoint);
    curvatureVelocities[i] = dir.mag() * (resolution - 1);
  }

  let maxCurvatureVelocity = max(...curvatureVelocities);
  let normCurvatureVelocities = curvatureVelocities.map(
    (v) => v / maxCurvatureVelocity,
  );

  let topPoints = new Array(resolution);
  let bottomPoints = new Array(resolution);

  for (let i = 0; i < resolution; i++) {
    const currPoint = createVector(centerPoints[i].x, centerPoints[i].y);

    let nextPoint;
    if (i === resolution - 1) {
      nextPoint = createVector(centerPoints[i - 1].x, centerPoints[i - 1].y);
    } else {
      nextPoint = createVector(centerPoints[i + 1].x, centerPoints[i + 1].y);
    }

    const dir = p5.Vector.sub(nextPoint, currPoint);
    const normalDir = createVector(-dir.y, dir.x).normalize();

    let noiseValue = noise((NOISE_FREQ * i) / (resolution - 1));
    // map noise value to 0 -> 1 range
    let mappedNoise = constrain(map(noiseValue, 0.2, 0.7, 0.2, 1), 0, 1);

    let lengthVelocity = velocityFunc(i / (resolution - 1));
    let totalVelocity = mappedNoise * lengthVelocity;

    let curvatureVelocity = normCurvatureVelocities[i];

    if (useCurveVel) {
      totalVelocity *= curvatureVelocity;
    }

    const thickness = baseThickness * totalVelocity + 10;

    topPoints[i] = {
      x: currPoint.x + (normalDir.x * thickness) / 2,
      y: currPoint.y + (normalDir.y * thickness) / 2,
    };

    bottomPoints[resolution - 1 - i] = {
      x: currPoint.x - (normalDir.x * thickness) / 2,
      y: currPoint.y - (normalDir.y * thickness) / 2,
    };
  }

  return {
    centerPoints,
    shapePoints: [...topPoints, ...bottomPoints],
  };
}
