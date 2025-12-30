
import React, { useRef, useState, useEffect } from 'react';
import { CVData, Experience, Education } from '../types';
import { improveExperienceText, improveSkillsText } from '../geminiService';

interface Props {
  data: CVData;
  onUpdate: (updates: Partial<CVData>) => void;
  onBack: () => void;
}

const CVPreview: React.FC<Props> = ({ data, onUpdate, onBack }) => {
  const cvRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const [isEditing, setIsEditing] = useState(false);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [mobileScale, setMobileScale] = useState(1);

  // Constantes de proporção A4 em pixels (96 DPI padrão)
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  useEffect(() => {
    const calculateScale = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        const availableWidth = screenWidth - 40; // Margem de 20px de cada lado
        // A escala deve ser baseada na largura real do A4 (794px)
        setMobileScale(availableWidth / A4_WIDTH);
      } else {
        setMobileScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const downloadPDF = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    const { jsPDF } = (window as any).jspdf;
    
    const canvas = await (window as any).html2canvas(ref.current, { 
      scale: 3, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * { 
            letter-spacing: 0.05em !important; 
            word-spacing: 0.1em !important;
            font-variant-ligatures: none !important;
            font-kerning: none !important;
            text-rendering: auto !important;
            -webkit-font-smoothing: antialiased !important;
            font-feature-settings: "kern" 0, "liga" 0 !important;
          }
          p, span, h1, h2, h3, div, li {
            line-height: 2.3 !important;
          }
          .user-name {
            letter-spacing: 0.15em !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    const safeName = data.fullName.trim().replace(/\s+/g, '_') || 'Candidato';
    pdf.save(`${safeName}_${filename}.pdf`);
  };

  const handleImproveExp = async (id: string, currentText: string, role: string) => {
    setImprovingId(id);
    try {
      const improved = await improveExperienceText(currentText, role);
      const newExps = data.experiences.map(ex => ex.id === id ? { ...ex, description: improved } : ex);
      onUpdate({ experiences: newExps });
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingId(null);
    }
  };

  const handleImproveSkills = async () => {
    setImprovingId('skills');
    try {
      const improved = await improveSkillsText(data.skills);
      onUpdate({ skills: improved.split(',').map(s => s.trim()) });
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingId(null);
    }
  };

  const renderInput = (value: string, onChange: (val: string) => void, className: string, placeholder?: string, isTextArea = false) => {
    if (!isEditing) return <span className={className}>{value || placeholder}</span>;
    
    if (isTextArea) {
      return (
        <textarea
          className={`${className} w-full bg-indigo-50/50 border-b border-indigo-200 outline-none focus:bg-white transition-all resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      );
    }

    return (
      <input
        type="text"
        className={`${className} w-full bg-indigo-50/50 border-b border-indigo-200 outline-none focus:bg-white transition-all`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };

  const textBodyClass = "leading-[2.2] tracking-[0.05em] text-left whitespace-pre-wrap break-words";
  const titleClass = "tracking-[0.1em] leading-tight font-bold user-name";

  const LayoutEuropass = () => (
    <div ref={cvRef} className="w-[794px] min-h-[1123px] bg-white flex flex-col text-[#333] p-0 font-sans overflow-hidden shrink-0">
      <div className="bg-[#003366] text-white p-12 flex items-center justify-between border-b-[6px] border-blue-400">
        <div className="flex-1">
          <div className="flex items-center gap-8">
             <div className="w-24 h-32 bg-white rounded-lg overflow-hidden border-2 border-white/50 shrink-0 shadow-lg">
              {data.profilePhoto && <img src={data.profilePhoto} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              {renderInput(data.fullName, (v) => onUpdate({ fullName: v }), `text-xl ${titleClass} uppercase block`)}
              {renderInput(data.profession || data.targetJob, (v) => onUpdate({ profession: v }), "text-sm block opacity-90 mt-1 font-bold tracking-[0.05em]")}
              <div className="flex gap-4 mt-2 text-[8px] opacity-80 font-medium tracking-[0.1em]">
                {renderInput(data.nationality, (v) => onUpdate({ nationality: v }), "")}
                <span>•</span>
                {renderInput(data.city, (v) => onUpdate({ city: v }), "")}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-black tracking-widest opacity-20 uppercase">Europass</div>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-60 bg-gray-50 p-10 border-r border-gray-100 space-y-12 shrink-0">
          <section>
            <h3 className="text-[9px] font-black text-blue-800 uppercase border-b-2 border-blue-100 mb-4 pb-1 tracking-[0.1em]">Contatos</h3>
            <div className="space-y-4 text-[9px] font-medium text-gray-600 leading-[2.2] tracking-[0.05em]">
              <div className="flex items-start gap-2">📧 {renderInput(data.email, (v) => onUpdate({ email: v }), "flex-1 break-all")}</div>
              <div className="flex items-center gap-2">📞 {renderInput(data.phone, (v) => onUpdate({ phone: v }), "flex-1")}</div>
              <div className="flex items-start gap-2">📍 {renderInput(data.address, (v) => onUpdate({ address: v }), "flex-1")}</div>
            </div>
          </section>
          <section>
            <div className="flex justify-between items-center border-b-2 border-blue-100 mb-4 pb-1">
              <h3 className="text-[9px] font-black text-blue-800 uppercase tracking-[0.1em]">Habilidades</h3>
              {isEditing && (
                <button onClick={handleImproveSkills} disabled={improvingId === 'skills'} className="text-[7px] font-bold text-blue-600">✨ IA</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <textarea className="w-full text-[8px] p-2 bg-indigo-50 border border-indigo-100 rounded" value={data.skills.join(', ')} onChange={(e) => onUpdate({ skills: e.target.value.split(',').map(s => s.trim()) })} />
              ) : (
                data.skills.map(s => <span key={s} className="px-2 py-1 bg-white border border-gray-200 rounded text-[8px] font-bold text-gray-700 tracking-[0.05em]">{s}</span>)
              )}
            </div>
          </section>
          <section>
            <h3 className="text-[9px] font-black text-blue-800 uppercase border-b-2 border-blue-100 mb-4 pb-1 tracking-[0.1em]">Idiomas</h3>
            {data.languages.map((l, idx) => (
              <div key={idx} className="text-[9px] mb-3 flex flex-col gap-1 tracking-[0.05em]">
                <div className="flex justify-between">
                  {renderInput(l.name, (v) => { const nl = [...data.languages]; nl[idx].name = v; onUpdate({ languages: nl }); }, "font-bold text-gray-700")}
                  {renderInput(l.level, (v) => { const nl = [...data.languages]; nl[idx].level = v; onUpdate({ languages: nl }); }, "text-blue-600 font-black")}
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="flex-1 p-10 space-y-12 overflow-hidden">
          <section>
            <h3 className="text-base font-black text-blue-900 border-b-2 border-blue-50 mb-6 pb-2 tracking-[0.1em]">Perfil</h3>
            <p className={`text-[11px] text-gray-700 ${textBodyClass}`}>
              {renderInput(data.summary, (v) => onUpdate({ summary: v }), "", "Resumo profissional...", true)}
            </p>
          </section>
          <section>
            <h3 className="text-base font-black text-blue-900 border-b-2 border-blue-50 mb-6 pb-2 tracking-[0.1em]">Experiência Profissional</h3>
            <div className="space-y-10">
              {data.experiences.map((exp, idx) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-blue-100">
                   <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex justify-between items-start mb-2">
                    {renderInput(exp.role, (v) => { const ne = [...data.experiences]; ne[idx].role = v; onUpdate({ experiences: ne }); }, `font-bold text-gray-800 text-sm uppercase flex-1 tracking-[0.05em]`)}
                    <div className="flex gap-1 ml-4 shrink-0 tracking-[0.1em]">
                      {renderInput(exp.startDate, (v) => { const ne = [...data.experiences]; ne[idx].startDate = v; onUpdate({ experiences: ne }); }, "text-[8px] font-black text-blue-600")}
                      <span className="text-[8px] text-blue-300">-</span>
                      {renderInput(exp.endDate, (v) => { const ne = [...data.experiences]; ne[idx].endDate = v; onUpdate({ experiences: ne }); }, "text-[8px] font-black text-blue-600")}
                    </div>
                  </div>
                  {renderInput(exp.company, (v) => { const ne = [...data.experiences]; ne[idx].company = v; onUpdate({ experiences: ne }); }, "text-[9px] font-bold text-blue-800 mb-3 block tracking-[0.05em]")}
                  <div className="relative group">
                    <p className={`text-[10px] text-gray-600 ${textBodyClass}`}>
                       {renderInput(exp.description, (v) => { const ne = [...data.experiences]; ne[idx].description = v; onUpdate({ experiences: ne }); }, "", "Descreva suas atividades...", true)}
                    </p>
                    {isEditing && (
                      <button onClick={() => handleImproveExp(exp.id, exp.description, exp.role)} className="absolute right-0 bottom-0 translate-y-full bg-blue-600 text-white text-[7px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">Melhorar IA</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const LayoutClassic = () => (
    <div ref={cvRef} className="w-[794px] min-h-[1123px] bg-white flex text-[#2c3e50] p-0 font-sans relative overflow-hidden shrink-0">
      <div className="w-64 bg-[#f4f7f9] flex flex-col p-10 gap-10 shrink-0 h-full min-h-[1123px]">
        <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden mx-auto shadow-xl relative shrink-0">
          {data.profilePhoto ? <img src={data.profilePhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100" />}
        </div>
        <section>
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 mb-4 pb-1 text-center">Contatos</h3>
          <div className="space-y-4 text-center leading-[2.2] tracking-[0.05em]">
            {renderInput(data.email, (v) => onUpdate({ email: v }), "text-[9px] font-bold text-gray-600 block break-all")}
            {renderInput(data.phone, (v) => onUpdate({ phone: v }), "text-[9px] font-bold text-gray-600 block")}
            <div className="mt-4">
              {renderInput(data.address, (v) => onUpdate({ address: v }), "text-[8px] text-gray-400 block")}
              {renderInput(data.city, (v) => onUpdate({ city: v }), "text-[8px] text-gray-400 block")}
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center border-b-2 border-blue-100 mb-4 pb-1">Habilidades</h3>
          {isEditing ? (
            <textarea className="w-full text-[8px] p-2 border rounded" value={data.skills.join(', ')} onChange={e => onUpdate({ skills: e.target.value.split(',').map(s => s.trim()) })} />
          ) : (
            <ul className="space-y-3">
              {data.skills.map(s => <li key={s} className="text-[9px] flex items-center gap-2 text-gray-600 font-medium tracking-[0.05em]"><span className="w-1 h-1 bg-blue-400 rounded-full shrink-0"></span> {s}</li>)}
            </ul>
          )}
        </section>
      </div>
      <div className="flex-1 p-14 flex flex-col bg-white overflow-hidden">
        <div className="mb-12 border-b-4 border-gray-50 pb-8">
          {renderInput(data.fullName, (v) => onUpdate({ fullName: v }), `text-3xl font-black text-gray-900 block mb-1 tracking-[0.1em] user-name`)}
          {renderInput(data.profession || data.targetJob, (v) => onUpdate({ profession: v }), "text-lg font-semibold text-blue-500 uppercase tracking-widest block")}
        </div>
        <section className="mb-12">
          <h3 className="text-[9px] font-black uppercase text-gray-300 mb-4 tracking-widest flex items-center gap-4">RESUMO <span className="h-px bg-gray-100 flex-1"></span></h3>
          <p className={`text-[11px] text-gray-600 font-medium block ${textBodyClass}`}>
            {renderInput(data.summary, (v) => onUpdate({ summary: v }), "", "Resumo...", true)}
          </p>
        </section>
        <section>
          <h3 className="text-[9px] font-black uppercase text-gray-300 mb-8 tracking-widest flex items-center gap-4">EXPERIÊNCIA <span className="h-px bg-gray-100 flex-1"></span></h3>
          <div className="space-y-10">
            {data.experiences.map((exp, idx) => (
              <div key={exp.id} className="flex gap-8">
                <div className="w-24 text-[8px] font-black text-gray-400 uppercase pt-1 shrink-0 leading-tight tracking-[0.05em]">
                  {renderInput(exp.startDate, (v) => { const ne = [...data.experiences]; ne[idx].startDate = v; onUpdate({ experiences: ne }); }, "block")}
                  <span className="block my-1 text-blue-200">/</span>
                  {renderInput(exp.endDate, (v) => { const ne = [...data.experiences]; ne[idx].endDate = v; onUpdate({ experiences: ne }); }, "block")}
                </div>
                <div className="flex-1">
                  {renderInput(exp.role, (v) => { const ne = [...data.experiences]; ne[idx].role = v; onUpdate({ experiences: ne }); }, `font-bold text-gray-800 text-base uppercase mb-1 block leading-snug tracking-[0.05em]`)}
                  {renderInput(exp.company, (v) => { const ne = [...data.experiences]; ne[idx].company = v; onUpdate({ experiences: ne }); }, "text-[10px] font-bold text-blue-600 mb-3 block tracking-[0.05em]")}
                  <p className={`text-[10px] text-gray-500 ${textBodyClass} block`}>
                    {renderInput(exp.description, (v) => { const ne = [...data.experiences]; ne[idx].description = v; onUpdate({ experiences: ne }); }, "", "Descrição...", true)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const LayoutModern = () => (
    <div ref={cvRef} className="w-[794px] min-h-[1123px] bg-white flex flex-col text-[#333] p-0 font-sans shadow-inner overflow-hidden shrink-0">
      <div className="bg-[#f8fafc] p-12 flex items-center gap-10 border-b-2 border-gray-100">
        <div className="w-36 h-36 rounded-2xl rotate-2 border-4 border-white shadow-xl overflow-hidden shrink-0">
          {data.profilePhoto && <img src={data.profilePhoto} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1">
          {renderInput(data.fullName, (v) => onUpdate({ fullName: v }), `text-3xl font-black text-gray-900 leading-none block mb-3 user-name`)}
          <div className="h-1.5 w-24 bg-indigo-600 rounded-full mb-4"></div>
          {renderInput(data.profession || data.targetJob, (v) => onUpdate({ profession: v }), "text-lg text-indigo-600 font-bold uppercase tracking-widest block")}
        </div>
      </div>
      <div className="flex flex-1 p-12 gap-12">
        <div className="flex-[1.6] space-y-12 overflow-hidden">
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-4 tracking-[0.05em]">Perfil</h3>
            <div className="border-l-4 border-indigo-100 pl-6 italic">
              <p className={`text-[12px] text-gray-500 ${textBodyClass}`}>
                 {renderInput(data.summary, (v) => onUpdate({ summary: v }), "", "Resumo...", true)}
              </p>
            </div>
          </section>
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-8 tracking-[0.05em]">Jornada</h3>
            <div className="space-y-10">
              {data.experiences.map((exp, idx) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-3">
                    {renderInput(exp.role, (v) => { const ne = [...data.experiences]; ne[idx].role = v; onUpdate({ experiences: ne }); }, `font-bold text-gray-800 text-base uppercase flex-1 leading-tight tracking-[0.05em]`)}
                    <div className="flex gap-1 ml-4 shrink-0 font-bold tracking-[0.1em]">
                      {renderInput(exp.startDate, (v) => { const ne = [...data.experiences]; ne[idx].startDate = v; onUpdate({ experiences: ne }); }, "text-[9px] text-indigo-200 uppercase")}
                      <span className="text-[9px] text-indigo-100">-</span>
                      {renderInput(exp.endDate, (v) => { const ne = [...data.experiences]; ne[idx].endDate = v; onUpdate({ experiences: ne }); }, "text-[9px] text-indigo-200 uppercase")}
                    </div>
                  </div>
                  {renderInput(exp.company, (v) => { const ne = [...data.experiences]; ne[idx].company = v; onUpdate({ experiences: ne }); }, "text-[10px] font-black text-indigo-400 mb-3 block tracking-[0.05em]")}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className={`text-[11px] text-gray-500 ${textBodyClass}`}>
                      {renderInput(exp.description, (v) => { const ne = [...data.experiences]; ne[idx].description = v; onUpdate({ experiences: ne }); }, "", "Atividades...", true)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="flex-1 space-y-10 shrink-0 overflow-hidden">
          <section className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-4">Contato</h3>
            <div className="space-y-4 text-[9px] font-bold leading-[2.2] tracking-[0.05em]">
              <div className="flex flex-col gap-1">
                <span className="text-[7px] opacity-40 uppercase tracking-widest">Email</span>
                {renderInput(data.email, (v) => onUpdate({ email: v }), "break-all")}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[7px] opacity-40 uppercase tracking-widest">Telefone</span>
                {renderInput(data.phone, (v) => onUpdate({ phone: v }), "")}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[7px] opacity-40 uppercase tracking-widest">Local</span>
                <div className="flex flex-wrap gap-1">
                  {renderInput(data.city, (v) => onUpdate({ city: v }), "")}
                  <span>,</span>
                  {renderInput(data.nationality, (v) => onUpdate({ nationality: v }), "")}
                </div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <textarea className="w-full text-[8px] p-2 border rounded-xl" value={data.skills.join(', ')} onChange={e => onUpdate({ skills: e.target.value.split(',').map(s => s.trim()) })} />
              ) : (
                data.skills.map(s => <span key={s} className="px-2 py-1 bg-white border border-gray-100 text-[8px] rounded-lg font-bold uppercase text-gray-700 shadow-sm tracking-[0.05em]">{s}</span>)
              )}
            </div>
          </section>
           <section>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-4">Educação</h3>
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="mb-4 tracking-[0.05em]">
                {renderInput(edu.degree, (v) => { const ne = [...data.education]; ne[idx].degree = v; onUpdate({ education: ne }); }, "text-[10px] font-black text-gray-800 leading-snug uppercase block")}
                {renderInput(edu.institution, (v) => { const ne = [...data.education]; ne[idx].institution = v; onUpdate({ education: ne }); }, "text-[9px] text-gray-400 font-bold block mt-1")}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar - Desktop Lateral, Mobile Topo */}
      <div className="w-full md:w-80 bg-white p-6 md:p-8 md:h-screen md:sticky md:top-0 overflow-y-auto no-print shadow-xl z-20 shrink-0">
        <div className="flex items-center gap-2 mb-6 md:mb-8 justify-center md:justify-start">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic">W</div>
          <h2 className="text-xl font-black text-gray-800 tracking-tighter">Workly AI</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          <button onClick={() => setIsEditing(!isEditing)} className={`w-full py-3 md:py-4 rounded-xl border-2 transition-all font-black flex items-center justify-center gap-2 text-[10px] md:text-sm ${isEditing ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'border-gray-100 text-gray-600 hover:border-indigo-100'}`}>
            {isEditing ? <>SALVAR</> : <>EDITAR</>}
          </button>

          <button onClick={() => downloadPDF(activeTab === 'cv' ? cvRef : letterRef, activeTab === 'cv' ? 'Curriculo' : 'Carta') } className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-xl font-black shadow-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all text-[10px] md:text-sm">
            BAIXAR PDF
          </button>
        </div>
        
        <button onClick={onBack} className="w-full py-4 mt-2 text-[9px] text-gray-400 uppercase font-black hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
          ← Voltar ao Formulário
        </button>

        <div className="hidden md:block mt-8 pt-6 border-t border-gray-50">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 block">Dicas Workly</label>
          <div className="space-y-4">
            {data.aiSuggestions?.map((s, i) => (
              <div key={i} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <p className="text-xs font-bold text-gray-700 mb-1 tracking-[0.05em]">{s.text}</p>
                <p className="text-[9px] text-gray-400 italic leading-tight tracking-[0.05em]">{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center bg-[#fafafa]">
        {/* Tab Switcher */}
        <div className="sticky top-0 w-full z-10 bg-[#fafafa]/80 backdrop-blur-md p-4 flex justify-center no-print">
          <div className="flex bg-white p-1 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm sm:max-w-md">
            <button onClick={() => setActiveTab('cv')} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'cv' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Currículo</button>
            <button onClick={() => setActiveTab('letter')} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === 'letter' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Carta</button>
          </div>
        </div>

        {/* Scaled Preview Area - Ajustada para não comprimir o layout */}
        <div className="w-full flex justify-center p-0 md:p-12 pb-20 overflow-visible">
          <div 
            className="transition-all duration-300 origin-top shadow-2xl flex justify-center bg-white"
            style={{ 
              width: `${A4_WIDTH * mobileScale}px`, 
              height: `${A4_HEIGHT * mobileScale}px`,
              // No mobile, a largura visual ocupada é exatamente o que calculamos.
              // O elemento interno mantém seus 794px e a escala ajusta a aparência.
            }}
          >
            <div 
              style={{
                transform: `scale(${mobileScale})`,
                transformOrigin: 'top center',
                width: `${A4_WIDTH}px`,
                height: `${A4_HEIGHT}px`,
              }}
              className="shrink-0"
            >
              {activeTab === 'cv' ? (
                <div className="w-[794px] min-h-[1123px] overflow-hidden">
                  {data.layout === 'europass' && <LayoutEuropass />}
                  {data.layout === 'classic' && <LayoutClassic />}
                  {data.layout === 'modern' && <LayoutModern />}
                </div>
              ) : (
                <div ref={letterRef} className="w-[794px] min-h-[1123px] bg-white p-16 md:p-24 text-gray-800 overflow-hidden shrink-0">
                  <div className="flex justify-between mb-12">
                    <div className="flex-1">
                      {renderInput(data.fullName, (v) => onUpdate({ fullName: v }), "text-3xl font-black text-indigo-600 uppercase block tracking-[0.1em] user-name")}
                      <p className="text-sm text-gray-400 font-bold mt-2 tracking-[0.05em]">
                        {renderInput(data.email, (v) => onUpdate({ email: v }), "")} • {renderInput(data.phone, (v) => onUpdate({ phone: v }), "")}
                      </p>
                      <div className="text-[9px] text-gray-300 font-medium mt-1 uppercase tracking-widest">
                        {renderInput(data.address, (v) => onUpdate({ address: v }), "")}, {renderInput(data.city, (v) => onUpdate({ city: v }), "")}
                      </div>
                    </div>
                    <div className="text-right text-[9px] text-gray-400 font-black uppercase tracking-widest shrink-0">{new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                  
                  <div className="mb-10">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Assunto</p>
                    <div className="flex gap-2 text-xl font-black text-gray-800 uppercase tracking-[0.05em]">
                      <span>Candidatura ao cargo de:</span>
                      {renderInput(data.targetJob, (v) => onUpdate({ targetJob: v }), "flex-1")}
                    </div>
                  </div>

                  <div className="min-h-[650px]">
                    <p className={`text-[15px] leading-[2.3] whitespace-pre-wrap text-left text-gray-600 font-sans tracking-[0.05em]`}>
                       {renderInput(data.coverLetter || "", (v) => onUpdate({ coverLetter: v }), "", "Sua carta de apresentação...", true)}
                    </p>
                  </div>
                  
                  <div className="mt-12 border-t pt-8 border-gray-50 tracking-[0.05em]">
                    <p className="mb-3 italic font-bold text-gray-400 uppercase text-[8px] tracking-widest">Atentamente,</p>
                    {renderInput(data.fullName, (v) => onUpdate({ fullName: v }), "text-xl font-black text-gray-800 uppercase block tracking-[0.1em] user-name")}
                    <div className="w-12 h-1 bg-indigo-600 mt-2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
