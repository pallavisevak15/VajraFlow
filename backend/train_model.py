"""
Agamya AI - Model Training Script
Trains a RandomForestRegressor on synthetic shipping data to predict arrival times.
"""

import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib


def train_model():
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    df = pd.read_csv(data_path)
    print(f"[Agamya] Loaded {len(df)} training samples")
    print(f"[Agamya] Columns: {list(df.columns)}")
    print(f"[Agamya] Sample:\n{df.head()}\n")

    # Encode categorical features
    label_encoders = {}
    categorical_cols = ["origin", "destination", "transport_mode", "event_type"]
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col])
        label_encoders[col] = le

    # Feature matrix
    feature_cols = [
        "origin_enc", "destination_enc", "distance",
        "transport_mode_enc", "base_lead_time", "chaos_severity",
        "event_type_enc"
    ]
    
    X = df[feature_cols].values
    y = df["actual_travel_time"].values

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train RandomForestRegressor
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    
    print(f"\n[Agamya] ===== Model Performance =====")
    print(f"[Agamya] R² Score:            {r2:.4f}")
    print(f"[Agamya] Mean Absolute Error:  {mae:.4f} days")
    print(f"[Agamya] Accuracy Estimate:    {r2 * 100:.1f}%")

    # Save model and encoders
    model_path = os.path.join(os.path.dirname(__file__), "agamya_predictor.joblib")
    artifact = {
        "model": model,
        "label_encoders": label_encoders,
        "feature_cols": feature_cols,
        "categorical_cols": categorical_cols,
        "r2_score": r2,
        "mae": mae,
    }
    joblib.dump(artifact, model_path)
    print(f"\n[Agamya] Model saved -> {model_path}")
    print(f"[Agamya] Training complete!")
    
    return r2, mae


if __name__ == "__main__":
    train_model()
