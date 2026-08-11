import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'QuantumMail — Post-Quantum Encrypted Communication',
  description:
    'Simulated Kyber-1024 KEM + Dilithium + Real AES-256-GCM / OTP Encrypted Email Client',
};

const CRITICAL_CSS = `
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-surface: #ffffff;
  --bg-surface-hover: #f1f5f9;
  --border-color: #e2e8f0;
  --border-highlight: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --accent-cyan: #0284c7;
  --accent-blue: #2563eb;
  --accent-emerald: #059669;
  --accent-purple: #7c3aed;
  --accent-rose: #e11d48;
  --accent-amber: #d97706;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;
  --transition-fast: 0.15s ease;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
  line-height: 1.5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-primary { background: #0284c7; color: #ffffff; border-color: #0284c7; }
.btn-secondary { background: #ffffff; color: #0f172a; border-color: #e2e8f0; }
.btn-danger { background: #fff1f2; color: #e11d48; border-color: #ffe4e6; }
.btn-switch { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; background: #ffffff; color: #475569; border: 1px solid #e2e8f0; padding: 0.4rem 0.85rem; border-radius: 10px; font-size: 0.825rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-level-1 { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
.badge-level-2 { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
.badge-level-3 { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.container-app { max-width: 1360px; margin: 0 auto; padding: 1.5rem; }
.grid-main { display: grid; grid-template-columns: 310px 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 960px) { .grid-main { grid-template-columns: 1fr; } .container-app { padding: 1rem; } }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: 1 }}>{children}</main>
              <footer
                style={{
                  borderTop: '1px solid var(--border-color)',
                  padding: '1.25rem 1.5rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  background: '#ffffff',
                }}
              >
                QuantumMail Post-Quantum Cryptography Suite &bull; Kyber-1024 KEM &bull; Dilithium Signatures &bull; AES-256-GCM &bull; Quantum OTP
              </footer>
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
