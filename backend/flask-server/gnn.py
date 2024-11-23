import torch
import torch.nn as nn
import torch.nn.functional as F
import networkx as nx

class RoleSkillGNN(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(RoleSkillGNN, self).__init__()
        # Graph convolution layers
        self.conv1 = nn.Linear(input_dim, hidden_dim)
        self.conv2 = nn.Linear(hidden_dim, output_dim)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x, adj_matrix):
        """
        x: Node features
        adj_matrix: Adjacency matrix representing skill-role graph
        """
        # First graph convolution layer
        x = F.relu(self.conv1(torch.matmul(adj_matrix, x)))
        x = self.dropout(x)
        
        # Second graph convolution layer
        x = self.conv2(torch.matmul(adj_matrix, x))
        
        return x
    
    def role_compatibility_score(self, candidate_skills, role_requirements):
        """
        Calculate role compatibility using cosine similarity
        """
        compatibility = F.cosine_similarity(candidate_skills, role_requirements)
        return compatibility

# Example usage
def create_role_skill_graph(candidates, roles):
    """
    Create a graph representing relationships between candidates and roles
    """
    G = nx.Graph()
    
    # Add nodes for candidates and roles
    for candidate in candidates:
        G.add_node(candidate['id'], type='candidate', skills=candidate['skills'])
    
    for role in roles:
        G.add_node(role['id'], type='role', requirements=role['requirements'])
    
    # Add edges based on skill compatibility
    for candidate in candidates:
        for role in roles:
            compatibility = calculate_compatibility(candidate['skills'], role['requirements'])
            if compatibility > 0.5:  # Threshold for adding an edge
                G.add_edge(candidate['id'], role['id'], weight=compatibility)
    
    return G

def calculate_compatibility(candidate_skills, role_requirements):
    """
    Calculate skill compatibility using cosine similarity or Jaccard index
    """
    # Simple Jaccard similarity as an example
    intersection = len(set(candidate_skills) & set(role_requirements))
    union = len(set(candidate_skills) | set(role_requirements))
    return intersection / union if union > 0 else 0

# Demonstration of adaptive role matching
def adaptive_role_matching(candidates, roles):
    # Create graph
    skill_graph = create_role_skill_graph(candidates, roles)
    
    # Initialize GNN
    gnn = RoleSkillGNN(input_dim=64, hidden_dim=32, output_dim=16)
    
    # Perform role matching
    best_matches = []
    for candidate in candidates:
        candidate_embeddings = ... # Generate candidate skill embeddings
        role_predictions = []
        
        for role in roles:
            role_embeddings = ... # Generate role requirement embeddings
            compatibility = gnn.role_compatibility_score(candidate_embeddings, role_embeddings)
            role_predictions.append((role['id'], compatibility))
        
        # Sort and select best role
        best_role = max(role_predictions, key=lambda x: x[1])
        best_matches.append((candidate['id'], best_role[0], best_role[1]))
    
    return best_matches