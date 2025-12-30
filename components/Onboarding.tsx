
import React, { useState } from 'react';

interface Props {
  onStart: () => void;
  onQuickTest: () => void;
}

const Onboarding: React.FC<Props> = ({ onStart, onQuickTest }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Como a IA ajuda no meu currículo?", a: "Nossa IA analisa o cargo desejado e otimiza seu resumo e experiências para destacar as palavras-chave que os recrutadores europeus buscam." },
    { q: "A IA altera meu currículo com fatos inexistentes?", a: "Não! A IA descreve suas experiências de forma mais profissional e impactante, utilizando verbos de ação e termos de mercado, mas sem inventar mentiras ou mudar a essência dos seus fatos." },
    { q: "O modelo Europass é aceito em todos os países?", a: "Sim, é o padrão oficial reconhecido pela União Europeia, ideal para Portugal, Espanha, Alemanha, entre outros." },
    { q: "Posso editar os textos gerados pela IA?", a: "Sim! No passo final de pré-visualização, você pode ativar a 'Edição Direta' e ajustar qualquer parágrafo manualmente." },
    { q: "Como funciona a foto 3x4?", a: "Recomendamos uma foto profissional com fundo neutro. O sistema ajusta automaticamente para o formato padrão de currículo europeu." },
    { q: "A carta de apresentação é mesmo necessária?", a: "Na Europa, a 'Cover Letter' é essencial. Nossa IA gera uma carta personalizada baseada no seu perfil e na vaga pretendida." },
    { q: "Meus dados estão seguros?", a: "Seus dados são usados apenas para a geração do documento e não são compartilhados com terceiros fora do ecossistema Workly." },
    { q: "O download em PDF mantém a formatação?", a: "Sim, utilizamos tecnologias de renderização de alta fidelidade para garantir que o PDF seja idêntico ao que você vê na tela." },
    { q: "Quais habilidades devo colocar?", a: "Foque em 'Hard Skills' (ferramentas e técnicas) e 'Soft Skills' (comportamento). A IA ajudará a organizar e profissionalizar a lista." },
    { q: "Como falar sobre meu nível de idiomas?", a: "Usamos o padrão CEFR (A1 até C2). Se não tiver certeza, a IA sugere o nível baseado no seu histórico e fluência relatada." }
  ];

  return (
    <div className="w-full max-w-4xl py-10 md:py-20 px-4 md:px-6">
      <div className="flex flex-col items-center text-center mb-12 md:mb-16">
        <div className="mb-4 md:mb-6 p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 animate-bounce">
          <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 tracking-tighter leading-tight">Currículo de Elite em Minutos</h1>
        <p className="text-base md:text-xl text-gray-500 mb-8 md:mb-10 max-w-xl">
          A ferramenta oficial da <strong>Workly</strong> para candidatos que buscam o mercado europeu. Otimizado por IA em apenas 3 passos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-16 md:mb-20 w-full sm:w-auto">
          <button onClick={onStart} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl hover:scale-105 active:scale-95 text-sm md:text-base">COMEÇAR AGORA</button>
          <button onClick={onQuickTest} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-indigo-600 border-2 border-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all text-sm md:text-base">✨ TESTE RÁPIDO</button>
        </div>

        {/* Manual Section */}
        <div className="w-full mb-16 md:mb-24">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-8 md:mb-10 uppercase tracking-widest text-center">Manual de Uso</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">1</span>
              <div className="text-2xl md:text-3xl mb-3 md:mb-4">👤</div>
              <h3 className="font-bold text-gray-800 mb-2">Identidade e Estilo</h3>
              <p className="text-xs md:text-sm text-gray-500">Insira seus dados básicos, nacionalidade e escolha um dos 3 layouts premium.</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">2</span>
              <div className="text-2xl md:text-3xl mb-3 md:mb-4">💼</div>
              <h3 className="font-bold text-gray-800 mb-2">Trajetória Real</h3>
              <p className="text-xs md:text-sm text-gray-500">Adicione suas experiências e educação. Descreva-as de forma simples; a IA cuidará do tom profissional.</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">3</span>
              <div className="text-2xl md:text-3xl mb-3 md:mb-4">⚡</div>
              <h3 className="font-bold text-gray-800 mb-2">Refino e Download</h3>
              <p className="text-xs md:text-sm text-gray-500">Revise as sugestões da IA, gere sua carta automática e baixe seu PDF de alta qualidade.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 md:mb-10 flex items-center gap-3">
            <span className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm md:text-lg font-black">?</span>
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 md:px-6 md:py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-700 text-sm md:text-base">{f.q}</span>
                  <svg className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6 text-xs md:text-sm text-gray-500 leading-relaxed animate-fadeIn">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="mt-16 md:mt-20 pt-8 md:pt-10 border-t text-center text-[10px] md:text-xs text-gray-400 font-bold tracking-widest uppercase">
        Workly AI CV Builder • Desenvolvido para Candidatos Workly • 2024
      </footer>
    </div>
  );
};

export default Onboarding;
