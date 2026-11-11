export interface SaoProfile {
  orgName: string;
  district?: string;
  province?: string;
  websiteUrl?: string;
  facebookPage?: string;
  address?: string;
  phone?: string;
  emergencyPhone?: string;
  workHours?: string;
  vision?: string;
  updatedAt?: string;
}

export interface Executive {
  id: string;
  name: string;
  position: string;
  department?: string;
  phone?: string;
  bio?: string;
  order?: number;
  updatedAt?: string;
}

export interface PrPost {
  id: string;
  title: string;
  content: string;
  category?: string;
  tone?: string;
  hashtags?: string;
  status?: 'draft' | 'ready' | 'posted';
  createdAt?: string;
  updatedAt?: string;
  imageAdvice?: string;
}

export interface KnowledgeItem {
  id: string;
  topic: string;
  category?: string;
  question?: string;
  answer: string;
  keywords?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isVoice?: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface GeneratedPostResult {
  headline: string;
  body: string;
  highlights: string[];
  callToAction: string;
  hashtags: string;
  fullPostText: string;
  imageAdvice: string;
}
