import os
import psycopg2
from flask import Flask, request
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Get database credentials from environment variables
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "brainbeats_db"),
        user=os.getenv("DB_USER", "web_user"),
        password=os.getenv("DB_PASSWORD", "securepassword"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = generate_password_hash(data['password'])

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password))
        conn.commit()
        return {"message": "User registered successfully!"}, 201
    except psycopg2.IntegrityError:
        conn.rollback()
        return {"error": "Username already exists"}, 400
    finally:
        cur.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT password_hash FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user and check_password_hash(user[0], password):
        return {"message": "Login successful!"}, 200
    else:
        return {"error": "Invalid credentials"}, 401

if __name__ == '__main__':
    app.run(debug=True)
