# QuantumMail — Post-Quantum Encrypted Email Client

A high-performance secure email platform with Post-Quantum Key Encapsulation (Kyber-1024 / ML-KEM), Quantum One-Time Pad (OTP), Dilithium Digital Signatures (ML-DSA), and AES-256-GCM authenticated payload encryption.

---

## 🏗️ Architecture & Technology Stack

```text
                    FRONTEND (Next.js 14 App Router)
                    ┌──────────────────────────────┐
                    │  React 18 + TypeScript       │
                    │  Post-Quantum Visualizers    │
                    │  End-to-End Attachments      │
                    │  Toast & Modal Alerts        │
                    └──────────────┬───────────────┘
                                   │ HTTP / JSON REST
                                   ▼
                    BACKEND (Django REST Framework)
                    ┌──────────────────────────────┐
                    │  Django 5 + SimpleJWT        │
                    │  Kyber-1024 KEM Simulation   │
                    │  Dilithium Signature Engine  │
                    │  Fernet Key Encryption Rest  │
                    │  SQLite / PostgreSQL DB      │
                    └──────────────────────────────┘
```

---

## 📋 Dependencies & Requirements

### 1. Frontend Requirements (`frontend/package.json`)
* **Runtime**: Node.js v18.17+ or v20+
* **Framework**: Next.js 14 (App Router)
* **Core Libraries**:
  * `react` & `react-dom` (v18)
  * `lucide-react` (Crisp vector icons)
  * `typescript` & `@types/react`
  * `clsx` (Class utilities)

### 2. Backend Requirements (`backend/requirements.txt`)
* **Runtime**: Python 3.10+ / Python 3.12 / Python 3.14
* **Framework**: Django 5.x
* **Core Libraries**:
  * `djangorestframework`
  * `djangorestframework-simplejwt`
  * `django-cors-headers`
  * `cryptography` (Fernet, AES-256-GCM, PBKDF2HMAC)
  * `psycopg2-binary` (Optional: for PostgreSQL database)

---

## 🗄️ Database Setup & Configuration

### SQLite (Default — Ready Out of the Box)
The project comes pre-configured with SQLite at `backend/db.sqlite3`.
* Pre-seeded with accounts: `alice_demo`, `bob_demo`, `judge_demo`
* Demo password: `Demo@1234`
* Pre-seeded with Level 1, Level 2, and Level 3 emails.

### PostgreSQL Configuration (Optional)
If you wish to connect to an external or local PostgreSQL database, install `psycopg2-binary` and configure `DATABASES` in `backend/config/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'qumail_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Then run:
```bash
python manage.py migrate
python manage.py seed_demo
```

---

## 🚀 How to Run the Application

### 1. Start Django Backend
```bash
cd backend
source venv/bin/activate

 127.0.0.1:8000
```
Backend API will be live at `http://127.0.0.1:8000`.

### 2. Start Next.js Frontend
```bash
cd frontend
npm run dev
```
Frontend web application will be live at `http://localhost:3000`.

---

## 🔐 Security Levels

| Security Level | Encryption Algorithm | Key Exchange / Signature | Vulnerable on Wire? |
|---|---|---|---|
| **Level 1** | Plaintext Cleartext | None | ⚠️ Yes (Raw Text) |
| **Level 2** | AES-256-GCM | Kyber-1024 KEM + Dilithium | 🛡️ No (Post-Quantum Protected) |
| **Level 3** | Quantum One-Time Pad | Bitwise XOR (Information-Theoretic) | 🛡️ No (Mathematically Unbreakable) |
