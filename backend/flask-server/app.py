from flask import Flask, request, jsonify
import base64
from deepface import DeepFace
import numpy as np
import io
from PIL import Image

app = Flask(__name__)

# Pre-load the DeepFace model once at startup
model_name = "VGG-Face"  # Specify model name here to avoid re-loading

def get_embedding(image, model_name):
    try:
        # Ensure image is in RGB format
        image = image.convert("RGB")

        # Convert image to numpy array
        image_np = np.array(image)

        # Generate embedding for the image using the specified model
        embedding = DeepFace.represent(img_path=image_np, model_name=model_name, enforce_detection=False)
        return embedding[0]["embedding"]
    except Exception as e:
        print("Error generating embedding:", e)
        return None

@app.route('/verifyFaceMatch', methods=['POST'])
def verify_faces():
    data = request.get_json()

    stored_image_base64 = data.get('storedImage')
    current_image_base64 = data.get('currentImage')

    if not stored_image_base64 or not current_image_base64:
        return jsonify({'match': False, 'message': 'Missing image data'}), 400

    try:
        # Remove prefix if present
        if stored_image_base64.startswith("data:image"):
            stored_image_base64 = stored_image_base64.split(",")[1]
        if current_image_base64.startswith("data:image"):
            current_image_base64 = current_image_base64.split(",")[1]

        # Decode the base64 images
        stored_image_data = base64.b64decode(stored_image_base64)
        current_image_data = base64.b64decode(current_image_base64)

        # Convert byte data to images
        stored_image = Image.open(io.BytesIO(stored_image_data))
        current_image = Image.open(io.BytesIO(current_image_data))

        # Get embeddings for both images
        stored_embedding = get_embedding(stored_image, model_name)
        current_embedding = get_embedding(current_image, model_name)

        if stored_embedding is None or current_embedding is None:
            return jsonify({'match': False, 'message': 'Could not generate embeddings'}), 500

        # Calculate cosine similarity
        similarity = np.dot(stored_embedding, current_embedding) / (
            np.linalg.norm(stored_embedding) * np.linalg.norm(current_embedding)
        )

        # Set a similarity threshold; usually, a threshold above 0.7 indicates a match
        threshold = 0.6
        is_match = similarity > threshold

        # Convert numpy boolean to Python bool
        return jsonify({'match': bool(is_match)})

    except Exception as e:
        print("Error in verification:", e)
        return jsonify({'match': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4000)
