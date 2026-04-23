-- Nodes: ID, Name, Type (Port/Factory), Lat/Long, Current_Stock, Health_Status
CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    current_stock INTEGER DEFAULT 0,
    health_status TEXT DEFAULT 'Healthy'
);

-- Edges: Source_ID, Target_ID, Distance, Transport_Mode, Base_Lead_Time
CREATE TABLE IF NOT EXISTS edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    distance REAL NOT NULL,
    transport_mode TEXT NOT NULL,
    base_lead_time REAL NOT NULL,
    FOREIGN KEY (source_id) REFERENCES nodes(id),
    FOREIGN KEY (target_id) REFERENCES nodes(id)
);

-- Disruptions: Event_Type, Node_Affected, Start_Time, Expected_Resolution
CREATE TABLE IF NOT EXISTS disruptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    node_affected TEXT NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_resolution DATETIME NOT NULL,
    severity INTEGER NOT NULL,
    FOREIGN KEY (node_affected) REFERENCES nodes(id)
);
