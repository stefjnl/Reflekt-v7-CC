#!/usr/bin/env python3
"""Check users in the database and show test credentials."""
import psycopg2
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_CONFIG = {
    "host": "192.168.68.112",
    "port": 5432,
    "database": "reflekt-db",
    "user": "stefan",
    "password": "stefan_secure_password_2025",
    "sslmode": "prefer"
}

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

print("Existing users in the database:")
print("=" * 70)

cursor.execute("""
    SELECT id, email, hashed_password, created_at
    FROM users
    ORDER BY id;
""")

for row in cursor.fetchall():
    print(f"\nID: {row[0]}")
    print(f"Email: {row[1]}")
    print(f"Password Hash: {row[2][:50]}...")
    print(f"Created: {row[3]}")

cursor.close()
conn.close()

print("\n" + "=" * 70)
print("\nTo login, you need:")
print("1. An email from the list above")
print("2. The PLAIN TEXT password (not the hash)")
print("\nIf you don't know the passwords, you can create a test user:")
print("  python create_test_user.py")
