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
    try:
        data = request.json
        image_data = data["image"].split(",")[1]
        image_bytes = base64.b64decode(image_data)

        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        gesture = recognize_sign(image)

        conn = sqlite3.connect("voxture.db")
        c = conn.cursor()
        c.execute("INSERT INTO gestures (gesture) VALUES (?)", (gesture,))
        conn.commit()
        conn.close()

        return jsonify({"gesture": gesture})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
