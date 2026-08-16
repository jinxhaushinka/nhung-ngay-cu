import base64, getpass, json, os, secrets, hashlib
from pathlib import Path

# This tool creates AES-GCM encrypted content compatible with app.js.
# It uses only Python's standard library for the file preparation step.
# For real AES-GCM encryption, install cryptography:
#   pip install cryptography

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    raise SystemExit("Please install the one dependency first: pip install cryptography")

ITERATIONS = 250000
SALT = b"nhung-ngay-cu-v1"

password = getpass.getpass("New blog password: ")
if not password:
    raise SystemExit("Password cannot be empty.")

posts = json.loads(Path("posts.json").read_text(encoding="utf-8"))
key = hashlib.pbkdf2_hmac("sha256", password.encode(), SALT, ITERATIONS, dklen=32)
iv = secrets.token_bytes(12)
plaintext = json.dumps(posts, ensure_ascii=False).encode("utf-8")
ciphertext = AESGCM(key).encrypt(iv, plaintext, None)

payload = {
    "iv": base64.b64encode(iv).decode(),
    "data": base64.b64encode(ciphertext).decode()
}
Path("content.enc.json").write_text(json.dumps(payload), encoding="utf-8")
print("Created content.enc.json. Remove posts.json before publishing.")
