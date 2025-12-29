#!/usr/bin/env python3
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

# Get users table schema
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
""")

print("Users table schema:")
print("-" * 60)
for row in cursor.fetchall():
    print(f"Column: {row[0]}")
    print(f"  Type: {row[1]}")
    if row[2]:
        print(f"  Length: {row[2]}")
    print(f"  Nullable: {row[3]}")
    print()

cursor.close()
conn.close()
