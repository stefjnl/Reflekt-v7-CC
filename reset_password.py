import bcrypt
import psycopg2

# New password you want to set
NEW_PASSWORD = "reflekt2025"  # Change this to whatever you want

# Generate bcrypt hash
password_bytes = NEW_PASSWORD.encode('utf-8')
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password_bytes, salt)
hashed_str = hashed.decode('utf-8')

print(f"New password: {NEW_PASSWORD}")
print(f"New hash: {hashed_str}")
print()

# Update database
conn = psycopg2.connect(
    'postgresql://stefan:stefan_secure_password_2025@192.168.68.112:5432/reflekt-db'
)
cur = conn.cursor()

cur.execute(
    "UPDATE users SET hashed_password = %s WHERE email = %s",
    (hashed_str, 'sjslagter@hotmail.com')
)

conn.commit()
print(f"Password updated for sjslagter@hotmail.com")
print(f"You can now log in with:")
print(f"  Email: sjslagter@hotmail.com")
print(f"  Password: {NEW_PASSWORD}")

cur.close()
conn.close()
