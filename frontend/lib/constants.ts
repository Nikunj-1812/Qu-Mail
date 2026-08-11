import { SecurityLevel } from '@/types/mail';

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In production builds (when NEXT_PUBLIC_API_URL is not set), default
  // to the deployed backend URL so the frontend build can succeed.
  if (process.env.NODE_ENV === 'production') {
    return 'https://qu-mail.onrender.com';
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export interface SecurityLevelInfo {
  level: SecurityLevel;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export const SECURITY_LEVELS: SecurityLevelInfo[] = [
  {
    level: 1,
    name: 'Level 1: Standard Plaintext',
    shortName: 'Level 1 (Plaintext)',
    description: 'Unencrypted baseline transmission for visual wire audit comparison and testing.',
    color: '#0284c7',
  },
  {
    level: 2,
    name: 'Level 2: Kyber-1024 + AES-256 GCM',
    shortName: 'Level 2 (Kyber + AES)',
    description: 'Post-quantum ML-KEM Key Encapsulation with AES-256 GCM payload encryption and Dilithium signatures.',
    color: '#059669',
  },
  {
    level: 3,
    name: 'Level 3: Quantum One-Time Pad',
    shortName: 'Level 3 (Quantum OTP)',
    description: 'Information-theoretically secure One-Time Pad encryption with Dilithium digital authentication.',
    color: '#7c3aed',
  },
];

export const ANATOMY_PROPERTIES: Record<string, string> = {
  security_level: 'Indicates the cryptographic protocol used (1 = Plaintext, 2 = Kyber-1024 + AES-256, 3 = Quantum OTP).',
  body: 'The unencrypted message payload transmitted on the wire in Level 1 mode.',
  kyber_ciphertext: 'The 1568-byte ML-KEM-1024 encapsulated ciphertext containing the shared secret.',
  aes_ciphertext: 'The AES-256-GCM symmetric ciphertext encrypting the body and attachments.',
  nonce: '12-byte initialization vector (IV) for AES-256 GCM authenticated encryption.',
  sender_pk: 'The sender ML-DSA-87 (Dilithium5) public verification key.',
  signature: 'The digital signature over the ciphertext generated with Dilithium5 private key for message authentication.',
  otp_ciphertext: 'Hex-encoded ciphertext produced by XORing the plaintext with the One-Time Pad stream key.',
  otp_key_hex: 'Hex-encoded simulated Quantum Key Distribution (QKD) secret shared key.',
  version: 'Cryptographic envelope schema specification version.',
};
