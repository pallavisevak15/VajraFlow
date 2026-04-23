from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DisruptionBase(BaseModel):
    event_type: str
    node_affected: str
    expected_resolution: datetime
    severity: int

class DisruptionCreate(DisruptionBase):
    pass

class Disruption(DisruptionBase):
    id: int
    start_time: datetime

    class Config:
        from_attributes = True

class EdgeBase(BaseModel):
    source_id: str
    target_id: str
    distance: float
    transport_mode: str
    base_lead_time: float

class Edge(EdgeBase):
    id: int

    class Config:
        from_attributes = True

class NodeBase(BaseModel):
    id: str
    name: str
    type: str
    latitude: float
    longitude: float
    current_stock: int = 0
    health_status: str = 'Healthy'

class Node(NodeBase):
    outgoing_edges: List[Edge] = []
    incoming_edges: List[Edge] = []
    disruptions: List[Disruption] = []

    class Config:
        from_attributes = True

class ChaosInjectionRequest(BaseModel):
    node_id: str
    severity_level: int
    event_type: str

class DisruptionResult(BaseModel):
    message: str
    affected_downstream_nodes: dict
    alternative_route: Optional[dict] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None  # Optional for login, required for signup

class SignupRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    email: Optional[str] = None

class PredictionRequest(BaseModel):
    origin: str
    destination: str
    chaos_severity: int
    event_type: str

class PredictionResponse(BaseModel):
    predicted_days: float
    accuracy: float
    origin: str
    destination: str
    chaos_severity: int
    event_type: str

