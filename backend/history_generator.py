"""
Agamya AI - Synthetic Historical Shipping Data Generator
Generates training data based on the existing supply chain node/edge topology.
"""

import csv
import random
import os

# Define the network topology (mirrors main.py seed data)
EDGES = [
    {"source": "FACTORY_SHENZHEN", "target": "PORT_SHANGHAI", "distance": 1200, "transport_mode": "Rail", "base_lead_time": 2},
    {"source": "PORT_SHANGHAI", "target": "PORT_LA", "distance": 10500, "transport_mode": "Sea", "base_lead_time": 14},
    {"source": "PORT_SHANGHAI", "target": "PORT_VANCOUVER", "distance": 9000, "transport_mode": "Sea", "base_lead_time": 12},
    {"source": "HUB_DELHI", "target": "PORT_MUNDRA", "distance": 1100, "transport_mode": "Rail", "base_lead_time": 1.5},
    {"source": "HUB_BANGALORE", "target": "PORT_CHENNAI", "distance": 350, "transport_mode": "Road", "base_lead_time": 1},
    {"source": "HUB_BANGALORE", "target": "PORT_MUMBAI", "distance": 1000, "transport_mode": "Road", "base_lead_time": 2},
    {"source": "PORT_MUMBAI", "target": "PORT_SUEZ", "distance": 4500, "transport_mode": "Sea", "base_lead_time": 6},
    {"source": "PORT_SUEZ", "target": "PORT_ANTWERP", "distance": 3500, "transport_mode": "Sea", "base_lead_time": 6},
    {"source": "PORT_MUMBAI", "target": "PORT_CAPE", "distance": 9000, "transport_mode": "Sea", "base_lead_time": 18},
    {"source": "PORT_CAPE", "target": "PORT_ANTWERP", "distance": 6000, "transport_mode": "Sea", "base_lead_time": 6},
    {"source": "PORT_LA", "target": "WH_CHICAGO", "distance": 2800, "transport_mode": "Rail", "base_lead_time": 4},
    {"source": "PORT_VANCOUVER", "target": "WH_CHICAGO", "distance": 3200, "transport_mode": "Rail", "base_lead_time": 5},
    {"source": "WH_CHICAGO", "target": "WH_NY", "distance": 1140, "transport_mode": "Road", "base_lead_time": 2},
]

EVENT_TYPES = ["Port Strike", "Severe Weather", "Equipment Failure", "Congestion", "Piracy Threat", "Normal"]

def generate_data(num_samples=2500):
    """Generate synthetic shipping records with chaos-affected travel times."""
    data = []
    
    for _ in range(num_samples):
        edge = random.choice(EDGES)
        event_type = random.choice(EVENT_TYPES)
        
        # Chaos severity: 0 for normal operations, 1-10 for disruptions
        if event_type == "Normal":
            chaos_severity = 0
        else:
            chaos_severity = random.randint(1, 10)
        
        # Calculate actual travel time with chaos effects + noise
        # Mirrors chaos_engine.py logic: delay_multiplier = 1 + (severity * 0.1)
        chaos_multiplier = 1 + (chaos_severity * 0.15)
        
        # Add stochastic variance (weather, congestion randomness)
        noise_factor = random.uniform(0.85, 1.20)
        
        # Transport-mode-specific variance
        mode_variance = {
            "Sea": random.uniform(0.95, 1.25),   # Sea has most variance
            "Rail": random.uniform(0.92, 1.10),   # Rail is more predictable
            "Road": random.uniform(0.90, 1.15),   # Road moderate variance
        }
        
        transport_var = mode_variance.get(edge["transport_mode"], 1.0)
        
        actual_travel_time = round(
            edge["base_lead_time"] * chaos_multiplier * noise_factor * transport_var, 2
        )
        
        data.append({
            "origin": edge["source"],
            "destination": edge["target"],
            "distance": edge["distance"],
            "transport_mode": edge["transport_mode"],
            "base_lead_time": edge["base_lead_time"],
            "chaos_severity": chaos_severity,
            "event_type": event_type,
            "actual_travel_time": actual_travel_time,
        })
    
    return data


def save_to_csv(data, filepath):
    """Save generated data to CSV."""
    fieldnames = ["origin", "destination", "distance", "transport_mode", 
                  "base_lead_time", "chaos_severity", "event_type", "actual_travel_time"]
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"[Agamya] Generated {len(data)} records -> {filepath}")


if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    data = generate_data(2500)
    save_to_csv(data, output_path)
    print("[Agamya] Synthetic data generation complete.")
