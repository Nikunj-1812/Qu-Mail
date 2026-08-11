# Quantum Mail — Audit Report

## 1. What Was Built (Checklist)

### Endpoints
- [x] `POST /api/auth/signup/` — Registers user, runs `kyber.keygen()` & `dilithium.keygen()`, stores encrypted private key via Fernet at rest, returns JWT tokens.
- [x] `POST /api/auth/login/` — Authenticates user, verifies passphrase key decryption, returns JWT access & refresh tokens.
- [x] `GET /api/auth/me/` — Returns authenticated user profile and public key info.
- [x] `GET /api/auth/users/` — Lists all registered users and public keys for email composition.
- [x] `POST /api/mail/compose/` — Encrypts email based on security level (1, 2, or 3), builds cryptographic envelope, stores `EncryptedEmail`, and logs `InterceptedPacket`.
- [x] `GET /api/mail/inbox/` — Returns list of received emails for authenticated user.
- [x] `GET /api/mail/sent/` — Returns list of sent emails for authenticated user.
- [x] `GET /api/mail/<id>/` — Decrypts email payload on read, sets `is_read = True`, and returns decrypted body and raw envelope.
- [x] `GET /api/network/wire-log/` — Public endpoint returning raw intercepted network packets.

### Models
- [x] `User` (`accounts.models`) — Extends `AbstractUser` with unique email.
- [x] `UserKeypair` (`accounts.models`) — Stores `kyber_public_key`, `dilithium_public_key`, `encrypted_private_keys` (Fernet b64), and PBKDF2 salt.
- [x] `EncryptedEmail` (`mailer.models`) — Stores `sender`, `recipient`, `security_level`, `subject`, `encrypted_payload` (JSON), `timestamp`, `is_read`.
- [x] `InterceptedPacket` (`network_sim.models`) — Stores `email`, `sender_username`, `recipient_username`, `security_level`, `raw_payload`, `intercepted_at`.

### Crypto Core Functions (`crypto_core`)
- [x] `kyber.py` — `keygen()`, `encapsulate(pk)`, `decapsulate(sk, ct)` (simulated Kyber-1024 KEM using secrets & SHA-256 derivation).
- [x] `dilithium.py` — `keygen()`, `sign(sk, msg)`, `verify(pk, msg, sig)` (simulated post-quantum digital signature using HMAC-SHA256).
- [x] `aes_cipher.py` — `encrypt_body(key, plaintext)`, `decrypt_body(key, ciphertext, nonce)` (REAL 256-bit AES-GCM via Python `cryptography` library).
- [x] `key_storage.py` — `encrypt_key_data(key_data, passphrase)`, `decrypt_key_data(...)` (REAL Fernet key storage at rest using PBKDF2HMAC SHA-256 with 100,000 iterations).
- [x] `envelope.py` — `create_envelope(...)`, `decrypt_envelope(...)` (Constructs and parses Level 1, 2, and 3 cryptographic payloads).
- [x] `trace.py` — `TraceLogger` class for logging step-by-step cryptographic operation events.

### Management Commands & UI
- [x] `python manage.py seed_demo` — Idempotent seeder creating `alice_demo`, `bob_demo`, `judge_demo` (`Demo@1234`) and 3 pre-seeded emails (Levels 1, 2, 3).
- [x] `testing_ui/` — Single-page HTML5/CSS3/JS UI with header account switcher, auth panel, inbox/sent tabbed list, email reader modal with raw envelope JSON inspector, and live Wire Log viewer.

---

## 2. Security Notes (Real vs. Simulated Cryptography)

| Component | Status | Description |
| :--- | :--- | :--- |
| **AES-256 GCM** | **REAL (Production-grade)** | Uses standard `cryptography.hazmat.primitives.ciphers.aead.AESGCM` with random 96-bit nonces. |
| **Key Storage at Rest** | **REAL (Production-grade)** | Uses Fernet symmetric encryption derived from user passphrase using PBKDF2HMAC SHA-256 with 100,000 iterations and random salt. |
| **Kyber KEM** | **SIMULATED (Demo-grade)** | Uses standard `secrets.token_hex()` and SHA-256 to model post-quantum key encapsulation and deterministic decapsulation. |
| **Dilithium Signatures** | **SIMULATED (Demo-grade)** | Uses HMAC-SHA256 to simulate post-quantum digital signature generation and verification. |
| **Quantum One-Time Pad (OTP)** | **SIMULATED (Demo-grade)** | Uses random byte streams XORed with plaintext bytes to demonstrate mathematical unbreakability on the wire. |

---

## 3. Deviations From Prompt

- **No Framework UI**: Built standard vanilla HTML5/CSS3/JS as requested with no build step (no npm/vite/webpack required).
- **JWT Lifetimes**: Set JWT access token lifetime to 1 day for convenient testing without re-login during evaluation.

---

## 4. Known Limitations

1. **Key Bank Management**: Level 3 One-Time Pad keys are generated on demand and embedded in envelope payloads for demo convenience rather than fetched from a distributed quantum key distribution (QKD) hardware node.
2. **Expired JWT Handling**: Automatic silent token refresh in UI is simplified; if token expires after 24h, re-login is required.
3. **Trace Console WebSockets**: WebSocket Channel Layer is configured using `InMemoryChannelLayer` for Channels 4; REST fallback API endpoints are used for wire-log streaming.

---

## 5. Test Coverage Summary

- **`test_kyber.py`**: Verifies Kyber keygen, encapsulation, decapsulation, and shared secret equality.
- **`test_aes_cipher.py`**: Verifies AES-256-GCM encryption and decryption round-trip.
- **`test_envelope_roundtrip.py`**: Verifies message envelope creation and decryption across Level 1 (Plain), Level 2 (Kyber+AES), and Level 3 (OTP).
- **`test_api_endpoints.py`**: Verifies JWT authentication (`/api/auth/login/`, `/api/auth/signup/`), mail composition, inbox retrieval, and wire log endpoints.

---

## 6. How to Verify Manually (Step-by-Step)

1. **Start Backend Server**:
   ```bash
   cd backend
   python manage.py runserver
   ```
2. **Open Testing UI**:
   Open `testing_ui/index.html` in your browser.
3. **Verify Demo Data**:
   - Click **`Alice (Sender)`** in top right header to log in as Alice.
   - Click **`Bob (Receiver)`** in top right header to switch to Bob. Observe Bob's inbox populated with 3 pre-seeded emails (Level 1, Level 2, Level 3).
4. **Open Email & Confirm Decryption**:
   - Click the Level 3 (Quantum OTP) email in Bob's inbox.
   - Confirm plaintext content is displayed: `"Hello Bob, this email is protected by Level 3 Quantum One-Time Pad (OTP) encryption..."`.
   - Inspect the **Cryptographic Envelope Structure (Raw JSON)** section in the modal to see `otp_ciphertext` hex.
5. **Verify Wire Log Interceptor**:
   - Click the **`Wire Log Interceptor`** tab.
   - Compare the raw packets:
     - Level 1 packet shows cleartext string.
     - Level 2 & Level 3 packets show unreadable hex ciphertexts (`kyber_ciphertext`, `aes_ciphertext`, `otp_ciphertext`).
6. **Compose New Email**:
   - Log in as **`alice_demo`**.
   - Click **`+ Compose Quantum Email`**, select recipient `bob_demo`, level `3`, enter subject and body, and click **`Encrypt & Send Email`**.
   - Switch account to **`bob_demo`**, open the new email, and verify decryption.
