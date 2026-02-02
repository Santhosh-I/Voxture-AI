import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D,
    MaxPooling2D,
    Flatten,
    Dense,
    Input
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =========================
# CONFIG
# =========================
IMG_SIZE = 64
BATCH_SIZE = 32
EPOCHS = 5

# Path to Kaggle dataset root
# Inside this folder should be A, B, C, ..., Z
train_dir = "dataset"

# Explicitly restrict classes to A–Z (VERY IMPORTANT)
CLASSES = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

# =========================
# DATA GENERATOR
# =========================
datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
    validation_split=0.2
)

train_data = datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    color_mode="grayscale",
    class_mode="categorical",
    subset="training",
    classes=CLASSES
)

val_data = datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    color_mode="grayscale",
    class_mode="categorical",
    subset="validation",
    classes=CLASSES
)

print("✅ Classes detected:", train_data.class_indices)

# =========================
# MODEL
# =========================
model = Sequential([
    Input(shape=(IMG_SIZE, IMG_SIZE, 1)),

    Conv2D(32, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Conv2D(64, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Flatten(),
    Dense(128, activation="relu"),
    Dense(26, activation="softmax")  # A–Z only
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =========================
# TRAIN
# =========================
model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS
)

# =========================
# SAVE MODEL
# =========================
model.save("model/asl_model.h5")
print("✅ Model saved successfully: model/asl_model.h5")
