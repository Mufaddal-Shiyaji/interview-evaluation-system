import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

class ContinuousLearningRecruitmentModel:
    def __init__(self):
        """
        Initialize continuous learning recruitment model
        """
        self.historical_data = pd.DataFrame()
        self.model = RandomForestClassifier(n_estimators=100)
        self.feedback_learning_rate = 0.1
    
    def preprocess_candidate_data(self, candidate_data):
        """
        Preprocess candidate data for model training
        
        :param candidate_data: DataFrame with candidate features
        :return: Preprocessed feature matrix and target variable
        """
        # Feature engineering
        features = candidate_data.copy()
        
        # One-hot encode categorical variables
        features = pd.get_dummies(features, columns=['education_level', 'domain'])
        
        # Normalize numerical features
        numerical_cols = features.select_dtypes(include=['int64', 'float64']).columns
        features[numerical_cols] = (features[numerical_cols] - features[numerical_cols].mean()) / features[numerical_cols].std()
        
        return features
    
    def train_initial_model(self, initial_data):
        """
        Train initial model on historical recruitment data
        
        :param initial_data: Initial training dataset
        """
        processed_data = self.preprocess_candidate_data(initial_data)
        
        X = processed_data.drop('role_success', axis=1)
        y = processed_data['role_success']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        self.model.fit(X_train, y_train)
        
        # Store initial model performance
        self.initial_performance = {
            'accuracy': self.model.score(X_test, y_test),
            'feature_importances': dict(zip(X.columns, self.model.feature_importances_))
        }
    
    def update_model_with_feedback(self, new_performance_data):
        """
        Update model based on real-world performance feedback
        
        :param new_performance_data: DataFrame with new candidate performance data
        """
        # Combine historical and new data
        self.historical_data = pd.concat([self.historical_data, new_performance_data])
        
        # Reprocess data
        processed_data = self.preprocess_candidate_data(self.historical_data)
        
        X = processed_data.drop('role_success', axis=1)
        y = processed_data['role_success']
        
        # Retrain model with weighted recent data
        sample_weights = self._calculate_sample_weights(processed_data)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        self.model.fit(X_train, y_train, sample_weight=sample_weights)
        
        # Update model performance tracking
        new_performance = {
            'accuracy': self.model.score(X_test, y_test),
            'feature_importances': dict(zip(X.columns, self.model.feature_importances_))
        }
        
        # Compute performance improvement
        performance_delta = new_performance['accuracy'] - self.initial_performance['accuracy']
        
        return {
            'performance_improvement': performance_delta,
            'updated_model': self.model
        }
    
    def _calculate_sample_weights(self, data):
        """
        Calculate sample weights to prioritize recent data
        
        :param data: Input DataFrame
        :return: Array of sample weights
        """
        # Recent data gets higher weight
        data['data_age'] = range(len(data))  # Assumes most recent data is at the end
        max_age = data['data_age'].max()
        
        # Exponential decay of weights
        weights = np.exp(self.feedback_learning_rate * (data['data_age'] - max_age))
        
        return weights
    
    def predict_role_success(self, candidate_features):
        """
        Predict candidate's likelihood of success in a role
        
        :param candidate_features: Features of a new candidate
        :return: Probability of role success
        """
        processed_features = self.preprocess_candidate_data(
            pd.DataFrame([candidate_features])
        )
        
        return self.model.predict_proba(processed_features)[0][1]

# Example usage
initial_data = pd.DataFrame({
    'education_level': ['bachelors', 'masters', 'phd'],
    'domain': ['tech', 'finance', 'marketing'],
    'years_experience': [2, 5, 8],
    'programming_skills': [3, 7, 9],
    'role_success': [0, 1, 1]
})

recruitment_model = ContinuousLearningRecruitmentModel()
recruitment_model.train_initial_model(initial_data)

# Simulate feedback with new performance data
new_performance_data = pd.DataFrame({
    'education_level': ['bachelors', 'masters'],
    'domain': ['tech', 'marketing'],
    'years_experience': [3, 6],
    'programming_skills': [5, 8],
    'role_success': [1, 1]
})

recruitment_model.update_model_with_feedback(new_performance_data)