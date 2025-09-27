
from typing import List
import requests
from langchain.embeddings.base import Embeddings
class NomicEmbeddings(Embeddings):
    def __init__(self, model_name:str, base_url:str="http://localhost:1234/v1", api_key:str="lm-studio"):
        self.model_name = model_name
        self.base_url = base_url
        self.api_key = api_key
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_query(text) for text in texts]
    
    def embed_query(self, text: str) -> List[float]:
        url = f"{self.base_url}/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "input": text
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['data'][0]['embedding']
    
