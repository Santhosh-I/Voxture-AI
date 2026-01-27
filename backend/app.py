from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
import sqlite3

from sign_recognition import recognize_sign
from database import init_db

app = Flask(__name__)
CORS(app)

init_db()

@app.route("/sign", methods=["POST"])
def sign_to_text():
    data = request.json
    image_data = data["image"].split(",")[1]
    image_bytes = base64.b64decode(image_data)

    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    gesture, processed_image = recognize_sign(image)

    _, buffer = cv2.imencode(".jpg", processed_image)
    img_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "gesture": gesture,
        "image": f"data:image/jpeg;base64,{img_base64}"
    })




if __name__ == "__main__":
    app.run(debug=True)
