# --- Imports ---
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
import kagglehub

# --- 1️⃣ Download dataset from Kaggle ---
# Replace with your dataset name used during training
dataset_path = kagglehub.dataset_download('tusharpaul2001/face-emotion-mood-image-dataset')
print("Dataset path:", dataset_path)

# Example folder structure after download:
# dataset_path/images/train
# dataset_path/images/validation
# dataset_path/images/test

# --- 2️⃣ Load your trained model ---
model = tf.keras.models.load_model("face_emotion_model.keras")

# --- 3️⃣ Prepare your test dataset ---
# The trained model expects 48x48 RGB inputs (see `model.py` preprocessing).
# Use the same size here so `model.predict` receives compatible tensors.
IMAGE_SIZE = (48, 48)
BATCH_SIZE = 32

test_ds = tf.keras.utils.image_dataset_from_directory(
    f"{dataset_path}/images/validation",   # or /test if you used one
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

# Normalize
# Save class names before mapping — mapping returns a MapDataset which doesn't expose class_names
class_names = test_ds.class_names

# Normalize images to [0,1]
test_ds = test_ds.map(lambda x, y: (tf.cast(x, tf.float32) / 255.0, y))

# --- 4️⃣ Make predictions ---
y_true = np.concatenate([y for x, y in test_ds], axis=0)
y_pred_probs = model.predict(test_ds)
y_pred = np.argmax(y_pred_probs, axis=1)

# --- 5️⃣ Evaluate ---
# `class_names` was captured earlier before mapping the dataset.
print("\n📈 Classification Report:")
print(classification_report(y_true, y_pred, target_names=class_names))

# --- 6️⃣ Confusion Matrix ---
cm = confusion_matrix(y_true, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)

plt.figure(figsize=(8, 8))
disp.plot(cmap='Blues', values_format='d', ax=plt.gca(), colorbar=False)
plt.title("Confusion Matrix – Facial Emotion Model")
plt.show()
