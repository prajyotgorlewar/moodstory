import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # suppress TensorFlow warnings

import warnings
import numpy as np
import librosa
from tensorflow.keras.models import load_model
from huggingface_hub import hf_hub_download  # <- NEW

warnings.filterwarnings('ignore')


class AudioMoodDetector:
    def __init__(self, model_path=None):
        # Always load from Hugging Face (cached automatically)
        model_path = hf_hub_download(
            repo_id="prajyotgorlewar/moodstoryLibrosa",  # your HF repo
            filename="audio_model.keras"                 # file name in that repo
        )

        self.model = load_model(model_path)
        self.class_labels = [
            'female_angry', 'female_calm', 'female_disgust', 'female_fearful',
            'female_happy', 'female_neutral', 'female_sad', 'female_surprised',
            'male_angry', 'male_calm', 'male_disgust', 'male_fearful', 'male_happy',
            'male_neutral', 'male_sad', 'male_surprised'
        ]

    def preprocess_audio(self, file_path, sr=22050, duration=3, n_mfcc=40, n_frames=75):
        y, _ = librosa.load(file_path, sr=sr, duration=duration)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)

        if mfcc.shape[1] < n_frames:
            pad_width = n_frames - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0, 0), (0, pad_width)), mode='constant')
        elif mfcc.shape[1] > n_frames:
            mfcc = mfcc[:, :n_frames]

        mfcc = mfcc.T
        mfcc_mean = np.mean(mfcc, axis=1).reshape(n_frames, 1)
        return mfcc_mean[np.newaxis, ...]

    def predict_mood(self, file_path):
        audio_features = self.preprocess_audio(file_path)
        preds = self.model.predict(audio_features)
        idx = int(np.argmax(preds))
        confidence = float(np.max(preds))
        predicted_label = self.class_labels[idx]
        gender, mood = predicted_label.split('_')
        return gender, mood, confidence, preds
