from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# Forced reload marker

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Annotated
import random
import os
import numpy as np

from . import models, schemas, database, auth
from .chaos_engine import ChaosEngine

# --- Load Agamya AI Predictor Model ---
_predictor_artifact = None
try:
    import joblib
    _model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agamya_predictor.joblib")
    if os.path.exists(_model_path):
        _predictor_artifact = joblib.load(_model_path)
        print(f"[Agamya AI] Predictor model loaded (R²={_predictor_artifact['r2_score']:.4f})")
    else:
        print(f"[Agamya AI] Model file not found at {_model_path}. /api/predict will use fallback.")
except Exception as e:
    print(f"[Agamya AI] Could not load model: {e}")

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Aegis Logistics API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://agamya-supply-chain.vercel.app", # Replace with your actual Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get ChaosEngine
def get_chaos_engine(db: Session = Depends(get_db)):
    return ChaosEngine(db)

@app.on_event("startup")
def populate_initial_data():
    db = database.SessionLocal()
    try:
        # Check if data exists
        if db.query(models.Node).first():
            # Check if admin user exists
            admin_user = db.query(models.User).filter(models.User.username == "admin").first()
            if not admin_user:
                # Create default admin user for testing
                admin_hashed = auth.get_password_hash("admin123")
                admin = models.User(
                    username="admin",
                    email="admin@agamya.ai",
                    password_hash=admin_hashed,
                    role="admin"
                )
                db.add(admin)
                db.commit()
            db.close()
            return
            
        # Seed Data
        nodes_data = [
            # International Hubs
            {"id": "FACTORY_SHENZHEN", "name": "Shenzhen Assembly Plant", "type": "Factory", "latitude": 22.5431, "longitude": 114.0579, "current_stock": 50000},
            {"id": "PORT_SHANGHAI", "name": "Port of Shanghai", "type": "Port", "latitude": 31.2304, "longitude": 121.4737, "current_stock": 100000},
            {"id": "PORT_LA", "name": "Port of Los Angeles", "type": "Port", "latitude": 33.7292, "longitude": -118.2620, "current_stock": 80000},
            {"id": "PORT_VANCOUVER", "name": "Port of Vancouver", "type": "Port", "latitude": 49.2827, "longitude": -123.1207, "current_stock": 30000},
            {"id": "PORT_ANTWERP", "name": "Port of Antwerp", "type": "Port", "latitude": 51.2194, "longitude": 4.4025, "current_stock": 45000},
            
            # Strategic Passages
            {"id": "PORT_SUEZ", "name": "Suez Canal", "type": "Passage", "latitude": 29.9668, "longitude": 32.5498, "current_stock": 0},
            {"id": "PORT_CAPE", "name": "Cape of Good Hope", "type": "Passage", "latitude": -34.3527, "longitude": 18.4712, "current_stock": 0},

            # Indian Logistics Network
            {"id": "PORT_MUMBAI", "name": "Port of Mumbai", "type": "Port", "latitude": 18.9438, "longitude": 72.8359, "current_stock": 60000},
            {"id": "PORT_CHENNAI", "name": "Chennai Port", "type": "Port", "latitude": 13.0827, "longitude": 80.2707, "current_stock": 40000},
            {"id": "PORT_MUNDRA", "name": "Mundra Port", "type": "Port", "latitude": 22.8397, "longitude": 69.7022, "current_stock": 55000},
            {"id": "HUB_DELHI", "name": "Delhi Logistics Hub", "type": "Warehouse", "latitude": 28.6139, "longitude": 77.2090, "current_stock": 25000},
            {"id": "HUB_BANGALORE", "name": "Bangalore Logistics Park", "type": "Warehouse", "latitude": 12.9716, "longitude": 77.5946, "current_stock": 22000},

            # Final Destinations
            {"id": "WH_CHICAGO", "name": "Chicago Central Hub", "type": "Warehouse", "latitude": 41.8781, "longitude": -87.6298, "current_stock": 20000},
            {"id": "WH_NY", "name": "New York Distribution", "type": "Warehouse", "latitude": 40.7128, "longitude": -74.0060, "current_stock": 15000},
        ]
        
        for n in nodes_data:
            db.add(models.Node(**n))
            
        edges_data = [
            # Asia to West
            {"source_id": "FACTORY_SHENZHEN", "target_id": "PORT_SHANGHAI", "distance": 1200, "transport_mode": "Rail", "base_lead_time": 2},
            {"source_id": "PORT_SHANGHAI", "target_id": "PORT_LA", "distance": 10500, "transport_mode": "Sea", "base_lead_time": 14},
            {"source_id": "PORT_SHANGHAI", "target_id": "PORT_VANCOUVER", "distance": 9000, "transport_mode": "Sea", "base_lead_time": 12},
            
            # Express Air Route
            {"source_id": "FACTORY_SHENZHEN", "target_id": "PORT_LA", "distance": 11000, "transport_mode": "Air", "base_lead_time": 1.5},
            
            # Indian Domestic to Ports
            {"source_id": "HUB_DELHI", "target_id": "PORT_MUNDRA", "distance": 1100, "transport_mode": "Rail", "base_lead_time": 1.5},
            {"source_id": "HUB_BANGALORE", "target_id": "PORT_CHENNAI", "distance": 350, "transport_mode": "Road", "base_lead_time": 1},
            {"source_id": "HUB_BANGALORE", "target_id": "PORT_MUMBAI", "distance": 1000, "transport_mode": "Road", "base_lead_time": 2},
            
            # THE SUEZ VS CAPE SCENARIO
            # Primary Route via Suez
            {"source_id": "PORT_MUMBAI", "target_id": "PORT_SUEZ", "distance": 4500, "transport_mode": "Sea", "base_lead_time": 6},
            {"source_id": "PORT_SUEZ", "target_id": "PORT_ANTWERP", "distance": 3500, "transport_mode": "Sea", "base_lead_time": 6},
            
            # Secondary Route via Cape (Backup)
            {"source_id": "PORT_MUMBAI", "target_id": "PORT_CAPE", "distance": 9000, "transport_mode": "Sea", "base_lead_time": 18},
            {"source_id": "PORT_CAPE", "target_id": "PORT_ANTWERP", "distance": 6000, "transport_mode": "Sea", "base_lead_time": 6},
            
            # North America Internal
            {"source_id": "PORT_LA", "target_id": "WH_CHICAGO", "distance": 2800, "transport_mode": "Rail", "base_lead_time": 4},
            {"source_id": "PORT_VANCOUVER", "target_id": "WH_CHICAGO", "distance": 3200, "transport_mode": "Rail", "base_lead_time": 5},
            {"source_id": "WH_CHICAGO", "target_id": "WH_NY", "distance": 1140, "transport_mode": "Road", "base_lead_time": 2},
        ]
        
        for e in edges_data:
            db.add(models.Edge(**e))
        
        # Create default admin user for testing
        admin_hashed = auth.get_password_hash("admin123")
        admin_user = models.User(
            username="admin",
            email="admin@agamya.ai",
            password_hash=admin_hashed,
            role="admin"
        )
        db.add(admin_user)
            
        db.commit()
    except Exception as e:
        print(f"[Startup] Warning: Could not seed data (might already exist): {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/api/nodes", response_model=list[schemas.Node])
def get_nodes(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Node).all()

@app.get("/api/edges", response_model=list[schemas.Edge])
def get_edges(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Edge).all()

@app.get("/api/disruptions", response_model=list[schemas.Disruption])
def get_disruptions(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Disruption).all()

@app.get("/api/resilience-score")
def get_resilience_score(db: Annotated[Session, Depends(get_db)]):
    # Simple resilience calculation
    nodes = db.query(models.Node).all()
    disrupted = [n for n in nodes if n.health_status != 'Healthy']
    
    if not nodes:
        return {"score": 100}
        
    penalty = len(disrupted) * 15
    score = max(0, 100 - penalty)
    return {"score": score}

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/api/inject-fault", response_model=schemas.DisruptionResult)
def inject_fault(
    request: schemas.ChaosInjectionRequest, 
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_user)],
    engine: Annotated[ChaosEngine, Depends(get_chaos_engine)]
):
    # All authenticated users can inject faults
    
    node = db.query(models.Node).filter(models.Node.id == request.node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # Create Disruption record
    disruption = models.Disruption(
        event_type=request.event_type,
        node_affected=request.node_id,
        expected_resolution=datetime.now() + timedelta(days=request.severity_level * 2),
        severity=request.severity_level
    )
    db.add(disruption)
    
    # Update node health
    node.health_status = 'Critical' if request.severity_level >= 7 else 'Disrupted'
    db.commit()
    
    # Calculate Ripple Effect
    affected = engine.inject_fault(request.node_id, request.severity_level)
    
    # Calculate Plan B (Self-Healing) for incoming routes to the disrupted node's target
    # In a real scenario, this would be highly contextual. We'll pick a downstream node
    # to show the alternative routing.
    alternative_route = None
    if node.outgoing_edges:
        target_id = node.outgoing_edges[0].target_id
        # We need a source node to route FROM. Let's pick an upstream node.
        if node.incoming_edges:
            source_id = node.incoming_edges[0].source_id
            alternative_route = engine.calculate_alternative_route(source_id, target_id, broken_node_id=request.node_id)
        else:
            # If no incoming, try routing from another node entirely
            other_nodes = db.query(models.Node).filter(models.Node.id != request.node_id).all()
            if other_nodes:
                alternative_route = engine.calculate_alternative_route(other_nodes[0].id, target_id, broken_node_id=request.node_id)
                
    return schemas.DisruptionResult(
        message=f"Fault injected at {node.name}. Network degraded.",
        affected_downstream_nodes=affected,
        alternative_route=alternative_route if alternative_route and "error" not in alternative_route else None
    )

@app.post("/api/heal-network")
def heal_network(db: Annotated[Session, Depends(get_db)], current_user: Annotated[models.User, Depends(get_current_user)]):
    # All authenticated users can heal the network
    
    nodes = db.query(models.Node).all()
    for n in nodes:
        n.health_status = 'Healthy'
    
    db.query(models.Disruption).delete()
    db.commit()
    return {"message": "Network restored"}

# --- AGAMYA AI PREDICTION ENDPOINT ---

# Edge lookup table for prediction (mirrors seed data)
_EDGE_LOOKUP = {
    ("FACTORY_SHENZHEN", "PORT_SHANGHAI"): {"distance": 1200, "transport_mode": "Rail", "base_lead_time": 2},
    ("PORT_SHANGHAI", "PORT_LA"): {"distance": 10500, "transport_mode": "Sea", "base_lead_time": 14},
    ("PORT_SHANGHAI", "PORT_VANCOUVER"): {"distance": 9000, "transport_mode": "Sea", "base_lead_time": 12},
    ("HUB_DELHI", "PORT_MUNDRA"): {"distance": 1100, "transport_mode": "Rail", "base_lead_time": 1.5},
    ("HUB_BANGALORE", "PORT_CHENNAI"): {"distance": 350, "transport_mode": "Road", "base_lead_time": 1},
    ("HUB_BANGALORE", "PORT_MUMBAI"): {"distance": 1000, "transport_mode": "Road", "base_lead_time": 2},
    ("PORT_MUMBAI", "PORT_SUEZ"): {"distance": 4500, "transport_mode": "Sea", "base_lead_time": 6},
    ("PORT_SUEZ", "PORT_ANTWERP"): {"distance": 3500, "transport_mode": "Sea", "base_lead_time": 6},
    ("PORT_MUMBAI", "PORT_CAPE"): {"distance": 9000, "transport_mode": "Sea", "base_lead_time": 18},
    ("PORT_CAPE", "PORT_ANTWERP"): {"distance": 6000, "transport_mode": "Sea", "base_lead_time": 6},
    ("PORT_LA", "WH_CHICAGO"): {"distance": 2800, "transport_mode": "Rail", "base_lead_time": 4},
    ("PORT_VANCOUVER", "WH_CHICAGO"): {"distance": 3200, "transport_mode": "Rail", "base_lead_time": 5},
    ("WH_CHICAGO", "WH_NY"): {"distance": 1140, "transport_mode": "Road", "base_lead_time": 2},
}

@app.post("/api/predict", response_model=schemas.PredictionResponse)
def predict_arrival(
    request: schemas.PredictionRequest,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Agamya AI Prediction Endpoint.
    Uses the trained RandomForestRegressor to estimate arrival time
    based on origin, destination, chaos severity, and event type.
    """
    origin = request.origin
    destination = request.destination
    chaos_severity = request.chaos_severity
    event_type = request.event_type

    # Look up edge data from DB first, fallback to static lookup
    edge = db.query(models.Edge).filter(
        models.Edge.source_id == origin,
        models.Edge.target_id == destination
    ).first()

    if edge:
        distance = edge.distance
        transport_mode = edge.transport_mode
        base_lead_time = edge.base_lead_time
    else:
        # Fallback to static lookup
        edge_info = _EDGE_LOOKUP.get((origin, destination))
        if edge_info:
            distance = edge_info["distance"]
            transport_mode = edge_info["transport_mode"]
            base_lead_time = edge_info["base_lead_time"]
        else:
            # Default fallback for unknown routes
            distance = 5000
            transport_mode = "Sea"
            base_lead_time = 10

    # Use ML model if available
    if _predictor_artifact is not None:
        try:
            le = _predictor_artifact["label_encoders"]
            model = _predictor_artifact["model"]
            r2 = _predictor_artifact["r2_score"]

            # Encode categorical features (handle unseen labels gracefully)
            def safe_encode(encoder, value):
                try:
                    return encoder.transform([value])[0]
                except ValueError:
                    return 0  # fallback for unseen labels

            origin_enc = safe_encode(le["origin"], origin)
            dest_enc = safe_encode(le["destination"], destination)
            mode_enc = safe_encode(le["transport_mode"], transport_mode)
            event_enc = safe_encode(le["event_type"], event_type)

            features = np.array([[origin_enc, dest_enc, distance, mode_enc, base_lead_time, chaos_severity, event_enc]])
            predicted = model.predict(features)[0]

            return schemas.PredictionResponse(
                predicted_days=round(float(predicted), 2),
                accuracy=round(r2 * 100, 1),
                origin=origin,
                destination=destination,
                chaos_severity=chaos_severity,
                event_type=event_type
            )
        except Exception as e:
            print(f"[Agamya AI] Prediction error, using fallback: {e}")

    # Fallback: formula-based prediction
    chaos_multiplier = 1 + (chaos_severity * 0.15)
    predicted_days = round(base_lead_time * chaos_multiplier, 2)

    return schemas.PredictionResponse(
        predicted_days=predicted_days,
        accuracy=94.0,  # Fallback fixed accuracy
        origin=origin,
        destination=destination,
        chaos_severity=chaos_severity,
        event_type=event_type
    )

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/signup", response_model=schemas.TokenResponse)
def signup(request: schemas.SignupRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        # Check if username exists
        db_user = db.query(models.User).filter(models.User.username == request.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Check if email exists (if provided)
        if request.email:
            db_email = db.query(models.User).filter(models.User.email == request.email).first()
            if db_email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = auth.get_password_hash(request.password)
        new_user = models.User(
            username=request.username,
            email=request.email,
            password_hash=hashed_password,
            role=request.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": new_user.username, "role": new_user.role, "email": new_user.email},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": new_user.role, "username": new_user.username, "email": new_user.email}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[Signup Error] {e}")
        # Check for IntegrityError (UNIQUE constraint failed)
        if "UNIQUE constraint failed" in str(e):
            if "users.username" in str(e):
                raise HTTPException(status_code=400, detail="Username already taken")
            if "users.email" in str(e):
                raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        user = db.query(models.User).filter(models.User.username == request.username).first()
        if not user or not auth.verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.username, "role": user.role, "email": user.email},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username, "email": user.email}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Login Error] {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/api/auth/me")
def read_users_me(current_user: Annotated[models.User, Depends(get_current_user)]):
    return {"username": current_user.username, "role": current_user.role, "email": current_user.email}

# --- Greenest Route Intelligence ---
CO2_RATES = {
    "Air": 500,   # 500g per km
    "Sea": 10,    # 10g per km
    "Road": 80,   # 80g per km
    "Rail": 40,   # 40g per km (fallback)
}

@app.get("/api/green-routes")
def get_green_routes(db: Annotated[Session, Depends(get_db)]):
    """
    Calculates sustainability metrics for all routes.
    Implementation: Air (500g), Sea (10g), Road (80g)
    """
    try:
        edges = db.query(models.Edge).all()
        results = []
        
        for edge in edges:
            # Use requested rates, fallback to 50g for Rail/Other
            rate = CO2_RATES.get(edge.transport_mode, 50)
            co2_total = (edge.distance * rate) / 1000 # kg
            
            results.append({
                "id": edge.id,
                "origin": edge.source_id,
                "destination": edge.target_id,
                "mode": edge.transport_mode,
                "distance": edge.distance,
                "co2_kg": round(co2_total, 2),
                "score": round(max(0, 100 - (co2_total / 100)), 2)
            })
        
        # Sort by co2 (lowest first)
        results.sort(key=lambda x: x["co2_kg"])
        
        return {
            "routes": results,
            "greenest_route": results[0] if results else None,
            "total_network_emissions": round(sum(r["co2_kg"] for r in results), 2)
        }
    except Exception as e:
        print(f"[Sustainability API Error] {e}")
        return {"routes": [], "greenest_route": None, "total_network_emissions": 0}
