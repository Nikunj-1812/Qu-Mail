const API_BASE = "http://127.0.0.1:8000/api";

let authToken = localStorage.getItem("qm_token") || null;
let currentUser = JSON.parse(localStorage.getItem("qm_user") || "null");
let currentViewingEmailId = null;

// Check URL for secret /note route
function checkUrlRoute() {
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  if (hash.includes("note") || search.includes("note") || path.includes("/note")) {
    switchTab('notes');
  }
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  if (authToken && currentUser) {
    updateUserUI();
    fetchInbox();
    fetchSent();
  }
  fetchWireLog();

  // Initialize Notes Page Modules
  initGlossary();
  initQuiz();
  selectNetworkDemoLevel(1);
  renderAnatomyJSON('demo');
  initScrollSpy();
  initHeroAnimation();

  // Check URL route for hidden notes access
  checkUrlRoute();
});

window.addEventListener("hashchange", checkUrlRoute);


// Switch Tabs
function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");

  const btn = document.getElementById(`tab-btn-${tabName}`);
  const content = document.getElementById(`tab-${tabName}`);
  if (btn) btn.classList.add("active");
  if (content) content.style.display = "block";

  if (tabName === "inbox") fetchInbox();
  if (tabName === "sent") fetchSent();
  if (tabName === "wire") fetchWireLog();
  if (tabName === "notes") {
    if (typeof gsap !== "undefined") {
      gsap.from("#sec-hero", { opacity: 0, y: 20, duration: 0.6 });
    }
  }
}

// Update UI state based on logged in user
function updateUserUI() {
  const profileCard = document.getElementById("user-details-content");
  const badge = document.getElementById("user-status-badge");
  const authCard = document.getElementById("auth-card");
  const composeTrigger = document.getElementById("compose-trigger-card");

  if (currentUser && authToken) {
    badge.textContent = "Authenticated";
    badge.className = "badge badge-level-3";
    profileCard.innerHTML = `
      <div style="margin-bottom: 0.5rem;">
        <strong style="font-size: 1.1rem; color: var(--accent-cyan);">${currentUser.username}</strong>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
        Email: ${currentUser.email}
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all; margin-bottom: 0.5rem;">
        <strong>Kyber Public Key:</strong><br>${currentUser.kyber_public_key || "N/A"}
      </div>
      <button class="btn btn-secondary" style="margin-top: 0.5rem;" onclick="handleLogout()">Log Out</button>
    `;
    authCard.style.display = "none";
    composeTrigger.style.display = "block";

    // Highlight active switcher button
    document.querySelectorAll(".account-switcher .btn-switch").forEach(btn => {
      if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(`'${currentUser.username}'`)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  } else {
    badge.textContent = "Not Logged In";
    badge.className = "badge badge-level-1";
    profileCard.innerHTML = `
      <p style="font-size: 0.85rem; color: var(--text-muted);">Please select a demo account above or log in to view inbox and compose messages.</p>
    `;
    authCard.style.display = "block";
    composeTrigger.style.display = "none";
    document.querySelectorAll(".account-switcher .btn-switch").forEach(btn => btn.classList.remove("active"));
  }
}

// Quick Switcher
async function switchAccount(username) {
  await login(username, "Demo@1234");
}

// Handle Login Form Submit
async function handleLoginSubmit(event) {
  event.preventDefault();
  const u = document.getElementById("input-username").value.trim();
  const p = document.getElementById("input-password").value.trim();
  await login(u, p);
}

// Login Call
async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      authToken = data.access;
      currentUser = data.user;
      localStorage.setItem("qm_token", authToken);
      localStorage.setItem("qm_user", JSON.stringify(currentUser));
      updateUserUI();
      fetchInbox();
      fetchSent();
      fetchWireLog();
    } else {
      alert("Login Failed: " + (data.detail || JSON.stringify(data)));
    }
  } catch (err) {
    alert("Connection Error. Ensure Django backend is running at http://127.0.0.1:8000");
  }
}

// Logout
function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("qm_token");
  localStorage.removeItem("qm_user");
  updateUserUI();
  document.getElementById("inbox-list").innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Log in to view received messages.</p>`;
  document.getElementById("sent-list").innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Log in to view sent messages.</p>`;
}

// Fetch Inbox
async function fetchInbox() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/mail/inbox/`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (!res.ok) return;
    const emails = await res.json();
    renderEmailList(emails, "inbox-list", true);
  } catch (err) {
    console.error("Inbox fetch error:", err);
  }
}

// Fetch Sent
async function fetchSent() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/mail/sent/`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (!res.ok) return;
    const emails = await res.json();
    renderEmailList(emails, "sent-list", false);
  } catch (err) {
    console.error("Sent fetch error:", err);
  }
}

// Render Email List
function renderEmailList(emails, containerId, isInbox) {
  const container = document.getElementById(containerId);
  if (!emails || emails.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No emails found.</p>`;
    return;
  }

  container.innerHTML = emails.map(email => {
    const levelBadgeClass = `badge-level-${email.security_level}`;
    const levelText = email.security_level === 1 ? "L1 Plaintext" : (email.security_level === 2 ? "L2 Kyber+AES" : "L3 Quantum OTP");
    const otherUser = isInbox ? `From: ${email.sender.username}` : `To: ${email.recipient.username}`;
    const dateStr = new Date(email.timestamp).toLocaleString();
    const unreadClass = (isInbox && !email.is_read) ? "unread" : "";

    return `
      <div class="email-item ${unreadClass}" onclick="viewEmail(${email.id})">
        <div class="email-item-header">
          <span class="email-item-title">${escapeHtml(email.subject)}</span>
          <span class="badge ${levelBadgeClass}">${levelText}</span>
        </div>
        <div class="email-item-sub">
          <span>${otherUser}</span>
          <span>${dateStr}</span>
        </div>
      </div>
    `;
  }).join("");
}

// View Email Detail & Decrypt
async function viewEmail(emailId) {
  if (!authToken) {
    alert("Please log in first.");
    return;
  }
  currentViewingEmailId = emailId;
  try {
    const res = await fetch(`${API_BASE}/mail/${emailId}/`, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "X-Passphrase": "Demo@1234"
      }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      alert("Error reading email: " + (errData.detail || res.statusText));
      return;
    }
    const data = await res.json();

    document.getElementById("modal-subject").textContent = data.subject;
    document.getElementById("modal-sender").textContent = data.sender.username;
    document.getElementById("modal-recipient").textContent = data.recipient.username;
    document.getElementById("modal-time").textContent = new Date(data.timestamp).toLocaleString();
    document.getElementById("modal-decrypted-body").textContent = data.decrypted_body;
    document.getElementById("modal-envelope-json").textContent = JSON.stringify(data.encrypted_payload, null, 2);

    const badge = document.getElementById("modal-level-badge");
    badge.className = `badge badge-level-${data.security_level}`;
    badge.textContent = data.security_level === 1 ? "Level 1: Plaintext" : (data.security_level === 2 ? "Level 2: Kyber-1024 + AES-256" : "Level 3: Quantum OTP");

    document.getElementById("email-modal").classList.add("active");
    fetchInbox(); // refresh read status
  } catch (err) {
    console.error("View email error:", err);
    alert("Connection error reading email.");
  }
}

function closeEmailModal() {
  currentViewingEmailId = null;
  document.getElementById("email-modal").classList.remove("active");
}

// Delete Current Email
async function deleteCurrentEmail() {
  if (!currentViewingEmailId || !authToken) {
    alert("No email selected.");
    return;
  }

  if (!confirm("Are you sure you want to delete this email?")) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/mail/${currentViewingEmailId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });

    if (res.ok) {
      closeEmailModal();
      fetchInbox();
      fetchSent();
      fetchWireLog();
    } else {
      const data = await res.json().catch(() => ({}));
      alert("Delete failed: " + (data.detail || "Server error"));
    }
  } catch (err) {
    alert("Error deleting email.");
  }
}

// Compose Modal
function openComposeModal() {
  document.getElementById("compose-modal").classList.add("active");
}
function closeComposeModal() {
  document.getElementById("compose-modal").classList.remove("active");
}

// Handle Compose Form Submit
async function handleComposeSubmit(event) {
  event.preventDefault();
  if (!authToken) {
    alert("Please log in first.");
    return;
  }

  const recipient_username = document.getElementById("compose-recipient").value;
  const security_level = parseInt(document.getElementById("compose-level").value, 10);
  const subject = document.getElementById("compose-subject").value.trim();
  const body = document.getElementById("compose-body").value.trim();
  const passphrase = document.getElementById("compose-passphrase").value.trim();

  try {
    const res = await fetch(`${API_BASE}/mail/compose/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        recipient_username,
        security_level,
        subject,
        body,
        passphrase
      })
    });

    const data = await res.json();
    if (res.ok) {
      closeComposeModal();
      alert("Quantum email encrypted & transmitted successfully!");
      document.getElementById("compose-subject").value = "";
      document.getElementById("compose-body").value = "";
      fetchInbox();
      fetchSent();
      fetchWireLog();
    } else {
      alert("Compose failed: " + JSON.stringify(data));
    }
  } catch (err) {
    alert("Error sending email.");
  }
}

// Fetch Wire Log Packets
async function fetchWireLog() {
  try {
    const res = await fetch(`${API_BASE}/network/wire-log/`);
    if (!res.ok) return;
    const packets = await res.json();

    const tbody = document.getElementById("wire-log-tbody");
    if (!packets || packets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="color: var(--text-muted);">No wire packets captured yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = packets.map(p => {
      const levelBadgeClass = `badge-level-${p.security_level}`;
      const levelText = p.security_level === 1 ? "L1 Plain" : (p.security_level === 2 ? "L2 Kyber+AES" : "L3 Quantum OTP");
      const payloadStr = JSON.stringify(p.raw_payload, null, 2);
      const timeStr = new Date(p.intercepted_at).toLocaleTimeString();

      return `
        <tr>
          <td><span style="color: var(--text-muted); font-size: 0.75rem;">${timeStr}</span></td>
          <td><strong>${p.sender_username}</strong> &rarr; <strong>${p.recipient_username}</strong></td>
          <td><span class="badge ${levelBadgeClass}">${levelText}</span></td>
          <td><pre class="raw-code">${escapeHtml(payloadStr)}</pre></td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Wire log error:", err);
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ==========================================================================
   NOTES PAGE — INTERACTIVE CRYPTOGRAPHY MODULES
   ========================================================================== */

// 1. Learning Mode Toggle
function setLearningMode(mode) {
  document.getElementById("btn-mode-beginner").classList.toggle("active", mode === "beginner");
  document.getElementById("btn-mode-advanced").classList.toggle("active", mode === "advanced");
  if (mode === "advanced") {
    document.body.classList.add("mode-advanced");
  } else {
    document.body.classList.remove("mode-advanced");
  }
}

// 2. Hero GSAP Animation
function initHeroAnimation() {
  if (typeof gsap === "undefined") return;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
  tl.to("#dot-hero-1", { left: "100%", duration: 1.5, ease: "power1.inOut" })
    .to("#dot-hero-1", { opacity: 0, duration: 0.2 })
    .set("#dot-hero-2", { left: "0%", opacity: 1 })
    .to("#dot-hero-2", { left: "100%", duration: 1.5, ease: "power1.inOut" });
}

// 3. Interactive AES Encryption Machine
function runAesMachineDemo() {
  const textInput = document.getElementById("aes-input-text").value.trim() || "Hello Bob";
  const outputElem = document.getElementById("aes-output-ciphertext");

  // Animate encryption scramble simulation using actual pseudo-hex conversion
  let dummyHex = "";
  for (let i = 0; i < textInput.length * 2 + 16; i++) {
    dummyHex += Math.floor(Math.random() * 16).toString(16);
  }

  if (typeof gsap !== "undefined") {
    gsap.fromTo(outputElem, { opacity: 0.3, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4 });
  }

  outputElem.textContent = dummyHex.toLowerCase() + " (AES-256-GCM Tag Appended)";
}

// 4. Kyber Step Visualizer
let kyberStepCurrent = 1;
const kyberStepDescs = [
  "Step 1: Bob generates a Kyber-1024 Keypair (Public Key 🔓 & Private Key 🔑). The Private Key is stored securely in Bob's vault.",
  "Step 2: Bob transmits ONLY his Public Key 🔓 across the network to Alice. Anyone on the network (including an attacker) can observe this public key.",
  "Step 3: Alice receives Bob's Public Key 🔓 and performs Kyber Encapsulation. This produces a Shared Secret (ABC123) and a Kyber Ciphertext.",
  "Step 4: Alice keeps the Shared Secret (ABC123) locally in her secret vault. Alice transmits ONLY the Kyber Ciphertext across the network to Bob.",
  "Step 5: Bob receives the Kyber Ciphertext and uses his secret Private Key 🔑 to perform Kyber Decapsulation, deriving the exact same Shared Secret (ABC123).",
  "Step 6: Success! Both Alice and Bob now hold the identical Shared Secret (ABC123). THE SHARED SECRET ITSELF NEVER TRAVELED OVER THE NETWORK!"
];

function nextKyberStep() {
  if (kyberStepCurrent < 6) kyberStepCurrent++;
  updateKyberViz();
}
function prevKyberStep() {
  if (kyberStepCurrent > 1) kyberStepCurrent--;
  updateKyberViz();
}
function resetKyberStep() {
  kyberStepCurrent = 1;
  updateKyberViz();
}

function updateKyberViz() {
  document.getElementById("kyber-step-indicator").textContent = `Step ${kyberStepCurrent} of 6`;
  document.getElementById("kyber-step-desc").textContent = kyberStepDescs[kyberStepCurrent - 1];

  const aliceState = document.getElementById("viz-alice-state");
  const bobState = document.getElementById("viz-bob-state");
  const packetDot = document.getElementById("viz-packet-dot");
  const linkLabel = document.getElementById("viz-link-label");

  if (kyberStepCurrent === 1) {
    aliceState.textContent = "Idle";
    bobState.textContent = "Generated Keypair (PK + SK)";
    linkLabel.textContent = "Network Idle";
    packetDot.style.display = "none";
  } else if (kyberStepCurrent === 2) {
    aliceState.textContent = "Waiting for Bob PK";
    bobState.textContent = "Transmitting Public Key 🔓";
    linkLabel.textContent = "Public Key 🔓 on Wire";
    packetDot.style.display = "block";
    if (typeof gsap !== "undefined") gsap.fromTo(packetDot, { left: "100%" }, { left: "0%", duration: 1 });
  } else if (kyberStepCurrent === 3) {
    aliceState.textContent = "Encapsulating (Derived Shared Secret ABC123)";
    bobState.textContent = "Holding Private Key 🔑";
    linkLabel.textContent = "Encapsulation Complete";
    packetDot.style.display = "none";
  } else if (kyberStepCurrent === 4) {
    aliceState.textContent = "Sending Kyber Ciphertext 📦";
    bobState.textContent = "Waiting for Ciphertext";
    linkLabel.textContent = "Kyber Ciphertext 📦 on Wire";
    packetDot.style.display = "block";
    if (typeof gsap !== "undefined") gsap.fromTo(packetDot, { left: "0%" }, { left: "100%", duration: 1 });
  } else if (kyberStepCurrent === 5) {
    aliceState.textContent = "Secret Vault: ABC123";
    bobState.textContent = "Decapsulating with SK 🔑";
    linkLabel.textContent = "Decapsulating...";
    packetDot.style.display = "none";
  } else if (kyberStepCurrent === 6) {
    aliceState.textContent = "🔑 Shared Secret: ABC123";
    bobState.textContent = "🔑 Shared Secret: ABC123";
    linkLabel.textContent = "🔒 MATCHED (Shared Secret Kept Secret)";
    packetDot.style.display = "none";
  }
}

// 5. Network Demo Level Switcher
function selectNetworkDemoLevel(level) {
  document.querySelectorAll("#sec-network-demo .btn-switch").forEach(b => b.classList.remove("active"));
  document.getElementById(`btn-net-l${level}`).classList.add("active");

  const output = document.getElementById("network-demo-output");
  if (level === 1) {
    output.innerHTML = `<span style="color: var(--accent-rose);">[ATTACKER READS CLEAR TEXT]</span><br>{<br>  "security_level": 1,<br>  "body": "Hello Bob, meeting password is QUANTUM123"<br>}`;
  } else if (level === 2) {
    output.innerHTML = `<span style="color: var(--accent-emerald);">[ATTACKER SEES ONLY ENCRYPTED HEX Payload]</span><br>{<br>  "security_level": 2,<br>  "kyber_ciphertext": "kyber_ct_8f92a18b3c...",<br>  "aes_ciphertext": "8f92ab71c4e920d3f82a1...",<br>  "nonce": "1a2b3c4d5e6f"<br>}`;
  } else {
    output.innerHTML = `<span style="color: var(--accent-cyan);">[ATTACKER SEES ONE-TIME PAD XOR HEX Payload]</span><br>{<br>  "security_level": 3,<br>  "otp_ciphertext": "a1b2c3d4e5f6...",<br>  "otp_key_hex": "f9e8d7c6b5a4... [Debug Demo Visibility]"<br>}`;
  }
}

// 6. Anatomy JSON Property Inspector & Live Real Packet Integration
const anatomyProperties = {
  security_level: "Security Level: 1 = Plaintext, 2 = Kyber-1024 KEM + AES-256-GCM, 3 = One-Time Pad (OTP).",
  kyber_ciphertext: "Kyber Ciphertext: The encapsulated key payload generated by Alice using Bob's Public Key. Bob decapsulates this using his Private Key to recover the Shared Secret.",
  aes_ciphertext: "AES Ciphertext: The encrypted email body text produced by AES-256-GCM symmetric encryption using the derived 256-bit key.",
  nonce: "Nonce (Initialization Vector): A unique 12-byte random number used once per AES-GCM encryption operation to prevent replay attacks.",
  sender_pk: "Sender Public Key: Dilithium public verification key associated with the sender to verify signatures.",
  signature: "Digital Signature: Dilithium signature generated using Alice's private signing key over the envelope payload to guarantee authenticity & integrity.",
  otp_ciphertext: "OTP Ciphertext: Byte sequence encrypted via bitwise XOR with single-use One-Time Pad key bytes.",
  otp_key_hex: "OTP Key Hex: Single-use OTP key bytes in hex. (Note: Exposed here for demo/debug inspection purposes)."
};

async function renderAnatomyJSON(tab) {
  const jsonDisplay = document.getElementById("anatomy-json-display");
  let envelopeObj = {
    security_level: 2,
    kyber_ciphertext: "kyber_ct_7f92a18b3c4d5e6f...",
    aes_ciphertext: "8f92ab71c4e920d3f82a19b...",
    nonce: "1a2b3c4d5e6f7a8b9c0d1e2f",
    sender_pk: "dilithium_pk_a8f921b...",
    signature: "dilithium_sig_92c1f8a..."
  };

  if (tab === "real") {
    try {
      const res = await fetch(`${API_BASE}/network/wire-log/`);
      if (res.ok) {
        const packets = await res.json();
        if (packets && packets.length > 0) {
          envelopeObj = packets[0].raw_payload;
        }
      }
    } catch (err) {
      console.error("Error fetching live wire log:", err);
    }
  }

  let html = "{\n";
  const keys = Object.keys(envelopeObj);
  keys.forEach((key, idx) => {
    const val = typeof envelopeObj[key] === "string" ? `"${envelopeObj[key]}"` : envelopeObj[key];
    const comma = idx < keys.length - 1 ? "," : "";
    html += `  "<span class="token-prop" onclick="inspectToken('${key}')">${key}</span>": <span class="token-val">${escapeHtml(val)}</span>${comma}\n`;
  });
  html += "}";

  jsonDisplay.innerHTML = html;
}

function switchAnatomyTab(tab) {
  document.getElementById("btn-anatomy-demo").classList.toggle("active", tab === "demo");
  document.getElementById("btn-anatomy-real").classList.toggle("active", tab === "real");
  renderAnatomyJSON(tab);
}

function inspectToken(key) {
  const expBox = document.getElementById("anatomy-explanation-box");
  const desc = anatomyProperties[key] || "Cryptographic property field.";
  expBox.innerHTML = `
    <div style="font-weight: 700; color: var(--accent-blue); margin-bottom: 0.5rem;">🔑 Property: ${key}</div>
    <p style="font-size: 0.9rem; color: var(--text-primary); font-weight: 500;">${desc}</p>
  `;
}

// 7. Cryptography Glossary (QuMail Dictionary)
const glossaryTerms = [
  { term: "Plaintext", def: "Unencrypted, human-readable original message data.", qumail: "Raw email text before encryption." },
  { term: "Ciphertext", def: "Encrypted, unreadable scrambled form of the message.", qumail: "AES or OTP output hex payloads." },
  { term: "Encryption", def: "Mathematical process converting plaintext into ciphertext.", qumail: "AES-256-GCM or OTP XOR operations." },
  { term: "Decryption", def: "Mathematical process recovering plaintext from ciphertext using key.", qumail: "Bob decrypting incoming emails." },
  { term: "Public Key", def: "Key that can be safely distributed publicly to anyone.", qumail: "Bob shares his Kyber PK so Alice can encapsulate secrets." },
  { term: "Private Key", def: "Secret key kept strictly private by its owner.", qumail: "Bob uses his Kyber SK to decapsulate shared secrets." },
  { term: "Shared Secret", def: "Matching secret bytes derived at both ends without sending secret.", qumail: "Derived via Kyber KEM for AES key input." },
  { term: "AES-256-GCM", def: "Advanced Encryption Standard with 256-bit key in Galois/Counter Mode.", qumail: "Symmetric payload encryption algorithm." },
  { term: "Kyber (ML-KEM)", def: "NIST-standardized Post-Quantum Key Encapsulation Mechanism.", qumail: "Establishes shared secrets resilient to quantum computers." },
  { term: "Dilithium (ML-DSA)", def: "NIST-standardized Post-Quantum Digital Signature Algorithm.", qumail: "Verifies authenticity and integrity of messages." },
  { term: "Nonce (IV)", def: "Unique initialization vector used once per encryption operation.", qumail: "12-byte random value passed to AES-GCM." },
  { term: "Authentication Tag", def: "16-byte GCM integrity tag detecting data tampering.", qumail: "Guarantees ciphertext has not been modified." },
  { term: "One-Time Pad (OTP)", def: "Cryptographic system using single-use random keys matching message length.", qumail: "Level 3 bitwise XOR encryption." }
];

function initGlossary() {
  const container = document.getElementById("glossary-container");
  if (!container) return;
  renderGlossaryItems(glossaryTerms);
}

function renderGlossaryItems(items) {
  const container = document.getElementById("glossary-container");
  container.innerHTML = items.map(t => `
    <div class="glossary-card">
      <div class="glossary-term">${t.term}</div>
      <div class="glossary-def">${t.def}</div>
      <div class="glossary-sub"><strong>In QuMail:</strong> ${t.qumail}</div>
    </div>
  `).join("");
}

function filterGlossary() {
  const q = document.getElementById("glossary-search").value.toLowerCase();
  const filtered = glossaryTerms.filter(t => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q) || t.qumail.toLowerCase().includes(q));
  renderGlossaryItems(filtered);
}

// 8. Story Mode Automated Player
let storyCurrentIndex = 0;
let storyInterval = null;
let storySpeed = 1;

const storySteps = [
  { title: "Step 1 / 22: Alice Composes Email", msg: "Alice writes: 'Top Secret Operation Details'", detail: "Plaintext initialized locally on Alice's device." },
  { title: "Step 2 / 22: Bob's Key Generation", msg: "Bob generates Kyber-1024 Keypair", detail: "Bob produces Public Key 🔓 and Private Key 🔑." },
  { title: "Step 3 / 22: Bob Shares Public Key", msg: "Bob 🔓 Public Key ➔ Transmitted to Alice", detail: "Attacker observes Public Key on wire." },
  { title: "Step 4 / 22: Alice Encapsulates", msg: "Alice runs Kyber Encapsulation(Bob PK)", detail: "Derives Shared Secret (ABC123) & Kyber Ciphertext." },
  { title: "Step 5 / 22: Secret Kept Local", msg: "Alice keeps Shared Secret (ABC123) in Vault", detail: "THE SHARED SECRET DOES NOT TRAVEL." },
  { title: "Step 6 / 22: Kyber Ciphertext Sent", msg: "Kyber Ciphertext 📦 ➔ Network Wire ➔ Bob", detail: "Attacker sees ciphertext hex." },
  { title: "Step 7 / 22: Bob Decapsulates", msg: "Bob Decapsulates with Private Key 🔑", detail: "Bob recovers identical Shared Secret (ABC123)." },
  { title: "Step 8 / 22: Key Derivation (KDF)", msg: "SHA-256(Shared Secret) ➔ 256-bit AES Key", detail: "Both sides possess matching AES Key." },
  { title: "Step 9 / 22: Nonce Generation", msg: "Unique 12-byte Nonce Generated", detail: "Ensures fresh GCM initialization vector." },
  { title: "Step 10 / 22: AES-256-GCM Encryption", msg: "Plaintext ➔ AES-GCM Encrypted ➔ Ciphertext + Tag", detail: "Email body rendered unreadable." },
  { title: "Step 11 / 22: Dilithium Signing", msg: "Alice signs payload with Private Key 🔑", detail: "Generates digital signature for integrity." },
  { title: "Step 12 / 22: Network Transmission", msg: "Envelope Packet travels across simulated wire", detail: "Attacker inspects intercepted raw payload." },
  { title: "Step 13 / 22: Attacker View", msg: "Attacker sees scrambled hex payload only", detail: "Confidentiality preserved." },
  { title: "Step 14 / 22: Packet Arrives at Bob", msg: "Bob receives envelope packet from wire", detail: "Starts verification & decryption." },
  { title: "Step 15 / 22: Signature Verification", msg: "Bob verifies Dilithium signature using Alice PK", detail: "Authenticity & Integrity confirmed ✓." },
  { title: "Step 16 / 22: Kyber Decapsulation", msg: "Bob derives AES Key via Kyber decapsulation", detail: "AES Key reconstructed." },
  { title: "Step 17 / 22: AES-GCM Decryption", msg: "AES Decrypts Ciphertext + Validates Auth Tag", detail: "Authentication tag validated ✓." },
  { title: "Step 18 / 22: Message Recovered", msg: "'Top Secret Operation Details'", detail: "Original plaintext presented to Bob." },
  { title: "Step 19 / 22: Read Status Updated", msg: "Database marks email as read", detail: "Session inbox updated." },
  { title: "Step 20 / 22: Interceptor Wire Logged", msg: "Packet logged in Network Interceptor view", detail: "Wire log recorded." },
  { title: "Step 21 / 22: Audit Verification", msg: "System integrity verified clean", detail: "Zero errors detected." },
  { title: "Step 22 / 22: Transmission Complete", msg: "Post-Quantum Encrypted Communication Complete!", detail: "End-to-End Success 🎉" }
];

function updateStoryDisplay() {
  const step = storySteps[storyCurrentIndex];
  document.getElementById("story-step-num").textContent = step.title;
  document.getElementById("story-step-title").textContent = step.detail;
  document.getElementById("story-msg-box").textContent = step.msg;

  if (typeof gsap !== "undefined") {
    gsap.fromTo("#story-msg-box", { scale: 0.95, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });
  }
}

function toggleStoryPlay() {
  const btn = document.getElementById("btn-story-play");
  if (storyInterval) {
    clearInterval(storyInterval);
    storyInterval = null;
    btn.textContent = "▶ Play Story";
  } else {
    btn.textContent = "⏸ Pause Story";
    storyInterval = setInterval(() => {
      if (storyCurrentIndex < storySteps.length - 1) {
        storyCurrentIndex++;
        updateStoryDisplay();
      } else {
        clearInterval(storyInterval);
        storyInterval = null;
        btn.textContent = "▶ Play Story";
      }
    }, 2000 / storySpeed);
  }
}

function nextStoryStep() {
  if (storyCurrentIndex < storySteps.length - 1) {
    storyCurrentIndex++;
    updateStoryDisplay();
  }
}

function prevStoryStep() {
  if (storyCurrentIndex > 0) {
    storyCurrentIndex--;
    updateStoryDisplay();
  }
}

function changeStorySpeed() {
  const sel = document.getElementById("story-speed-select");
  storySpeed = parseFloat(sel.value);
  if (storyInterval) {
    toggleStoryPlay();
    toggleStoryPlay();
  }
}

// 9. Quick Quiz Module
const quizQuestions = [
  {
    q: "Which value should remain ONLY with Bob and never be shared?",
    opts: ["A. Public Key", "B. Kyber Ciphertext", "C. Private Key", "D. Nonce"],
    correct: 2,
    exp: "Correct! Bob's Private Key 🔑 must stay in Bob's secret vault."
  },
  {
    q: "Does the Shared Secret travel over the network from Alice to Bob?",
    opts: ["A. Yes, in cleartext", "B. Yes, encrypted", "C. No, it is derived independently at both ends"],
    correct: 2,
    exp: "Correct! Alice derives it during encapsulation and Bob decapsulates it using his Private Key."
  },
  {
    q: "What algorithm encrypts the actual Level 2 email body text in QuMail?",
    opts: ["A. Kyber-1024", "B. AES-256-GCM", "C. JWT", "D. Dilithium"],
    correct: 1,
    exp: "Correct! AES-256-GCM provides symmetric payload encryption."
  },
  {
    q: "What does Kyber (ML-KEM) do in QuMail?",
    opts: ["A. Encrypts the email body", "B. Establishes shared secret key material", "C. Signs the email", "D. Stores passphrases"],
    correct: 1,
    exp: "Correct! Kyber is a Key Encapsulation Mechanism (KEM)."
  },
  {
    q: "What is the critical rule for an AES-GCM Nonce?",
    opts: ["A. Must be kept secret", "B. Must never be reused with the same key", "C. Must be 100 bytes long"],
    correct: 1,
    exp: "Correct! Reusing a nonce with the same key destroys GCM security."
  }
];

function initQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  container.innerHTML = quizQuestions.map((q, qIdx) => `
    <div class="quiz-question-card" id="quiz-qcard-${qIdx}">
      <div class="quiz-q-title">Q${qIdx + 1}. ${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((opt, oIdx) => `
          <button class="quiz-option-btn" onclick="checkQuizAnswer(${qIdx}, ${oIdx})">${opt}</button>
        `).join("")}
      </div>
      <div class="quiz-exp" id="quiz-exp-${qIdx}" style="display:none; font-size: 0.85rem; margin-top: 0.5rem;"></div>
    </div>
  `).join("");
}

function checkQuizAnswer(qIdx, oIdx) {
  const q = quizQuestions[qIdx];
  const qcard = document.getElementById(`quiz-qcard-${qIdx}`);
  const buttons = qcard.querySelectorAll(".quiz-option-btn");
  const expBox = document.getElementById(`quiz-exp-${qIdx}`);

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) {
      btn.classList.add("correct");
    } else if (idx === oIdx) {
      btn.classList.add("incorrect");
    }
  });

  expBox.style.display = "block";
  if (oIdx === q.correct) {
    expBox.style.color = "var(--accent-emerald)";
    expBox.textContent = "✅ " + q.exp;
  } else {
    expBox.style.color = "var(--accent-rose)";
    expBox.textContent = "❌ Incorrect. " + q.exp;
  }
}

// 10. Sticky Sidebar ScrollSpy
function initScrollSpy() {
  const sections = document.querySelectorAll(".notes-section");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    sidebarLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}
