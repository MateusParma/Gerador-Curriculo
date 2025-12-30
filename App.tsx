
import React, { useState, useEffect } from 'react';
import { Step, CVData } from './types';
import CVForm from './components/CVForm';
import CVPreview from './components/CVPreview';
import Onboarding from './components/Onboarding';
import { generateCoverLetter, analyzeCV } from './geminiService';

const INITIAL_DATA: CVData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  nationality: '',
  profession: '',
  city: '',
  profilePhoto: '',
  summary: '',
  personalHistory: '',
  experiences: [],
  education: [],
  skills: [],
  qualities: [],
  languages: [],
  targetJob: '',
  layout: 'classic',
};

const MOCK_TEST_DATA: CVData = {
  fullName: 'Ricardo Oliveira Machado',
  email: 'ricardo.machado@email.com',
  phone: '+351 912 345 678',
  address: 'Avenida da Liberdade, 123',
  nationality: 'Brasileira',
  profession: 'Gerente de Operações Logísticas',
  city: 'Lisboa',
  profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=400',
  summary: 'Gestor de Operações com mais de 12 anos de experiência consolidada no setor automotivo e varejo em larga escala. Especialista na otimização de cadeias de suprimentos complexas e liderança de equipas multiculturais. Focado na redução de custos operacionais e implementação de sistemas ERP/WMS de última geração.',
  personalHistory: 'Minha jornada começou como ajudante de armazém no interior do Brasil, onde aprendi o valor da disciplina e da eficiência operacional. Com o tempo, essa paixão por processos me levou a multinacionais, onde liderei transformações digitais críticas. Mudei-me para Portugal com o objetivo de conectar minha vasta experiência em mercados emergentes com as demandas dinâmicas da logística europeia. Sou movido por resultados e pela construção de fluxos de trabalho que facilitem o dia a dia das equipes.',
  experiences: [
    {
      id: '1',
      company: 'Logística Global Portugal',
      role: 'Diretor de Operações',
      startDate: 'Jan 2018',
      endDate: 'Presente',
      description: 'Responsável pela gestão de 3 centros de distribuição nacionais e liderança de 150 colaboradores. Implementação de metodologia Lean que reduziu o tempo de expedição em 20%.',
      achievements: 'Redução de 12% nos custos de transporte no primeiro ano.'
    },
    {
      id: '2',
      company: 'AutoParts Brasil',
      role: 'Gerente de Logística',
      startDate: 'Mar 2012',
      endDate: 'Dez 2017',
      description: 'Gestão de inventário e coordenação de importações/exportações. Supervisão de frotas próprias e terceirizadas.',
      achievements: 'Digitalização de 100% dos processos de armazém.'
    }
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Universidade de Coimbra',
      degree: 'Mestrado em Gestão de Cadeia de Suprimentos',
      startDate: '2018',
      endDate: '2020'
    }
  ],
  skills: ['SAP S/4HANA', 'Gestão de Frotas', 'Metodologia Lean', 'Estratégia de Sourcing', 'Power BI'],
  qualities: ['Liderança Resiliente', 'Visão Estratégica', 'Negociação'],
  languages: [
    { name: 'Português', level: 'Nativo' },
    { name: 'Inglês', level: 'C1' },
    { name: 'Espanhol', level: 'B2' }
  ],
  targetJob: 'Head of Supply Chain',
  layout: 'europass',
  coverLetter: `Exmo.(a) Sr.(a) Responsável pela Seleção,\n\nÉ com grande entusiasmo que submeto a minha candidatura para a posição de Head of Supply Chain, conforme anunciado pela Workly. Com mais de 12 anos de experiência na gestão de cadeias de suprimentos complexas e um histórico comprovado de otimização operacional, estou confiante de que possuo as competências necessárias para agregar valor imediato à sua organização.\n\nAtualmente, como Diretor de Operações na Logística Global Portugal, gerencio três centros de distribuição nacionais e lidero uma equipe de 150 colaboradores. Durante o meu mandato, implementei metodologias Lean que resultaram numa redução de 20% no tempo de expedição e uma economia de 12% nos custos anuais de transporte. Minha experiência anterior na AutoParts Brasil também me permitiu digitalizar processos críticos, garantindo 100% de visibilidade de inventário através de sistemas ERP de última geração.\n\nMinha trajetória pessoal, iniciada como ajudante de armazém, concedeu-me uma visão holística e resiliente da logística. Entendo profundamente os desafios do "chão de fábrica" tanto quanto a importância das decisões estratégicas de alto nível. Mudei-me para Portugal precisamente para aplicar esta visão bicultural e adaptativa no mercado europeu, onde a eficiência e a agilidade são diferenciais competitivos.\n\nAcredito que minha combinação de competências técnicas em SAP S/4HANA e Power BI, aliada a uma liderança focada em resultados humanos e operacionais, faz de mim o candidato ideal para elevar o padrão da sua logística.\n\nEstou ansioso pela oportunidade de discutir como minha experiência pode contribuir para o sucesso contínuo da vossa empresa em uma entrevista.\n\nAtentamente,\nRicardo Oliveira Machado`,
  aiSuggestions: [
    { category: 'metric', text: 'Adicione mais números nas conquistas', reason: 'Recrutadores europeus focam em resultados mensuráveis.' },
    { category: 'keyword', text: 'Use termos como "Green Logistics"', reason: 'Sustentabilidade é uma tendência forte na Europa.' },
    { category: 'style', text: 'Mantenha o tom sóbrio do Europass', reason: 'A formalidade é valorizada em cargos de gerência.' },
    { category: 'impact', text: 'Destaque o Mestrado em Coimbra', reason: 'Educação em instituições locais gera confiança imediata.' }
  ]
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('onboarding');
  const [data, setData] = useState<CVData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingBubble, setIsFetchingBubble] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    if (uid) fetchBubbleData(uid);
  }, []);

  const fetchBubbleData = async (uid: string) => {
    setIsFetchingBubble(true);
    try {
      const response = await fetch(`https://workly-app.bubbleapps.io/api/1.1/obj/candidate/${uid}`);
      if (response.ok) {
        const json = await response.json();
        const b = json.response;
        handleUpdateData({
          fullName: b.full_name || '',
          email: b.email || '',
          phone: b.phone_number || '',
          address: b.location_string || '',
          nationality: b.nationality || '',
          profession: b.profession || '',
          city: b.city || '',
          summary: b.bio || '',
          targetJob: b.desired_role || '',
        });
      }
    } catch (error) {
      console.error("Erro Bubble:", error);
    } finally {
      setIsFetchingBubble(false);
    }
  };

  const handleUpdateData = (updates: Partial<CVData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleQuickTest = () => {
    // Agora o teste rápido é instantâneo e não usa IA
    setData(MOCK_TEST_DATA);
    setStep('preview');
  };

  const handleNext = async () => {
    if (step === 'onboarding') {
      setStep('step1');
      return;
    }

    if (step === 'step1') {
      setStep('step2');
      return;
    }

    if (step === 'step2') {
      setStep('step3');
      return;
    }

    if (step === 'step3') {
      setIsGenerating(true);
      try {
        const [coverLetter, suggestions] = await Promise.all([
          generateCoverLetter(data),
          analyzeCV(data)
        ]);
        handleUpdateData({ coverLetter, aiSuggestions: suggestions });
        setStep('preview');
      } catch (error) {
        console.error("Erro ao gerar conteúdo:", error);
        setStep('preview');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'step1') setStep('onboarding');
    if (step === 'step2') setStep('step1');
    if (step === 'step3') setStep('step2');
    if (step === 'preview') setStep('step3');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      {isFetchingBubble && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-600 font-bold">Sincronizando Workly...</p>
        </div>
      )}
      {step === 'onboarding' && <Onboarding onStart={handleNext} onQuickTest={handleQuickTest} />}
      {(step.startsWith('step')) && (
        <div className="w-full max-w-4xl px-4 py-8">
          <CVForm step={step as any} data={data} onUpdate={handleUpdateData} onNext={handleNext} onBack={handleBack} isGenerating={isGenerating} />
        </div>
      )}
      {step === 'preview' && <CVPreview data={data} onUpdate={handleUpdateData} onBack={handleBack} />}
    </div>
  );
};

export default App;
