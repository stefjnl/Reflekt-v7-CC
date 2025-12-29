#!/usr/bin/env python3
"""Create a test user with known credentials for testing."""
import psycopg2
import sys
import io

# Need to install bcrypt: pip install bcrypt
try:
    import bcrypt
except ImportError:
    print("ERROR: bcrypt not installed. Run: pip install bcrypt")
    sys.exit(1)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_CONFIG = {
    "host": "192.168.68.112",
    "port": 5432,
    "database": "reflekt-db",
    "user": "stefan",
    "password": "stefan_secure_password_2025",
    "sslmode": "prefer"
}

# Test user credentials
TEST_EMAIL = "test@reflekt.local"
TEST_PASSWORD = "password123"

print("Creating test user...")
print(f"Email: {TEST_EMAIL}")
print(f"Password: {TEST_PASSWORD}")
print("-" * 50)

# Hash the password with bcrypt
password_hash = bcrypt.hashpw(TEST_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Check if user already exists
cursor.execute("SELECT id FROM users WHERE email = %s", (TEST_EMAIL,))
existing = cursor.fetchone()

if existing:
    print(f"\n✓ User already exists with ID: {existing[0]}")
    print("\nUse these credentials to login:")
    print(f"  Email: {TEST_EMAIL}")
    print(f"  Password: {TEST_PASSWORD}")
else:
    # Insert new user
    cursor.execute("""
        INSERT INTO users (email, hashed_password, created_at)
        VALUES (%s, %s, NOW())
        RETURNING id
    """, (TEST_EMAIL, password_hash))

    user_id = cursor.fetchone()[0]
    conn.commit()

    print(f"\n✓ Test user created successfully!")
    print(f"  ID: {user_id}")
    print("\nUse these credentials to login:")
    print(f"  Email: {TEST_EMAIL}")
    print(f"  Password: {TEST_PASSWORD}")

cursor.close()
conn.close()

print("\n" + "=" * 50)
print("You can now login at: http://localhost:3005/login")
