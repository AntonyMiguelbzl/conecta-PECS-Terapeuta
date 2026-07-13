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
  nomeMae: string;
  zapMae: string;
}

export default function PerfilPaciente({ pacienteId }: { pacienteId: string }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [editando, setEditando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

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
          senha: data.senha || '',
          nomePai: data.nomePai || '',
          zapPai: data.zapPai || '',
          nomeMae: data.nomeMae || '',
          zapMae: data.zapMae || ''
        } as Paciente);
      }

      const q = query(collection(db, 'cartoes_customizados'), where('paciente_id', '==', pacienteId));
      const querySnapshot = await getDocs(q);
      setHistorico(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    carregarDados();
  }, [pacienteId]);

  const salvarEdicao = async () => {
    if (!paciente) return;
    try {
      await updateDoc(doc(db, 'pacientes', pacienteId), { 
        nome: paciente.nome,
        idade: paciente.idade,
        email: paciente.email,
        senhaApp: paciente.senha,
        nomePai: paciente.nomePai,
        zapPai: paciente.zapPai,
        nomeMae: paciente.nomeMae,
        zapMae: paciente.zapMae
      });
      setEditando(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar alterações.');
    }
  };

const confirmarExclusao = async () => {
    try {
      // 1. Referência para a coleção de cartões
      const cartoesRef = collection(db, 'cartoes_customizados');
      
      // 2. Busca todos os cartões vinculados a este paciente
      const q = query(cartoesRef, where('paciente_id', '==', pacienteId));
      const snapshot = await getDocs(q);

      // 3. Usa um "Batch" (lote) para deletar tudo de uma vez
      const batch = writeBatch(db);
      
      snapshot.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      // 4. Deleta o paciente
      batch.delete(doc(db, 'pacientes', pacienteId));

      // 5. Executa no Firebase
      await batch.commit();

      toast.success('Paciente e histórico removidos com sucesso.');
      window.location.href = '/pacientes'; 
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error('Erro ao excluir dados vinculados.');
    }
  };

  if (!paciente) return <div className="p-4 text-slate-500">Carregando perfil...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <Toaster position="top-right" />

      {/* Modal de Confirmação */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Paciente?</h3>
            <p className="text-slate-600 mb-6 text-sm">Esta ação é irreversível.</p>
            <div className="flex gap-3">
              <button onClick={() => setMostrarModal(false)} className="flex-1 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">Excluir</button>
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
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.nomePai || ''} onChange={e => setPaciente({...paciente, nomePai: e.target.value})} disabled={!editando} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-1">WhatsApp do Pai</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.zapPai || ''} onChange={e => setPaciente({...paciente, zapPai: e.target.value})} disabled={!editando} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-pink-600 mb-1">Nome da Mãe</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.nomeMae || ''} onChange={e => setPaciente({...paciente, nomeMae: e.target.value})} disabled={!editando} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-pink-600 mb-1">WhatsApp da Mãe</label>
            <input className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200" value={paciente.zapMae || ''} onChange={e => setPaciente({...paciente, zapMae: e.target.value})} disabled={!editando} />
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

      
      <h3 className="text-lg font-bold mb-4 mt-8">Histórico de Pranchas</h3>
      <div className="space-y-3">
        {historico.length > 0 ? (
          historico.map(card => (
            <div key={card.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                {/* Imagem do item (usando o arasaacId salvo no banco) */}
                <img 
                  src={`https://static.arasaac.org/pictograms/${card.arasaacId}/${card.arasaacId}_300.png`} 
                  alt={card.label} 
                  className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 capitalize">{card.label}</span>
                  {/* Categoria do item */}
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit uppercase font-bold tracking-wider mt-0.5">
                    {card.categoria || 'Sem categoria'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {card.criadoEm ? new Date(card.criadoEm).toLocaleDateString() : ''}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhum histórico encontrado.</p>
        )}
      </div>
    </div>
  );
}