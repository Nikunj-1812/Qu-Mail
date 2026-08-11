# Quantum Mail (Backend + Testing UI)

Quantum Mail is a post-quantum encrypted email system featuring:
- **Simulated Kyber-1024 KEM** key encapsulation mechanism.
- **Simulated Dilithium** post-quantum digital signatures.
- **Real AES-256 GCM** symmetric body encryption (`cryptography` library).
- **Quantum One-Time Pad (OTP)** single-use XOR key bank encryption.
- **Fernet Key Storage** for private key encryption at rest using passphrase-derived PBKDF2HMAC keys.
- **Network Simulation & Wire Log Interceptor** showing raw packets captured in real-time.
- **Testing UI** (vanilla HTML5/CSS3/JS, zero build step) with one-click demo account switcher.

---

## 🚀 Setup & Execution Guide

### 1. Backend Setup & Run

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations accounts mailer network_sim
python manage.py migrate

# Seed demo accounts and sample emails
python manage.py seed_demo

# Launch Django REST API server
python manage.py runserver
```

---

### 2. Testing UI Setup & Run

Open `testing_ui/index.html` directly in any web browser (or serve via VS Code Live Server extension at `http://127.0.0.1:5500`).

---

## 🔑 Pre-seeded Demo Accounts

The `seed_demo` command automatically creates the following accounts (Password: `Demo@1234`):

| Username | Email | Role |
| :--- | :--- | :--- |
| **alice_demo** | `alice@qumail.test` | Sender in demo |
| **bob_demo** | `bob@qumail.test` | Receiver in demo |
| **judge_demo** | `judge@qumail.test` | Neutral account for independent exploration |

---

## 🛡️ Security Levels Overview

1. **Level 1 — Plaintext**: Standard unencrypted transmission. Exposes full text in the Wire Log.
2. **Level 2 — Kyber KEM + AES-256 GCM**: Recipient public key encapsulation generates shared secret for AES-256 GCM body encryption and Dilithium signature verification.
3. **Level 3 — Quantum One-Time Pad (OTP)**: Perfect secrecy XOR encryption using a single-use key drawn from key bank.

---

## 🧪 Running Automated Unit Tests

```bash
cd backend
python manage.py test tests
```
