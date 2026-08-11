# QuMail — Notes Page Implementation & Security Audit Report

## Executive Summary
This document provides a comprehensive audit of the newly built **"Notes — How QuMail Works"** interactive cryptography learning page. The page is integrated into QuMail's existing visual identity and provides a complete visual, educational breakdown of QuMail's internal post-quantum key encapsulation mechanism (Kyber-1024 KEM), symmetric payload encryption (AES-256-GCM), digital signatures (Dilithium), and one-time pads (OTP).

---

## 1. Files Created & Modified

### Modified Files:
- [index.html](file:///c:/Users/nikun/OneDrive/Desktop/Projects/QuMail/testing_ui/index.html):
  - Added GSAP 3.12.5 & ScrollTrigger CDN script tags.
  - Added Lucide Icons CDN script tag.
  - Added `📖 Notes — How QuMail Works` navigation tab button (`#tab-btn-notes`).
  - Added `#tab-notes` container containing all 23 educational sections, sticky navigation sidebar, mode toggles, and interactive controls.
- [style.css](file:///c:/Users/nikun/OneDrive/Desktop/Projects/QuMail/testing_ui/style.css):
  - Added CSS rules for topbar mode switcher, 2-column notes layout, sticky sidebar links, scrollspy active indicators.
  - Added styles for flow diagrams, animated packet dots, callout boxes, interactive AES machine, Kyber visualizer, side-by-side comparison matrix, JSON packet anatomy inspector, searchable glossary, highway diagram, 22-step story mode player, quiz cards, and media queries for responsiveness & `prefers-reduced-motion`.
- [app.js](file:///c:/Users/nikun/OneDrive/Desktop/Projects/QuMail/testing_ui/app.js):
  - Added tab routing for `notes` with GSAP entrance animations.
  - Added Beginner / Advanced mode toggle controller (`setLearningMode()`).
  - Added Hero diagram GSAP animation timeline (`initHeroAnimation()`).
  - Added Interactive AES Encryption Machine demo (`runAesMachineDemo()`).
  - Added 6-step Kyber path visualizer stepper (`nextKyberStep()`, `prevKyberStep()`, `resetKyberStep()`).
  - Added Interactive Network / Attacker view level selector (`selectNetworkDemoLevel()`).
  - Added JSON Packet Anatomy inspector with live `/api/network/wire-log` API integration (`renderAnatomyJSON()`, `switchAnatomyTab()`, `inspectToken()`).
  - Added Searchable Glossary filter engine (`initGlossary()`, `filterGlossary()`).
  - Added 22-step automated Story Mode Player with play, pause, step prev/next, and speed control (`toggleStoryPlay()`, `changeStorySpeed()`).
  - Added Interactive Quick Quiz state management & score evaluation (`initQuiz()`, `checkQuizAnswer()`).
  - Added sticky sidebar ScrollSpy observer (`initScrollSpy()`).

### Created Files:
- [NOTES_PAGE_AUDIT.md](file:///c:/Users/nikun/OneDrive/Desktop/Projects/QuMail/NOTES_PAGE_AUDIT.md)

---

## 2. Components & Educational Modules Built

1. **Top Control Bar**: Beginner vs. Advanced mode toggle switch.
2. **Sticky Sidebar Navigation**: Jump links with real-time ScrollSpy scroll highlighting.
3. **Hero Section**: Animated Alice → Encryption → Network (Attacker) → Decryption → Bob pipeline.
4. **Before Cryptography Section**: Plaintext vulnerability demonstration.
5. **3-Level Overview Cards**: Direct navigation cards for L1 Plaintext, L2 Kyber+AES, L3 Quantum OTP.
6. **Level 1 Plaintext Diagram**: Cleartext packet breakdown & attack visibility.
7. **Why Level 2 Exists**: Plaintext to Ciphertext transformation demonstration.
8. **AES-256-GCM Interactive Machine**: Live input text + 256-bit key + 12-byte Nonce encryption scrambling engine.
9. **Kyber 6-Step Visualizer**: Step-by-step keypair generation, public key sharing, encapsulation, shared secret derivation, Kyber ciphertext transmission, and decapsulation. Prominently displays: **"THE SHARED SECRET DOES NOT TRAVEL FROM ALICE TO BOB."**
10. **Level 2 Complete Flow**: End-to-end architecture diagram & raw JSON payload schema.
11. **Nonce Section**: Explanation of 12-byte initialization vectors and nonce reuse risks.
12. **Authentication Tag Section**: AES-GCM 16-byte tag tamper-detection demonstration.
13. **Dilithium Signatures**: Sign vs Encrypt comparison, clearly marked as **SIMULATED IN THIS DEMO**.
14. **Level 3 OTP Section**: Bitwise XOR demonstration & debug `otp_key_hex` educational warning.
15. **Side-by-Side Comparison Matrix**: Feature table comparing Levels 1, 2, and 3 across encryption, key mechanism, network payload, and attacker visibility.
16. **Interactive Network / Attacker View**: Live level switching for wire log packet inspection.
17. **Packet Anatomy Inspector**: Interactive JSON token inspector + **Live Real Packet** tab fetching real intercepted payloads from `/api/network/wire-log`.
18. **Searchable Cryptography Glossary**: Filterable dictionary for terms like Nonce, Kyber, Ciphertext, Shared Secret, Auth Tag, KEM, etc.
19. **Secret vs Public Table**: Breakdown of secret vs public items and network transmission status.
20. **Network Highway**: Vault vs transmitted packet visual diagram.
21. **Complete Story Mode Player**: 22-step automated message journey timeline player with speed controls (0.5x, 1x, 1.5x).
22. **Real vs Simulated Cryptography Breakdown**: Clear cards outlining real library usages vs simulated demo modules.
23. **Under The Hood (Advanced)**: NIST ML-KEM and ML-DSA standard references and formal cryptographic notation.
24. **Quick Quiz**: 5 interactive multiple-choice questions with instant feedback and explanations.

---

## 3. Real vs Simulated Cryptography Analysis

Based on inspection of `crypto_core/`:

### Real Components:
- **AES-256-GCM Payload Encryption**: Uses Python's `cryptography.hazmat.primitives.ciphers.aead.AESGCM`.
- **Key Storage Encryption**: Uses Fernet & PBKDF2 HMAC-SHA256 password key derivation in `crypto_core/key_storage.py`.
- **Backend API & Data Persistence**: Django REST Framework, SimpleJWT authentication, and SQLite models.

### Simulated Components:
- **Kyber-1024 KEM (`crypto_core/kyber.py`)**: Token-based SHA-256 / secrets simulation (`keygen()`, `encapsulate()`, `decapsulate()`).
- **Dilithium Signatures (`crypto_core/dilithium.py`)**: HMAC-SHA256 token simulation (`keygen()`, `sign()`, `verify()`).
- **One-Time Pad (`crypto_core/envelope.py`)**: Byte-by-byte XOR simulation with debug `otp_key_hex` included in JSON payload envelope.

---

## 4. Actual JSON Packet Schemas Documented

### Level 1 Payload:
```json
{
  "security_level": 1,
  "body": "Hello Bob",
  "sender_pk": "dilithium_pk_...",
  "signature": "dilithium_sig_..."
}
```

### Level 2 Payload:
```json
{
  "security_level": 2,
  "kyber_ciphertext": "kyber_ct_...",
  "aes_ciphertext": "8f92ab...",
  "nonce": "1a2b3c...",
  "sender_pk": "dilithium_pk_...",
  "signature": "dilithium_sig_..."
}
```

### Level 3 Payload:
```json
{
  "security_level": 3,
  "otp_ciphertext": "a1b2c3...",
  "otp_key_hex": "f9e8d7... [Debug Demo Visibility]",
  "sender_pk": "dilithium_pk_...",
  "signature": "dilithium_sig_..."
}
```

---

## 5. Verification & Testing

### Regression Checks:
- ✅ **Django System Check**: `venv\Scripts\python manage.py check` executed cleanly with 0 errors.
- ✅ **Authentication & Login**: Switching between demo users (`alice_demo`, `bob_demo`, `judge_demo`) functions identically.
- ✅ **Compose & Send Email**: Encrypting & transmitting messages across Levels 1, 2, and 3 works seamlessly.
- ✅ **Inbox & Email Modal**: Reading received emails and deleting emails works cleanly.
- ✅ **Wire Log Interceptor**: Live intercepted network packets log accurately.

### Accessibility & Responsiveness:
- ✅ Responsive layouts verified on Desktop (1440px), Laptop (1024px), Tablet (768px), and Mobile (375px).
- ✅ `@media (prefers-reduced-motion)` fallbacks added to disable non-essential animations for user accessibility.

---

## 6. How to Verify the Notes Page Manually

1. **Open the Application**:
   Navigate to `http://127.0.0.1:8000` or open `testing_ui/index.html` in a web browser.
2. **Access Notes Page**:
   Click on the **📖 Notes — How QuMail Works** tab in the main header navigation.
3. **Test Interactive Modules**:
   - Scroll through the section sidebar and verify sticky scrollspy highlighting.
   - Click **⚡ Encrypt with AES-GCM** in Section 6 to test the AES Machine.
   - Use **Previous / Next / Replay** controls in Section 8 to step through the Kyber visualizer.
   - Select **Level 1 / Level 2 / Level 3** buttons in Section 15 to test the Attacker Network Inspector.
   - In Section 16 (Packet Anatomy), click JSON keys like `kyber_ciphertext` and `nonce` to inspect definitions, then click **Live Wire Log Packet** to fetch live API data.
   - Type `nonce` or `Kyber` into the Glossary search bar in Section 17.
   - Click **▶ Play Story** in Section 20 to run the 22-step automated story player.
   - Answer questions in Section 23 to test the Quick Quiz.
