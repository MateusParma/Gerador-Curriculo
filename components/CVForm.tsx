
import React, { useState } from 'react';
import { Step, CVData, Experience, Education, Language, CVLayout } from '../types';
import { optimizeSummary } from '../geminiService';

interface Props {
  step: 'step1' | 'step2' | 'step3';
  data: CVData;
  onUpdate: (updates: Partial<CVData>) => void;
  onNext: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const LAYOUT_THUMBS = {
  classic: 'https://raw.githubusercontent.com/MateusParma/nexgenimages/main/curriculo%201.jpeg',
  europass: 'https://raw.githubusercontent.com/MateusParma/nexgenimages/main/Curriculo%202.jpeg',
  modern: 'https://raw.githubusercontent.com/MateusParma/nexgenimages/main/Curriculo%203.jpeg'
};

const CVForm: React.FC<Props> = ({ step, data, onUpdate, onNext, onBack, isGenerating }) => {
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ profilePhoto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAISummary = async () => {
    if (!data.summary) return;
    setLoadingAI('summary');
    try {
      const result = await optimizeSummary(data.summary, data.targetJob || 'profissional');
      onUpdate({ summary: result });
    } finally {
      setLoadingAI(null);
    }
  };

  const Step1 = () => (
    <div className="space-y-6 md:space-y-10">
      <div className="bg-indigo-50 p-4 md:p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-24 h-32 bg-white rounded-2xl border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden relative shrink-0">
          {data.profilePhoto ? <img src={data.profilePhoto} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-400 text-center px-2">Clique para Foto 3x4</span>}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-lg md:text-xl font-black text-indigo-900">Identidade & Estilo</h3>
          <p className="text-xs md:text-sm text-indigo-600/70">Começamos pelo básico e pelo visual do seu novo currículo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <input type="text" placeholder="Nome Completo" className="p-3 md:p-4 border rounded-2xl bg-gray-50 focus:bg-white transition-all outline-none text-sm md:text-base" value={data.fullName} onChange={e => onUpdate({ fullName: e.target.value })} />
        <input type="text" placeholder="Profissão (Ex: Gestor de Vendas)" className="p-3 md:p-4 border rounded-2xl bg-gray-50 focus:bg-white transition-all outline-none text-sm md:text-base" value={data.profession} onChange={e => onUpdate({ profession: e.target.value })} />
        <input type="text" placeholder="Nacionalidade" className="p-3 md:p-4 border rounded-2xl bg-gray-50 text-sm md:text-base" value={data.nationality} onChange={e => onUpdate({ nationality: e.target.value })} />
        <input type="text" placeholder="Cidade" className="p-3 md:p-4 border rounded-2xl bg-gray-50 text-sm md:text-base" value={data.city} onChange={e => onUpdate({ city: e.target.value })} />
        <input type="email" placeholder="Email" className="p-3 md:p-4 border rounded-2xl bg-gray-50 text-sm md:text-base" value={data.email} onChange={e => onUpdate({ email: e.target.value })} />
        <input type="tel" placeholder="Telefone" className="p-3 md:p-4 border rounded-2xl bg-gray-50 text-sm md:text-base" value={data.phone} onChange={e => onUpdate({ phone: e.target.value })} />
      </div>

      <div className="space-y-4">
        <h4 className="font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest text-center mb-4">Escolha o seu Layout</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {(['classic', 'europass', 'modern'] as CVLayout[]).map(l => (
            <button key={l} onClick={() => onUpdate({ layout: l })} className={`group relative flex flex-col items-center gap-2 p-2 border-2 rounded-2xl transition-all ${data.layout === l ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'border-gray-100 hover:border-indigo-200'}`}>
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:scale-[1.02]">
                <img src={LAYOUT_THUMBS[l]} alt={l} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest py-1">{l}</span>
              {data.layout === l && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6 md:space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg md:text-xl font-black text-gray-800">Experiência Profissional</h3>
          <button onClick={() => onUpdate({ experiences: [...data.experiences, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '', achievements: '' }] })} className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-[10px] md:text-xs font-bold w-full sm:w-auto hover:bg-indigo-200 transition-colors">+ ADICIONAR EXPERIÊNCIA</button>
        </div>
        <div className="space-y-4">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="p-4 md:p-6 border rounded-3xl bg-white shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <input placeholder="Empresa" className="p-3 border rounded-xl text-sm" value={exp.company} onChange={e => onUpdate({ experiences: data.experiences.map(ex => ex.id === exp.id ? {...ex, company: e.target.value} : ex) })} />
                <input placeholder="Cargo" className="p-3 border rounded-xl text-sm" value={exp.role} onChange={e => onUpdate({ experiences: data.experiences.map(ex => ex.id === exp.id ? {...ex, role: e.target.value} : ex) })} />
                <input placeholder="Início (Ex: Jan 2018)" className="p-3 border rounded-xl text-sm" value={exp.startDate} onChange={e => onUpdate({ experiences: data.experiences.map(ex => ex.id === exp.id ? {...ex, startDate: e.target.value} : ex) })} />
                <input placeholder="Fim (Ex: Presente)" className="p-3 border rounded-xl text-sm" value={exp.endDate} onChange={e => onUpdate({ experiences: data.experiences.map(ex => ex.id === exp.id ? {...ex, endDate: e.target.value} : ex) })} />
              </div>
              <textarea placeholder="Fale sobre suas responsabilidades (A IA vai melhorar depois)" className="w-full p-3 border rounded-xl text-sm h-24 resize-none" value={exp.description} onChange={e => onUpdate({ experiences: data.experiences.map(ex => ex.id === exp.id ? {...ex, description: e.target.value} : ex) })} />
              <button onClick={() => onUpdate({ experiences: data.experiences.filter(ex => ex.id !== exp.id) })} className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-600 transition-colors">Remover</button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg md:text-xl font-black text-gray-800">Educação</h3>
          <button onClick={() => onUpdate({ education: [...data.education, { id: Date.now().toString(), institution: '', degree: '', startDate: '', endDate: '' }] })} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] md:text-xs font-bold w-full sm:w-auto hover:bg-gray-200 transition-colors">+ ADICIONAR EDUCAÇÃO</button>
        </div>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="p-4 md:p-6 border rounded-3xl bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <input placeholder="Instituição" className="p-3 border rounded-xl text-sm" value={edu.institution} onChange={e => onUpdate({ education: data.education.map(ed => ed.id === edu.id ? {...ed, institution: e.target.value} : ed) })} />
                <input placeholder="Curso / Grau" className="p-3 border rounded-xl text-sm" value={edu.degree} onChange={e => onUpdate({ education: data.education.map(ed => ed.id === edu.id ? {...ed, degree: e.target.value} : ed) })} />
              </div>
              <button onClick={() => onUpdate({ education: data.education.filter(ed => ed.id !== edu.id) })} className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Remover</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6 md:space-y-10">
      <div className="bg-indigo-600 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-widest">Estratégia de Perfil (CV)</h3>
          <button onClick={handleAISummary} disabled={loadingAI === 'summary' || !data.summary} className="w-full sm:w-auto text-xs bg-white text-indigo-600 px-4 py-2 rounded-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {loadingAI === 'summary' ? 'PROCESSANDO...' : '✨ OTIMIZAR IA'}
          </button>
        </div>
        <textarea placeholder="Escreva um breve resumo de sua carreira para o currículo..." className="w-full p-4 rounded-2xl bg-indigo-700/50 border border-indigo-400 text-white placeholder-indigo-300 h-24 focus:bg-indigo-700 transition-all outline-none mb-6 resize-none" value={data.summary} onChange={e => onUpdate({ summary: e.target.value })} />
        
        <h3 className="text-lg md:text-xl font-black uppercase tracking-widest mb-4">Sua História (Para a Carta)</h3>
        <textarea 
          placeholder="Conte um pouco sobre sua trajetória pessoal, motivações e o que te faz o candidato ideal. Isso será usado para criar uma carta de apresentação humana e persuasiva." 
          className="w-full p-4 rounded-2xl bg-indigo-700/50 border border-indigo-400 text-white placeholder-indigo-300 h-32 focus:bg-indigo-700 transition-all outline-none resize-none" 
          value={data.personalHistory} 
          onChange={e => onUpdate({ personalHistory: e.target.value })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4">
          <h4 className="font-black text-gray-800">Vaga Pretendida</h4>
          <input type="text" placeholder="Ex: Head of Supply Chain" className="w-full p-4 border rounded-2xl text-sm font-bold bg-gray-50 focus:bg-white outline-none" value={data.targetJob} onChange={e => onUpdate({ targetJob: e.target.value })} />
          
          <h4 className="font-black text-gray-800 mt-4">Habilidades Técnicas</h4>
          <input type="text" placeholder="Ex: React, Vendas B2B, Gestão Financeira..." className="w-full p-4 border rounded-2xl text-sm bg-gray-50 focus:bg-white outline-none" value={data.skills.join(', ')} onChange={e => onUpdate({ skills: e.target.value.split(',').map(s => s.trim()) })} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-gray-800">Idiomas</h4>
            <button onClick={() => onUpdate({ languages: [...data.languages, { name: '', level: 'B2' }] })} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Adicionar</button>
          </div>
          <div className="space-y-2">
            {data.languages.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Idioma" className="flex-1 p-3 border rounded-xl text-sm bg-gray-50 focus:bg-white" value={l.name} onChange={e => {
                  const nl = [...data.languages]; nl[i].name = e.target.value; onUpdate({ languages: nl });
                }} />
                <select className="p-3 border rounded-xl text-xs font-bold bg-gray-50" value={l.level} onChange={e => {
                  const nl = [...data.languages]; nl[i].level = e.target.value; onUpdate({ languages: nl });
                }}>
                  <option>Nativo</option><option>C2</option><option>C1</option><option>B2</option><option>B1</option><option>A2</option><option>A1</option>
                </select>
                <button onClick={() => onUpdate({ languages: data.languages.filter((_, idx) => idx !== i) })} className="p-2 text-red-300 hover:text-red-500">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {isGenerating && (
        <div className="py-10 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-indigo-600 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <p className="font-black text-indigo-600 uppercase tracking-widest text-xs md:text-sm text-center px-4 leading-relaxed">Nossa IA está unindo suas experiências, habilidades e história para criar um currículo e uma carta de apresentação de elite...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex gap-1.5 md:gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${step === `step${s}` ? 'bg-indigo-600 w-12 md:w-24' : 'bg-gray-100 w-6 md:w-12'}`}></div>
          ))}
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest">PASSO {step.slice(-1)} / 3</span>
      </div>

      <div className="min-h-[400px] md:min-h-[500px]">
        {step === 'step1' && <Step1 />}
        {step === 'step2' && <Step2 />}
        {step === 'step3' && <Step3 />}
      </div>

      <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-between">
        <button onClick={onBack} className="w-full sm:w-auto px-8 py-3 text-gray-400 font-black tracking-widest uppercase text-[10px] md:text-xs hover:text-gray-600 transition-colors">Anterior</button>
        <button onClick={onNext} className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs md:text-sm shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          {step === 'step3' ? (isGenerating ? 'AGUARDE...' : 'GERAR CURRÍCULO') : 'PRÓXIMO PASSO'}
        </button>
      </div>
    </div>
  );
};

export default CVForm;
