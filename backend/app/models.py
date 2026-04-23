from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'Port' or 'Factory' or 'Warehouse'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    current_stock = Column(Integer, default=0)
    health_status = Column(String, default='Healthy') # 'Healthy', 'Disrupted', 'Critical'

    outgoing_edges = relationship("Edge", foreign_keys="[Edge.source_id]", back_populates="source")
    incoming_edges = relationship("Edge", foreign_keys="[Edge.target_id]", back_populates="target")
    disruptions = relationship("Disruption", back_populates="node")


class Edge(Base):
    __tablename__ = "edges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(String, ForeignKey("nodes.id"))
    target_id = Column(String, ForeignKey("nodes.id"))
    distance = Column(Float, nullable=False)
    transport_mode = Column(String, nullable=False)
    base_lead_time = Column(Float, nullable=False)

    source = relationship("Node", foreign_keys=[source_id], back_populates="outgoing_edges")
    target = relationship("Node", foreign_keys=[target_id], back_populates="incoming_edges")


class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String, nullable=False) # e.g. "Port Strike", "Flood"
    node_affected = Column(String, ForeignKey("nodes.id"))
    start_time = Column(DateTime, default=func.now())
    expected_resolution = Column(DateTime, nullable=False)
    severity = Column(Integer, nullable=False) # 1-10

    node = relationship("Node", back_populates="disruptions")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'admin' or 'user'
