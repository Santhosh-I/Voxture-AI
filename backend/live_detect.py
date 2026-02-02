import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf

# Try to load with safe_mode to avoid compatibility issues
try:
    model = tf.keras.models.load_model("model/asl_model.h5", compile=False, safe_mode=False)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("🔄 Attempting alternative loading method...")
    # Alternative: load weights only if model architecture is problematic
    try:
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Input
        
        # Recreate the model architecture
        model = Sequential([
            Input(shape=(64, 64, 1)),
            Conv2D(32, (3, 3), activation="relu"),
            MaxPooling2D(2, 2),
            Conv2D(64, (3, 3), activation="relu"),
            MaxPooling2D(2, 2),
            Flatten(),
            Dense(128, activation="relu"),
            Dense(26, activation="softmax")
        ])
        
        # Load only the weights
        model.load_weights("model/asl_model.h5")
        print("✅ Model weights loaded successfully")
    except Exception as e2:
        print(f"❌ Alternative method also failed: {e2}")
        exit(1)
labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        for hand in result.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)

            h, w, _ = frame.shape
            xs = [int(lm.x * w) for lm in hand.landmark]
            ys = [int(lm.y * h) for lm in hand.landmark]

            x1, x2 = min(xs)-20, max(xs)+20
            y1, y2 = min(ys)-20, max(ys)+20

            hand_img = frame[y1:y2, x1:x2]
            if hand_img.size == 0:
                continue

            gray = cv2.cvtColor(hand_img, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray, (64,64))
            gray = gray / 255.0
            gray = gray.reshape(1,64,64,1)

            pred = model.predict(gray, verbose=0)
            letter = labels[np.argmax(pred)]

            cv2.putText(frame, letter, (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0,255,0), 3)

    cv2.imshow("ASL Detector", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
