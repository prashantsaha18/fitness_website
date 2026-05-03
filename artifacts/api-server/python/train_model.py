"""
Fitness Physique Classifier - ML Model Training
Trains a Random Forest classifier on 10,000 synthetic body measurement samples.
Features are derived from pose landmark ratios and body metrics.
"""

import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import json

RANDOM_SEED = 42
N_SAMPLES = 10000
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")

np.random.seed(RANDOM_SEED)


def generate_synthetic_dataset(n_samples: int):
    """
    Generate realistic synthetic body measurement data for 3 physique classes:
    - 0: skinny (ectomorph)
    - 1: athletic (mesomorph)
    - 2: overweight (endomorph)

    Features:
      0: shoulder_hip_ratio       - shoulder width / hip width
      1: torso_leg_ratio          - torso length / leg length
      2: waist_shoulder_ratio     - waist / shoulder width
      3: arm_torso_ratio          - arm length / torso length
      4: bmi_proxy                - normalized body mass index proxy
      5: symmetry_score           - bilateral symmetry (0-1)
      6: posture_score            - posture alignment metric (0-1)
      7: muscle_visibility_score  - muscle definition proxy (0-1)
      8: limb_proportion_score    - limb-to-height proportion
      9: body_volume_proxy        - approximated body volume ratio
    """
    n_per_class = n_samples // 3
    extras = n_samples - n_per_class * 3

    X_list = []
    y_list = []

    # --- Skinny (ectomorph) ---
    n_skinny = n_per_class + (1 if extras > 0 else 0)
    skinny = np.column_stack([
        np.random.normal(1.02, 0.06, n_skinny),   # shoulder_hip_ratio: slight narrowness
        np.random.normal(0.62, 0.05, n_skinny),   # torso_leg_ratio: longer legs
        np.random.normal(0.70, 0.05, n_skinny),   # waist_shoulder_ratio: narrow waist
        np.random.normal(0.82, 0.06, n_skinny),   # arm_torso_ratio
        np.random.normal(0.35, 0.06, n_skinny),   # bmi_proxy: low
        np.random.normal(0.82, 0.05, n_skinny),   # symmetry_score: high
        np.random.normal(0.75, 0.07, n_skinny),   # posture_score
        np.random.normal(0.25, 0.07, n_skinny),   # muscle_visibility_score: low
        np.random.normal(0.60, 0.05, n_skinny),   # limb_proportion_score: longer limbs
        np.random.normal(0.30, 0.06, n_skinny),   # body_volume_proxy: low
    ])
    X_list.append(skinny)
    y_list.extend([0] * n_skinny)

    # --- Athletic (mesomorph) ---
    n_athletic = n_per_class + (1 if extras > 1 else 0)
    athletic = np.column_stack([
        np.random.normal(1.20, 0.06, n_athletic),  # shoulder_hip_ratio: broad shoulders
        np.random.normal(0.58, 0.04, n_athletic),  # torso_leg_ratio: balanced
        np.random.normal(0.72, 0.04, n_athletic),  # waist_shoulder_ratio: tapered waist
        np.random.normal(0.78, 0.05, n_athletic),  # arm_torso_ratio
        np.random.normal(0.55, 0.07, n_athletic),  # bmi_proxy: moderate (muscle)
        np.random.normal(0.90, 0.04, n_athletic),  # symmetry_score: very high
        np.random.normal(0.88, 0.05, n_athletic),  # posture_score: excellent
        np.random.normal(0.72, 0.08, n_athletic),  # muscle_visibility_score: high
        np.random.normal(0.52, 0.04, n_athletic),  # limb_proportion_score
        np.random.normal(0.55, 0.06, n_athletic),  # body_volume_proxy: moderate
    ])
    X_list.append(athletic)
    y_list.extend([1] * n_athletic)

    # --- Overweight (endomorph) ---
    n_overweight = n_per_class
    overweight = np.column_stack([
        np.random.normal(0.98, 0.07, n_overweight),  # shoulder_hip_ratio: narrower relative to hips
        np.random.normal(0.55, 0.05, n_overweight),  # torso_leg_ratio: shorter legs relative
        np.random.normal(0.88, 0.06, n_overweight),  # waist_shoulder_ratio: wide waist
        np.random.normal(0.70, 0.06, n_overweight),  # arm_torso_ratio
        np.random.normal(0.78, 0.08, n_overweight),  # bmi_proxy: high
        np.random.normal(0.75, 0.06, n_overweight),  # symmetry_score
        np.random.normal(0.62, 0.08, n_overweight),  # posture_score: lower (weight strain)
        np.random.normal(0.22, 0.07, n_overweight),  # muscle_visibility_score: low
        np.random.normal(0.47, 0.05, n_overweight),  # limb_proportion_score
        np.random.normal(0.75, 0.07, n_overweight),  # body_volume_proxy: high
    ])
    X_list.append(overweight)
    y_list.extend([2] * n_overweight)

    X = np.vstack(X_list)
    y = np.array(y_list)

    # Add small Gaussian noise to simulate real measurement variance
    X += np.random.normal(0, 0.01, X.shape)

    # Clip to physically plausible ranges
    X = np.clip(X, 0.1, 2.0)

    # Shuffle
    idx = np.random.permutation(len(y))
    return X[idx], y[idx]


def build_pipeline():
    return Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=RANDOM_SEED,
            n_jobs=-1,
        ))
    ])


def train():
    print(f"Generating {N_SAMPLES} synthetic training samples...")
    X, y = generate_synthetic_dataset(N_SAMPLES)

    class_names = ["skinny", "athletic", "overweight"]
    print(f"Class distribution: {dict(zip(class_names, np.bincount(y)))}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    print("Training Random Forest classifier...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=class_names))

    print(f"\nSaving model to {MODEL_PATH}...")
    joblib.dump(pipeline, MODEL_PATH)

    # Save feature names for reference
    feature_names = [
        "shoulder_hip_ratio", "torso_leg_ratio", "waist_shoulder_ratio",
        "arm_torso_ratio", "bmi_proxy", "symmetry_score", "posture_score",
        "muscle_visibility_score", "limb_proportion_score", "body_volume_proxy"
    ]
    meta = {
        "accuracy": float(acc),
        "features": feature_names,
        "classes": class_names,
        "n_samples": N_SAMPLES,
    }
    meta_path = os.path.join(os.path.dirname(__file__), "model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print("Training complete!")
    return pipeline


if __name__ == "__main__":
    train()
