"""
Fitness Physique Classifier - Inference Script
Takes pose landmarks as JSON input, extracts body metrics, and classifies physique.
"""

import sys
import json
import os
import math
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
CLASSES = ["skinny", "athletic", "overweight"]


def extract_features_from_landmarks(landmarks: list[dict]) -> dict:
    """
    Extract body measurement features from MediaPipe pose landmarks.
    
    MediaPipe landmark indices:
    0: nose, 11: left shoulder, 12: right shoulder
    13: left elbow, 14: right elbow, 15: left wrist, 16: right wrist
    23: left hip, 24: right hip, 25: left knee, 26: right knee
    27: left ankle, 28: right ankle
    """
    def lm(idx):
        if idx < len(landmarks):
            return landmarks[idx]
        return {"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.0}

    def dist(a, b):
        return math.sqrt((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2)

    def midpoint(a, b):
        return {"x": (a["x"] + b["x"]) / 2, "y": (a["y"] + b["y"]) / 2, "z": (a.get("z", 0) + b.get("z", 0)) / 2}

    # Key landmarks
    left_shoulder = lm(11)
    right_shoulder = lm(12)
    left_hip = lm(23)
    right_hip = lm(24)
    left_knee = lm(25)
    right_knee = lm(26)
    left_ankle = lm(27)
    right_ankle = lm(28)
    left_elbow = lm(13)
    right_elbow = lm(14)
    nose = lm(0)

    # Shoulder width
    shoulder_width = dist(left_shoulder, right_shoulder)
    # Hip width
    hip_width = dist(left_hip, right_hip)
    # Torso length (shoulders to hips)
    shoulder_mid = midpoint(left_shoulder, right_shoulder)
    hip_mid = midpoint(left_hip, right_hip)
    torso_length = dist(shoulder_mid, hip_mid)
    # Leg length (hips to ankles)
    knee_mid = midpoint(left_knee, right_knee)
    ankle_mid = midpoint(left_ankle, right_ankle)
    leg_length = dist(hip_mid, ankle_mid)
    # Arm length (shoulder to elbow)
    left_arm_upper = dist(left_shoulder, left_elbow)
    right_arm_upper = dist(right_shoulder, right_elbow)
    avg_arm = (left_arm_upper + right_arm_upper) / 2

    # Waist approximation (midpoint between shoulders and hips, slightly narrower)
    waist_y = (shoulder_mid["y"] + hip_mid["y"]) / 2
    # Estimate waist width from overall body proportions
    waist_width = hip_width * 0.85 + shoulder_width * 0.15

    # --- Feature computation ---
    eps = 1e-6

    # shoulder-to-hip ratio
    shoulder_hip_ratio = shoulder_width / (hip_width + eps)
    # torso-to-leg ratio
    torso_leg_ratio = torso_length / (leg_length + eps)
    # waist-to-shoulder ratio
    waist_shoulder_ratio = waist_width / (shoulder_width + eps)
    # arm-to-torso ratio
    arm_torso_ratio = avg_arm / (torso_length + eps)

    # BMI proxy: if height/weight provided we'd use those; otherwise estimate from
    # relative body proportions (wider body = higher bmi proxy)
    body_height = dist(nose, ankle_mid)
    body_width_avg = (shoulder_width + hip_width) / 2
    bmi_proxy = body_width_avg / (body_height + eps)
    # Normalize to 0-1 range roughly
    bmi_proxy = min(max(bmi_proxy * 5.0, 0.1), 1.0)

    # Symmetry score: how symmetric left vs right
    left_height = dist(left_shoulder, left_ankle)
    right_height = dist(right_shoulder, right_ankle)
    symmetry = 1.0 - min(abs(left_height - right_height) / (max(left_height, right_height) + eps), 0.5)

    # Posture score: vertical alignment of nose, shoulder mid, hip mid, ankle mid
    # Ideal: all x-coords roughly aligned
    x_coords = [nose["x"], shoulder_mid["x"], hip_mid["x"], ankle_mid["x"]]
    posture_deviation = np.std(x_coords)
    posture_score = max(0.0, 1.0 - posture_deviation * 8.0)

    # Muscle visibility proxy: ratio of shoulder width to overall body proportions
    muscle_visibility = min((shoulder_hip_ratio - 0.85) / 0.6, 1.0)
    muscle_visibility = max(muscle_visibility, 0.0)

    # Limb proportion score
    total_height = dist(nose, ankle_mid) + eps
    limb_proportion = leg_length / total_height

    # Body volume proxy
    body_volume = (shoulder_width + hip_width + waist_width) / (3 * total_height + eps)
    body_volume = min(body_volume * 4.0, 1.0)

    features = [
        shoulder_hip_ratio,
        torso_leg_ratio,
        waist_shoulder_ratio,
        arm_torso_ratio,
        bmi_proxy,
        symmetry,
        posture_score,
        muscle_visibility,
        limb_proportion,
        body_volume,
    ]

    metrics = {
        "shoulderHipRatio": round(shoulder_hip_ratio, 3),
        "torsoLegRatio": round(torso_leg_ratio, 3),
        "symmetryScore": round(symmetry, 3),
        "postureScore": round(posture_score, 3),
    }

    return {"features": features, "metrics": metrics}


def classify(input_data: dict) -> dict:
    import joblib

    landmarks = input_data.get("landmarks", [])
    height = input_data.get("height")
    weight = input_data.get("weight")

    if not landmarks:
        raise ValueError("landmarks are required")

    extracted = extract_features_from_landmarks(landmarks)
    features = extracted["features"]
    metrics = extracted["metrics"]

    # Override bmi_proxy if actual height/weight provided
    if height and weight and height > 0:
        bmi = weight / ((height / 100) ** 2)
        bmi_proxy = min(max((bmi - 15) / 25, 0.0), 1.0)
        features[4] = bmi_proxy
        metrics["bmi"] = round(bmi, 1)

    X = np.array(features).reshape(1, -1)

    # Load or train model
    if not os.path.exists(MODEL_PATH):
        # Train inline if model not found
        train_dir = os.path.dirname(__file__)
        sys.path.insert(0, train_dir)
        import train_model
        pipeline = train_model.train()
    else:
        pipeline = joblib.load(MODEL_PATH)

    proba = pipeline.predict_proba(X)[0]
    predicted_idx = int(np.argmax(proba))
    physique_type = CLASSES[predicted_idx]

    # Map probabilities
    proba_dict = {
        "skinny": round(float(proba[0]), 4),
        "athletic": round(float(proba[1]), 4),
        "overweight": round(float(proba[2]), 4),
    }

    # Generate quick recommendations
    recommendations = get_quick_recommendations(physique_type)

    result = {
        "physiqueType": physique_type,
        "confidence": round(float(proba[predicted_idx]), 4),
        "probabilities": proba_dict,
        "bodyMetrics": metrics,
        "recommendations": recommendations,
    }
    return result


def get_quick_recommendations(physique_type: str) -> list[str]:
    recs = {
        "skinny": [
            "Focus on compound lifts: squats, deadlifts, bench press",
            "Eat in a caloric surplus (300-500 kcal above maintenance)",
            "Prioritize protein: aim for 1.6-2.2g per kg of bodyweight",
            "Train 3-4 times per week with progressive overload",
            "Limit excessive cardio to preserve muscle-building calories",
        ],
        "athletic": [
            "Maintain current training intensity and volume",
            "Focus on sport-specific performance goals",
            "Incorporate periodization to avoid plateaus",
            "Optimize recovery: 7-9 hours sleep, active stretching",
            "Try advanced techniques: supersets, drop sets, pyramid training",
        ],
        "overweight": [
            "Start with low-impact cardio: walking, cycling, swimming",
            "Create a moderate caloric deficit (300-500 kcal below maintenance)",
            "Incorporate strength training to preserve muscle mass",
            "Track food intake with a nutrition app",
            "Set small, progressive goals to build sustainable habits",
        ],
    }
    return recs.get(physique_type, [])


if __name__ == "__main__":
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
        result = classify(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
