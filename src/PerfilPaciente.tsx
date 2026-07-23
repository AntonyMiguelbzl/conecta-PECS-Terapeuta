import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase'; 
import toast, { Toaster } from 'react-hot-toast';

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  email: string;
  senha: string;
  nomePai: string;
  zapPai: string;
  emailPai: string;
  nomeMae: string;
  zapMae: string;
  emailMae: string;
}

interface PerfilPacienteProps {
  pacienteId: string;
  aoVoltar?: () => void; 
}

export default function PerfilPaciente({ pacienteId, aoVoltar }: PerfilPacienteProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cartoesAtivos, setCartoesAtivos] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [editando, setEditando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Novo estado de trava para evitar spam de cliques na exclusão
  const [excluindo, setExcluindo] = useState(false);

  // Novos estados para o filtro por período no histórico
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Trava o scroll da página de fundo exatamente onde o usuário está
  useEffect(() => {
    if (mostrarModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mostrarModal]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!pacienteId) return;
      
      const docRef = await getDoc(doc(db, 'pacientes', pacienteId));
      if (docRef.exists()) {
        const data = docRef.data();
        setPaciente({ 
          id: docRef.id, 
          nome: data.nome || '',
          idade: data.idade || '',
          email: data.email || '',
          senha: data.senha || data.senhaApp || '', 
          nomePai: data.nomePai || '',
          zapPai: data.zapPai || '',
          emailPai: data.emailPai || '',
          nomeMae: data.nomeMae || '',
          zapMae: data.zapMae || '',
          emailMae: data.emailMae || ''
        } as Paciente);
      }

      try {
        const qAtivos = query(collection(db, 'cartoes_customizados'), where('paciente_id', '==', pacienteId));
        const querySnapshotAtivos = await getDocs(qAtivos);
        const ativos = querySnapshotAtivos.docs.map(doc => ({ 
          id: doc.id, 
          isExcluido: false, 
          ...doc.data() 
        }));
        
        setCartoesAtivos(ativos);

        const qExcluidos = query(
          collection(db, 'historico'), 
          where('paciente_id', '==', pacienteId),
          where('tipo', '==', 'exclusao_cartao')
        );
        const querySnapshotExcluidos = await getDocs(qExcluidos);
        const excluidos = querySnapshotExcluidos.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            label: data.label,
            arasaacId: data.arasaacId,
            categoria: data.categoria,
            criadoEm: data.criadoEm || null,
            deletadoEm: data.timestamp || null,
            isExcluido: true
          };
        });

        const totalHistorico = [...ativos, ...excluidos].sort((a: any, b: any) => {
          const dataA = new Date(a.deletadoEm || a.criadoEm || 0).getTime();
          const dataB = new Date(b.deletadoEm || b.criadoEm || 0).getTime();
          return dataB - dataA;
        });

        setHistorico(totalHistorico);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      }
    };
    
    carregarDados();
  }, [pacienteId]);

  const historicoFiltrado = historico.filter(card => {
    const dataAlvoStr = card.deletadoEm || card.criadoEm;
    if (!dataAlvoStr) return !dataInicio && !dataFim;

    const dataItem = new Date(dataAlvoStr).toISOString().split('T')[0];

    if (dataInicio && dataFim) {
      return dataItem >= dataInicio && dataItem <= dataFim;
    } else if (dataInicio) {
      return dataItem >= dataInicio;
    } else if (dataFim) {
      return dataItem <= dataFim;
    }
    return true;
  });

  const salvarEdicao = async () => {
    if (!paciente) return;
    try {
      await updateDoc(doc(db, 'pacientes', pacienteId), { 
        nome: paciente.nome,
        idade: paciente.idade,
        email: paciente.email,
        senha: paciente.senha,
        senhaApp: paciente.senha, 
        nomePai: paciente.nomePai,
        zapPai: paciente.zapPai,
        emailPai: paciente.emailPai,
        nomeMae: paciente.nomeMae,
        zapMae: paciente.zapMae,
        emailMae: paciente.emailMae
      });
      setEditando(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar alterações.');
    }
  };

  const confirmarExclusao = async () => {
    // Se já estiver excluindo, barra qualquer clique duplo / spam adicional imediatamente
    if (excluindo) return;

    setExcluindo(true);

    try {
      const cartoesRef = collection(db, 'cartoes_customizados');
      const q = query(cartoesRef, where('paciente_id', '==', pacienteId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      batch.delete(doc(db, 'pacientes', pacienteId));
      await batch.commit();

      toast.success('Paciente e histórico removidos com sucesso.');
      
      setTimeout(() => {
        if (aoVoltar) {
          aoVoltar();
        } else {
          window.location.reload(); 
        }
      }, 1000);

    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error('Erro ao excluir dados vinculados.');
      setExcluindo(false); // Destrava apenas se acontecer algum erro para permitir tentar novamente
    }
  };

  if (!paciente) return <div className="p-4 text-slate-500">Carregando perfil...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative">
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />

      {aoVoltar && (
        <button 
          onClick={aoVoltar} 
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition"
        >
          &larr; Voltar para Meus Pacientes
        </button>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 my-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Deseja realmente excluir?</h3>
            <p className="text-slate-600 mb-6 text-sm">Esta ação é irreversível e removerá todos os dados do paciente.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMostrarModal(false)} 
                disabled={excluindo}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarExclusao} 
                disabled={excluindo}
                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition shadow-lg ${
                  excluindo 
                    ? 'bg-red-400 cursor-not-allowed shadow-none' 
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Dados do Paciente</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Paciente</label>
          <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.nome} onChange={e => setPaciente({...paciente, nome: e.target.value})} disabled={!editando} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Idade</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.idade} onChange={e => setPaciente({...paciente, idade: e.target.value})} disabled={!editando} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.email} onChange={e => setPaciente({...paciente, email: e.target.value})} disabled={!editando} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Senha do App</label>
          <div className="relative">
            <input 
              type={verSenha ? "text" : "password"} 
              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 pr-20" 
              value={paciente.senha} 
              onChange={e => setPaciente({...paciente, senha: e.target.value})} 
              disabled={!editando} 
            />
            <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-3 top-3 text-blue-600 hover:text-blue-800 font-bold text-xs">
              {verSenha ? 'OCULTAR' : 'VER SENHA'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-1">Nome do Pai</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2" value={paciente.nomePai || ''} onChange={e => setPaciente({...paciente, nomePai: e.target.value})} disabled={!editando} />
            <label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp do Pai</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2" value={paciente.zapPai || ''} onChange={e => setPaciente({...paciente, zapPai: e.target.value})} disabled={!editando} />
            <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail do Pai</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.emailPai || ''} onChange={e => setPaciente({...paciente, emailPai: e.target.value})} disabled={!editando} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-pink-600 mb-1">Nome da Mãe</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2" value={paciente.nomeMae || ''} onChange={e => setPaciente({...paciente, nomeMae: e.target.value})} disabled={!editando} />
            <label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp da Mãe</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2" value={paciente.zapMae || ''} onChange={e => setPaciente({...paciente, zapMae: e.target.value})} disabled={!editando} />
            <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail da Mãe</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.emailMae || ''} onChange={e => setPaciente({...paciente, emailMae: e.target.value})} disabled={!editando} />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => editando ? salvarEdicao() : setEditando(true)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          {editando ? 'Salvar Alterações' : 'Editar Perfil'}
        </button>
        <button onClick={() => setMostrarModal(true)} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-200">
          Excluir Paciente
        </button>
      </div>

      <h3 className="text-lg font-bold mb-4 mt-8 flex items-center gap-2 text-slate-800">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Prancha Ativa (O que está no app agora)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {cartoesAtivos.length > 0 ? (
          cartoesAtivos.map(card => (
            <div key={card.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center hover:bg-slate-100/50 transition-all">
              <img 
                src={`https://static.arasaac.org/pictograms/${card.arasaacId}/${card.arasaacId}_300.png`} 
                alt={card.label} 
                className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-slate-200 mb-3"
              />
              <span className="font-bold text-xs text-slate-800 capitalize truncate w-full">{card.label}</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1.5 uppercase font-extrabold tracking-wider">
                {card.categoria || 'Geral'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 col-span-full">Nenhum cartão ativo configurado.</p>
        )}
      </div>

      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Histórico de Alterações (Adições e Exclusões)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Data Início</label>
          <input 
            type="date" 
            value={dataInicio} 
            onChange={e => setDataInicio(e.target.value)}
            className="w-full bg-white p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Data Fim</label>
          <input 
            type="date" 
            value={dataFim} 
            onChange={e => setDataFim(e.target.value)}
            className="w-full bg-white p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="space-y-3">
        {historicoFiltrado.length > 0 ? (
          historicoFiltrado.map(card => {
            const isExcluido = card.isExcluido;
            
            return (
              <div 
                key={card.id} 
                className={`p-4 rounded-xl flex items-center justify-between border transition-all ${
                  isExcluido 
                    ? 'border-red-100/80 bg-red-50/40 hover:bg-red-50' 
                    : 'border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://static.arasaac.org/pictograms/${card.arasaacId}/${card.arasaacId}_300.png`} 
                    alt={card.label} 
                    className={`w-12 h-12 object-contain bg-white rounded-lg p-1 border ${
                      isExcluido ? 'border-red-200 grayscale opacity-70' : 'border-emerald-200'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className={`font-bold capitalize ${
                      isExcluido ? 'text-red-600 line-through' : 'text-emerald-700'
                    }`}>
                      {card.label}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit font-bold uppercase tracking-wider ${
                        isExcluido ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {card.categoria || 'Geral'}
                      </span>
                      
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full w-fit font-bold uppercase tracking-wider ${
                        isExcluido ? 'bg-red-600' : 'bg-emerald-600'
                      }`}>
                        {isExcluido ? 'Excluído' : 'Adicionado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs text-slate-400">
                    {isExcluido 
                      ? (card.deletadoEm ? `Removido: ${new Date(card.deletadoEm).toLocaleDateString('pt-BR')} às ${new Date(card.deletadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '')
                      : (card.criadoEm ? `Adicionado: ${new Date(card.criadoEm).toLocaleDateString('pt-BR')} às ${new Date(card.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Adicionado recentemente')
                    }
                  </span>
                  <span className={`text-[10px] font-extrabold mt-1 uppercase tracking-wider ${
                    isExcluido ? 'text-red-500' : 'text-emerald-600'
                  }`}>
                    Por: {card.autor || 'Terapeuta'}
                  </span>
                </div>
              </div> 
            );
          })
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Nenhum registro encontrado na parte de procurar por periodo</p>
          </div>
        )}
      </div>
    </div>
  );
}