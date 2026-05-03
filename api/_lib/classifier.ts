/**
 * TypeScript implementation of the Fitness Physique Classifier.
 * Reimplements the Python RandomForest model's decision logic as a
 * weighted scoring system derived from the training data distributions.
 *
 * Features (10):
 *  0: shoulder_hip_ratio        (athletic ~1.20, skinny ~1.02, overweight ~0.98)
 *  1: torso_leg_ratio           (skinny ~0.62, athletic ~0.58, overweight ~0.55)
 *  2: waist_shoulder_ratio      (overweight ~0.88, athletic ~0.72, skinny ~0.70)
 *  3: arm_torso_ratio
 *  4: bmi_proxy                 (overweight ~0.78, athletic ~0.55, skinny ~0.35)
 *  5: symmetry_score            (athletic ~0.90, skinny ~0.82, overweight ~0.75)
 *  6: posture_score             (athletic ~0.88, skinny ~0.75, overweight ~0.62)
 *  7: muscle_visibility_score   (athletic ~0.72, skinny ~0.25, overweight ~0.22)
 *  8: limb_proportion_score
 *  9: body_volume_proxy         (overweight ~0.75, athletic ~0.55, skinny ~0.30)
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface BodyMetrics {
  shoulderHipRatio: number;
  torsoLegRatio: number;
  symmetryScore: number;
  postureScore: number;
  bmi?: number;
}

export interface ClassifyResult {
  physiqueType: "athletic" | "skinny" | "overweight";
  confidence: number;
  probabilities: { athletic: number; skinny: number; overweight: number };
  bodyMetrics: BodyMetrics;
  recommendations: string[];
}

function dist(a: PoseLandmark, b: PoseLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function mid(a: PoseLandmark, b: PoseLandmark): PoseLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

function lm(landmarks: PoseLandmark[], idx: number): PoseLandmark {
  return landmarks[idx] ?? { x: 0.5, y: 0.5, z: 0, visibility: 0 };
}

export function extractFeatures(
  landmarks: PoseLandmark[],
  height?: number,
  weight?: number
): { features: number[]; metrics: BodyMetrics } {
  const eps = 1e-6;

  const leftShoulder = lm(landmarks, 11);
  const rightShoulder = lm(landmarks, 12);
  const leftHip = lm(landmarks, 23);
  const rightHip = lm(landmarks, 24);
  const leftKnee = lm(landmarks, 25);
  const rightKnee = lm(landmarks, 26);
  const leftAnkle = lm(landmarks, 27);
  const rightAnkle = lm(landmarks, 28);
  const leftElbow = lm(landmarks, 13);
  const rightElbow = lm(landmarks, 14);
  const nose = lm(landmarks, 0);

  const shoulderWidth = dist(leftShoulder, rightShoulder);
  const hipWidth = dist(leftHip, rightHip);
  const shoulderMid = mid(leftShoulder, rightShoulder);
  const hipMid = mid(leftHip, rightHip);
  const ankleMid = mid(leftAnkle, rightAnkle);

  const torsoLength = dist(shoulderMid, hipMid);
  const legLength = dist(hipMid, ankleMid);
  const avgArm = (dist(leftShoulder, leftElbow) + dist(rightShoulder, rightElbow)) / 2;
  const waistWidth = hipWidth * 0.85 + shoulderWidth * 0.15;
  const bodyHeight = dist(nose, ankleMid) + eps;

  const shoulderHipRatio = shoulderWidth / (hipWidth + eps);
  const torsoLegRatio = torsoLength / (legLength + eps);
  const waistShoulderRatio = waistWidth / (shoulderWidth + eps);
  const armTorsoRatio = avgArm / (torsoLength + eps);

  let bmiProxy = ((shoulderWidth + hipWidth) / 2) / bodyHeight * 5.0;
  bmiProxy = Math.min(Math.max(bmiProxy, 0.1), 1.0);

  const leftH = dist(leftShoulder, lm(landmarks, 27));
  const rightH = dist(rightShoulder, lm(landmarks, 28));
  const symmetry = 1.0 - Math.min(Math.abs(leftH - rightH) / (Math.max(leftH, rightH) + eps), 0.5);

  const xCoords = [nose.x, shoulderMid.x, hipMid.x, ankleMid.x];
  const mean = xCoords.reduce((a, b) => a + b, 0) / xCoords.length;
  const variance = xCoords.reduce((s, x) => s + (x - mean) ** 2, 0) / xCoords.length;
  const posture = Math.max(0, 1.0 - Math.sqrt(variance) * 8.0);

  const muscleVisibility = Math.min(Math.max((shoulderHipRatio - 0.85) / 0.6, 0), 1.0);
  const limbProportion = legLength / bodyHeight;
  const bodyVolume = Math.min(((shoulderWidth + hipWidth + waistWidth) / (3 * bodyHeight)) * 4.0, 1.0);

  const metrics: BodyMetrics = {
    shoulderHipRatio: Math.round(shoulderHipRatio * 1000) / 1000,
    torsoLegRatio: Math.round(torsoLegRatio * 1000) / 1000,
    symmetryScore: Math.round(symmetry * 1000) / 1000,
    postureScore: Math.round(posture * 1000) / 1000,
  };

  // Override BMI with actual values if provided
  let finalBmiProxy = bmiProxy;
  if (height && weight && height > 0) {
    const bmi = weight / (height / 100) ** 2;
    finalBmiProxy = Math.min(Math.max((bmi - 15) / 25, 0), 1.0);
    metrics.bmi = Math.round(bmi * 10) / 10;
  }

  const features = [
    shoulderHipRatio,
    torsoLegRatio,
    waistShoulderRatio,
    armTorsoRatio,
    finalBmiProxy,
    symmetry,
    posture,
    muscleVisibility,
    limbProportion,
    bodyVolume,
  ];

  return { features, metrics };
}

/**
 * Gaussian probability density — how likely a value is given a normal distribution.
 */
function gaussianPDF(x: number, mean: number, std: number): number {
  const exponent = -((x - mean) ** 2) / (2 * std ** 2);
  return Math.exp(exponent) / (std * Math.sqrt(2 * Math.PI));
}

/**
 * Naive Bayes-style scorer using the training data's per-class mean/std.
 * Derived directly from the synthetic training distribution in train_model.py.
 */
const CLASS_PARAMS = {
  skinny: [
    { mean: 1.02, std: 0.06 }, // shoulder_hip_ratio
    { mean: 0.62, std: 0.05 }, // torso_leg_ratio
    { mean: 0.70, std: 0.05 }, // waist_shoulder_ratio
    { mean: 0.82, std: 0.06 }, // arm_torso_ratio
    { mean: 0.35, std: 0.06 }, // bmi_proxy
    { mean: 0.82, std: 0.05 }, // symmetry_score
    { mean: 0.75, std: 0.07 }, // posture_score
    { mean: 0.25, std: 0.07 }, // muscle_visibility_score
    { mean: 0.60, std: 0.05 }, // limb_proportion_score
    { mean: 0.30, std: 0.06 }, // body_volume_proxy
  ],
  athletic: [
    { mean: 1.20, std: 0.06 },
    { mean: 0.58, std: 0.04 },
    { mean: 0.72, std: 0.04 },
    { mean: 0.78, std: 0.05 },
    { mean: 0.55, std: 0.07 },
    { mean: 0.90, std: 0.04 },
    { mean: 0.88, std: 0.05 },
    { mean: 0.72, std: 0.08 },
    { mean: 0.52, std: 0.04 },
    { mean: 0.55, std: 0.06 },
  ],
  overweight: [
    { mean: 0.98, std: 0.07 },
    { mean: 0.55, std: 0.05 },
    { mean: 0.88, std: 0.06 },
    { mean: 0.70, std: 0.06 },
    { mean: 0.78, std: 0.08 },
    { mean: 0.75, std: 0.06 },
    { mean: 0.62, std: 0.08 },
    { mean: 0.22, std: 0.07 },
    { mean: 0.47, std: 0.05 },
    { mean: 0.75, std: 0.07 },
  ],
} as const;

type PhysiqueClass = keyof typeof CLASS_PARAMS;

function naiveBayesScore(features: number[], cls: PhysiqueClass): number {
  const params = CLASS_PARAMS[cls];
  // Log-probability to avoid underflow
  let logProb = 0;
  for (let i = 0; i < features.length; i++) {
    const p = gaussianPDF(features[i], params[i].mean, params[i].std);
    logProb += Math.log(p + 1e-12);
  }
  return logProb;
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

const RECOMMENDATIONS: Record<PhysiqueClass, string[]> = {
  skinny: [
    "Focus on compound lifts: squats, deadlifts, bench press",
    "Eat in a caloric surplus (300-500 kcal above maintenance)",
    "Prioritize protein: aim for 1.6-2.2g per kg of bodyweight",
    "Train 3-4 times per week with progressive overload",
    "Limit excessive cardio to preserve muscle-building calories",
  ],
  athletic: [
    "Maintain current training intensity and volume",
    "Focus on sport-specific performance goals",
    "Incorporate periodization to avoid plateaus",
    "Optimize recovery: 7-9 hours sleep, active stretching",
    "Try advanced techniques: supersets, drop sets, pyramid training",
  ],
  overweight: [
    "Start with low-impact cardio: walking, cycling, swimming",
    "Create a moderate caloric deficit (300-500 kcal below maintenance)",
    "Incorporate strength training to preserve muscle mass",
    "Track food intake with a nutrition app",
    "Set small, progressive goals to build sustainable habits",
  ],
};

export function classify(
  landmarks: PoseLandmark[],
  height?: number,
  weight?: number
): ClassifyResult {
  const { features, metrics } = extractFeatures(landmarks, height, weight);

  const classes: PhysiqueClass[] = ["skinny", "athletic", "overweight"];
  const rawScores = classes.map((cls) => naiveBayesScore(features, cls));
  const probs = softmax(rawScores);

  const bestIdx = probs.indexOf(Math.max(...probs));
  const physiqueType = classes[bestIdx];

  return {
    physiqueType,
    confidence: Math.round(probs[bestIdx] * 10000) / 10000,
    probabilities: {
      skinny: Math.round(probs[0] * 10000) / 10000,
      athletic: Math.round(probs[1] * 10000) / 10000,
      overweight: Math.round(probs[2] * 10000) / 10000,
    },
    bodyMetrics: metrics,
    recommendations: RECOMMENDATIONS[physiqueType],
  };
}
