
export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface AISuggestion {
  category: 'keyword' | 'metric' | 'impact' | 'style';
  text: string;
  reason: string;
}

export type CVLayout = 'classic' | 'europass' | 'modern';

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  profession: string;
  city: string;
  profilePhoto: string;
  summary: string;
  personalHistory: string; // Novo campo para a carta
  experiences: Experience[];
  education: Education[];
  skills: string[];
  qualities: string[];
  languages: Language[];
  targetJob: string;
  coverLetter?: string;
  aiSuggestions?: AISuggestion[];
  layout: CVLayout;
}

export type Step = 'onboarding' | 'step1' | 'step2' | 'step3' | 'preview';
