import os
import warnings
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download 


class CNNMoodDetector:
    def __init__(self, model_path=None):
        # Download model from Hugging Face (cached automatically)
        model_path = hf_hub_download(
            repo_id="prajyotgorlewar/moodstoryCNN",  # <-- your HF repo
            filename="face_emotion_model.keras"      # <-- exact filename in HF
        )

        # Download Haar cascade from Hugging Face
        cascade_path = hf_hub_download(
            repo_id="prajyotgorlewar/moodstoryCNN",
            filename="haarcascade_frontalface_default.xml"
        )

        self.model = load_model(model_path)
        self.cascade_path = cascade_path

        self.class_labels = [
            'angry', 'disgust', 'fear', 'happy',
            'neutral', 'sad', 'surprise'
        ]

    def preprocess_image(self, img_path, img_size=(48, 48)):
        img_color = cv2.imread(img_path)
        gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)

        face_cascade = cv2.CascadeClassifier(self.cascade_path)

        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1,
            minNeighbors=5, minSize=(30, 30)
        )

        if len(faces) > 0:
            # largest face
            x, y, w, h = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            face_img = gray[y:y+h, x:x+w]
        else:
            face_img = gray

        face_img = cv2.resize(face_img, img_size)
        face_img = face_img / 255.0
        face_img = np.stack((face_img,) * 3, axis=-1)
        face_img = np.expand_dims(face_img, axis=0)

        return face_img

    def predict_emotion(self, img_path):
        img = self.preprocess_image(img_path)
        preds = self.model.predict(img)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        emotion = self.class_labels[idx]
        return emotion, confidence
