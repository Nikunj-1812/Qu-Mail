import { User } from './auth';

export type SecurityLevel = 1 | 2 | 3;

export interface EncryptedEmailListItem {
  id: number;
  sender: User;
  recipient: User;
  security_level: SecurityLevel;
  subject: string;
  timestamp: string;
  is_read: boolean;
}

export interface EncryptedPayload {
  security_level: SecurityLevel;
  body?: string;
  kyber_ciphertext?: string;
  aes_ciphertext?: string;
  nonce?: string;
  sender_pk?: string;
  signature?: string;
  otp_ciphertext?: string;
  otp_key_hex?: string;
  [key: string]: any;
}

export interface EncryptedEmailDetail {
  id: number;
  sender: User;
  recipient: User;
  security_level: SecurityLevel;
  subject: string;
  encrypted_payload: EncryptedPayload;
  decrypted_body: string;
  timestamp: string;
  is_read: boolean;
}

export interface ComposePayload {
  recipient_username: string;
  subject: string;
  body: string;
  security_level: SecurityLevel;
  passphrase?: string;
}
