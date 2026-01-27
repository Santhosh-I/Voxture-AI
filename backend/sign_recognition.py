import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

# ✅ TRACKING MODE (KEY CHANGE)
hands = mp_hands.Hands(
    static_image_mode=False,        # ❗ tracking ON
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

def recognize_sign(image):
    image = cv2.flip(image, 1)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    result = hands.process(image_rgb)

    detected_sign = "No Hand Detected"

    if result.multi_hand_landmarks:
        hand_landmarks = result.multi_hand_landmarks[0]

        # 🎯 Draw points & joint lines (LIKE YOUR IMAGE)
        mp_draw.draw_landmarks(
            image,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_draw.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=4),
            mp_draw.DrawingSpec(color=(255, 255, 255), thickness=2)
        )

        lm = hand_landmarks.landmark

        # Finger tips
        thumb, index, middle, ring, pinky = lm[4], lm[8], lm[12], lm[16], lm[20]

        # Finger up logic
        index_up = index.y < lm[6].y
        middle_up = middle.y < lm[10].y
        ring_up = ring.y < lm[14].y
        pinky_up = pinky.y < lm[18].y
        thumb_up = thumb.y < lm[2].y

        # ✋ HELLO
        if index_up and middle_up and ring_up and pinky_up:
            detected_sign = "HELLO"

        # ✊ FIST
        elif not index_up and not middle_up and not ring_up and not pinky_up:
            detected_sign = "FIST"

        # 👍 YES
        elif thumb_up and not index_up and not middle_up:
            detected_sign = "YES"

        # ☝️ NO
        elif index_up and not middle_up and not ring_up:
            detected_sign = "NO"

        # 👌 OK
        elif abs(thumb.x - index.x) < 0.04:
            detected_sign = "OK"

    return detected_sign, image
