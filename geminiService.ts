
import { GoogleGenAI, Type } from "@google/genai";
import { CVData, AISuggestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const optimizeSummary = async (prompt: string, targetJob: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Com base no seguinte comando/texto do usuário: "${prompt}", gere um resumo profissional de alto impacto para a vaga de "${targetJob}". 
    Use o estilo de CV Europeu (Europass). 
    Regras: 
    - Seja extremamente profissional.
    - Foque em valor entregue e competências.
    - Máximo de 4 frases.
    - Idioma: Português.
    - Não use introduções como "Aqui está o resumo", retorne apenas o texto do resumo.`,
  });
  return response.text;
};

export const improveExperienceText = async (description: string, role: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Melhore o seguinte texto de experiência profissional para o cargo de "${role}". 
    Mantenha a veracidade dos fatos mas use uma linguagem mais executiva, focada em resultados e verbos de ação.
    Retorne apenas o texto melhorado em Português.
    Texto original: "${description}"`,
  });
  return response.text;
};

export const improveSkillsText = async (skills: string[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Dada a seguinte lista de habilidades: "${skills.join(', ')}", organize-as e reescreva-as de forma mais profissional para um currículo europeu. 
    Mantenha as competências originais mas use termos técnicos padrão de mercado. 
    Retorne apenas as habilidades separadas por vírgula em Português.`,
  });
  return response.text;
};

export const generateCoverLetter = async (data: CVData) => {
  const experiencesStr = data.experiences.map(e => `${e.role} na ${e.company} (${e.description})`).join('; ');
  const skillsStr = data.skills.join(', ');
  
  const prompt = `Atue como um redator profissional de carreiras especializado no mercado Europeu. Escreva uma carta de apresentação (Cover Letter) completa, elegante e persuasiva de aproximadamente uma página para:
  
  Candidato: ${data.fullName}
  Vaga Alvo: ${data.targetJob}
  História Pessoal/Contexto: ${data.personalHistory || 'Não fornecido'}
  Experiências principais: ${experiencesStr}
  Principais competências: ${skillsStr}
  
  Diretrizes de redação:
  1. Estrutura Formal: Local e Data, Saudação, Introdução impactante, 2 a 3 parágrafos de desenvolvimento (conectando experiências com a vaga), 1 parágrafo sobre a motivação pessoal (usando a história fornecida) e Fechamento com chamada para ação.
  2. Tom: Profissional, confiante e sóbrio. Evite clichês e exageros.
  3. Adaptação Europeia: Mostre conhecimento sobre a importância da adaptação cultural e entrega de resultados.
  4. Linguagem: Português formal.
  
  Importante: Retorne apenas o corpo da carta, pronta para ser assinada. Não inclua comentários adicionais.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text;
};

export const analyzeCV = async (data: CVData): Promise<AISuggestion[]> => {
  const prompt = `Analise este currículo para o mercado Europeu (vaga: ${data.targetJob}). 
  Forneça exatamente 4 sugestões de melhoria focadas em: palavras-chave do setor, métricas de sucesso, impacto e formatação.
  IMPORTANTE: Todo o texto deve estar estritamente em Português.
  
  Retorne unicamente um JSON array de objetos: { "category": "keyword"|"metric"|"impact"|"style", "text": "sugestão", "reason": "motivo" }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            text: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ['category', 'text', 'reason']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};
