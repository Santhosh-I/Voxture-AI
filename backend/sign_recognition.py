import cv2
import mediapipe as mp
import threading
import time
import queue
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

# ✅ TRACKING MODE (KEY CHANGE)
hands = mp_hands.Hands(
    static_image_mode=False,        # ❗ tracking ON
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# 🔊 Text-to-Speech Setup using Windows SAPI directly
last_spoken_sign = None
last_spoken_time = 0
SPEECH_COOLDOWN = 2.0  # Seconds before repeating the same word
speech_queue = queue.Queue()
tts_thread = None
tts_running = True

def tts_worker():
    """Background worker that speaks from queue using Windows SAPI"""
    import pythoncom
    pythoncom.CoInitialize()
    
    try:
        import win32com.client
        speaker = win32com.client.Dispatch("SAPI.SpVoice")
        speaker.Rate = 1  # Speed (-10 to 10)
        speaker.Volume = 100  # Volume (0 to 100)
        print("✅ TTS Engine (SAPI) initialized successfully")
        
        while tts_running:
            try:
                text = speech_queue.get(timeout=0.5)
                if text:
                    print(f"🔊 Speaking: {text}")
                    speaker.Speak(text)
                speech_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"⚠️ TTS speak error: {e}")
    except Exception as e:
        print(f"⚠️ TTS init error: {e}")
    finally:
        pythoncom.CoUninitialize()

def start_tts_thread():
    """Start the TTS background thread"""
    global tts_thread
    tts_thread = threading.Thread(target=tts_worker, daemon=True)
    tts_thread.start()
    print("✅ TTS Thread started")

def speak_async(text):
    """Queue text for speaking"""
    global last_spoken_sign, last_spoken_time
    
    current_time = time.time()
    
    # Skip if same sign was spoken recently (debouncing)
    if text == last_spoken_sign and (current_time - last_spoken_time) < SPEECH_COOLDOWN:
        return
    
    # Skip certain phrases
    if text in ["No Hand Detected", "Unknown"]:
        return
    
    last_spoken_sign = text
    last_spoken_time = current_time
    
    # Add to queue for speaking
    try:
        speech_queue.put_nowait(text)
    except queue.Full:
        pass

# Start TTS thread on module load
start_tts_thread()

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

    # 🔊 Speak the detected gesture
    if detected_sign != "No Hand Detected":
        speak_async(detected_sign)

    return detected_sign, image
