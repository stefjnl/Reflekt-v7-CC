#!/usr/bin/env python3
"""
Test database connection to Reflekt PostgreSQL on Blackview mini PC.
Run: python test_db_connection.py
"""

import psycopg2
from psycopg2 import sql
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Connection details - try different sslmode settings
DB_CONFIGS = [
    {
        "name": "With SSL preferred",
        "config": {
            "host": "192.168.68.112",
            "port": 5432,
            "database": "reflekt-db",
            "user": "stefan",
            "password": "stefan_secure_password_2025",
            "sslmode": "prefer"
        }
    },
    {
        "name": "With SSL disabled",
        "config": {
            "host": "192.168.68.112",
            "port": 5432,
            "database": "reflekt-db",
            "user": "stefan",
            "password": "stefan_secure_password_2025",
            "sslmode": "disable"
        }
    },
    {
        "name": "With SSL required",
        "config": {
            "host": "192.168.68.112",
            "port": 5432,
            "database": "reflekt-db",
            "user": "stefan",
            "password": "stefan_secure_password_2025",
            "sslmode": "require"
        }
    }
]

def test_connection():
    """Test basic database connection"""
    conn = None
    successful_config = None

    for config_set in DB_CONFIGS:
        print(f"\nTrying: {config_set['name']}")
        print(f"Host: {config_set['config']['host']}:{config_set['config']['port']}")
        print(f"Database: {config_set['config']['database']}")
        print(f"User: {config_set['config']['user']}")
        print(f"SSL Mode: {config_set['config'].get('sslmode', 'default')}")
        print("-" * 50)

        try:
            conn = psycopg2.connect(**config_set['config'])
            print("✓ Connection successful!")
            successful_config = config_set
            break
        except psycopg2.OperationalError as e:
            print(f"✗ Failed: {e}")
            continue

    if not conn:
        print("\n" + "=" * 50)
        print("✗ All connection attempts failed!")
        print("=" * 50)
        print("\nTroubleshooting:")
        print("1. Check if PostgreSQL is running on 192.168.68.112")
        print("2. Verify firewall allows connections on port 5432")
        print("3. Check pg_hba.conf allows connections from this IP")
        print("4. Verify credentials are correct")
        print("\nYour current IP appears to be: 192.168.68.110")
        print("Add this to pg_hba.conf on the server:")
        print("  host    reflekt-db    reflekt_user    192.168.68.110/32    md5")
        return False

    try:
        print(f"\n✓ Connected using: {successful_config['name']}")
        print("-" * 50)

        cursor = conn.cursor()

        # Test 1: Get PostgreSQL version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"\n✓ PostgreSQL version: {version[:50]}...")

        # Test 2: Check if entries table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'entries'
            );
        """)
        entries_exists = cursor.fetchone()[0]

        if entries_exists:
            print("✓ 'entries' table exists")

            # Test 3: Count entries
            cursor.execute("SELECT COUNT(*) FROM entries;")
            entry_count = cursor.fetchone()[0]
            print(f"✓ Total entries: {entry_count}")

            # Test 4: Get sample entry
            cursor.execute("""
                SELECT id, title, created_at
                FROM entries
                ORDER BY created_at DESC
                LIMIT 1;
            """)
            sample = cursor.fetchone()
            if sample:
                print(f"✓ Latest entry: ID={sample[0]}, Title='{sample[1][:30]}...', Date={sample[2]}")
        else:
            print("✗ 'entries' table NOT found!")
            return False

        # Test 5: Check if users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'users'
            );
        """)
        users_exists = cursor.fetchone()[0]

        if users_exists:
            print("✓ 'users' table exists")
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            print(f"✓ Total users: {user_count}")
        else:
            print("⚠ 'users' table NOT found (will need to create)")

        # Test 6: Check indexes
        cursor.execute("""
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'entries'
            ORDER BY indexname;
        """)
        indexes = cursor.fetchall()
        print(f"\n✓ Indexes on 'entries': {len(indexes)}")
        for idx in indexes:
            print(f"  - {idx[0]}")

        cursor.close()
        conn.close()

        print("\n" + "=" * 50)
        print("✓ All tests passed! Database is ready.")
        print(f"✓ Use sslmode='{successful_config['config'].get('sslmode', 'prefer')}' in your connection string")
        print("=" * 50)
        return True

    except Exception as e:
        print(f"\n✗ Unexpected error during tests: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
