import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

def recognize_sign(image):
    # Flip image for correct orientation
    image = cv2.flip(image, 1)

    # Convert to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    result = hands.process(image_rgb)

    if not result.multi_hand_landmarks:
        return "No Hand Detected"

    landmarks = result.multi_hand_landmarks[0].landmark

    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]

    # VERY BASIC RULE-BASED LOGIC (v0)
    if thumb_tip.y < index_tip.y and thumb_tip.y < middle_tip.y:
        return "HELLO 👋"

    return "HAND DETECTED"
