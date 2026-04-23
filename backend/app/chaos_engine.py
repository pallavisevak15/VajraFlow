import networkx as nx
from sqlalchemy.orm import Session
from . import models

class ChaosEngine:
    def __init__(self, db: Session):
        self.db = db
        self.graph = self._build_graph()

    def _build_graph(self):
        """Builds a networkx graph from the current database state."""
        G = nx.DiGraph()
        nodes = self.db.query(models.Node).all()
        for node in nodes:
            # Weight could represent baseline processing time, we keep it simple here
            G.add_node(node.id, data=node)

        edges = self.db.query(models.Edge).all()
        for edge in edges:
            G.add_edge(edge.source_id, edge.target_id, weight=edge.base_lead_time, data=edge)
        
        return G

    def inject_fault(self, node_id: str, severity_level: int):
        """
        Calculates the Ripple Effect of a fault injected at node_id.
        severity_level (1-10) adds delay to downstream nodes.
        """
        if node_id not in self.graph:
            return {"error": "Node not found in graph"}

        delay_multiplier = 1 + (severity_level * 0.1)  # 10% delay per severity level
        base_delay_hours = severity_level * 12 # 12 hours delay per severity level
        
        affected_nodes = {}
        
        # Find all reachable downstream nodes
        # Using BFS or Shortest path lengths to calculate propagated delay
        try:
            shortest_paths = nx.single_source_dijkstra_path_length(self.graph, node_id, weight='weight')
            
            for target_id, distance in shortest_paths.items():
                if target_id == node_id:
                    continue
                # The delay attenuates slightly the further down the chain
                attenuated_delay = base_delay_hours * (0.9 ** distance)
                
                # Fetch node to update health (simulate state change)
                node = self.db.query(models.Node).filter(models.Node.id == target_id).first()
                if node:
                    affected_nodes[target_id] = {
                        "name": node.name,
                        "added_delay_hours": round(attenuated_delay, 2),
                        "cost_impact": round(attenuated_delay * 500, 2) # Example cost calculation: $500 per delayed hour
                    }
        except Exception as e:
            pass

        return affected_nodes

    def calculate_alternative_route(self, source_id: str, target_id: str, broken_node_id: str = None):
        """
        Self-Healing Logic: Searches the graph for the next shortest path
        avoiding the broken node, and calculates the Disruption Cost.
        TotalCost = NewRouteCost + DelayPenalty
        """
        G_temp = self.graph.copy()
        
        # Remove the broken node to simulate path finding without it
        if broken_node_id and broken_node_id in G_temp:
            G_temp.remove_node(broken_node_id)
            
        try:
            # Find new shortest path based on lead time (weight)
            path = nx.shortest_path(G_temp, source=source_id, target=target_id, weight='weight')
            new_lead_time = nx.shortest_path_length(G_temp, source=source_id, target=target_id, weight='weight')
            
            # Original lead time
            try:
                original_lead_time = nx.shortest_path_length(self.graph, source=source_id, target=target_id, weight='weight')
            except nx.NetworkXNoPath:
                original_lead_time = new_lead_time

            delay_penalty = max(0, new_lead_time - original_lead_time)
            # Cost model: base cost + delay penalty cost
            # Example: 1 unit of lead time = $1000
            new_route_base_cost = new_lead_time * 1000
            delay_penalty_cost = delay_penalty * 2000 # Penalized rate
            
            total_cost = new_route_base_cost + delay_penalty_cost
            
            return {
                "path": path,
                "new_lead_time": round(new_lead_time, 2),
                "delay_penalty": round(delay_penalty, 2),
                "total_cost": round(total_cost, 2)
            }
        except nx.NetworkXNoPath:
            return {"error": "No alternative route found"}
        except nx.NodeNotFound:
            return {"error": "Source or target node not found in graph"}
