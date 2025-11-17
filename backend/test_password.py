from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash from database
stored_hash = "$2b$12$hYesa60VonL0/ZIVGGY79ur.Yt74AHvhsGy8WoDjHCFlEgUZWfax6"
test_password = "operator123"

# Test
result = pwd_ctx.verify(test_password, stored_hash)
print(f"Password verification: {result}")

# Generate new hash
new_hash = pwd_ctx.hash(test_password)
print(f"New hash for 'operator123': {new_hash}")
