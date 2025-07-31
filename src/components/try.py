import requests
import os

API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
# Use environment variable instead of hardcoded API key
headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY', 'your_api_key_here')}"}

data = {"inputs": "The quick brown fox jumps over the lazy dog. This is a simple test to see if summarization is working properly."}

response = requests.post(API_URL, headers=headers, json=data)

if response.status_code == 200:
    print("API is working! Here's the response:")
    print(response.json())
else:
    print(f"API is not working. Status Code: {response.status_code}")
    print("Error Message:", response.json())
