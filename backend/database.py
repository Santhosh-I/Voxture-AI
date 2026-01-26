import sqlite3

def init_db():
    conn = sqlite3.connect("voxture.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS gestures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gesture TEXT
        )
    """)
    conn.commit()
    conn.close()
