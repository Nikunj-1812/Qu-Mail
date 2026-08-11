import { SecurityLevel, EncryptedPayload } from './mail';

export interface InterceptedPacket {
  id: number;
  email: number | null;
  sender_username: string;
  recipient_username: string;
  security_level: SecurityLevel;
  raw_payload: EncryptedPayload;
  intercepted_at: string;
}

export interface GlossaryTerm {
  term: string;
  def: string;
  qumail: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}

export interface StoryStep {
  title: string;
  msg: string;
  detail: string;
}
