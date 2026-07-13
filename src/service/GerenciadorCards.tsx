import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface Paciente { id: string; nome: string; }
interface GerenciadorProps { paciente: Paciente; }

const TERMOS_CATEGORIAS = ['alimento', 'fruta', 'brinquedo', 'escola', 'casa', 'sentimento', 'verbo', 'pessoa'];

export default function GerenciadorCards({ paciente }: GerenciadorProps) {
  const [tela, setTela] = useState<'categorias' | 'itens'>('categorias');
  const [itens, setItens] = useState<any[]>([]);
  const [categoriaAtual, setCategoriaAtual] = useState<string>('');
  const [listaSelecionados, setListaSelecionados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [feedback, setFeedback] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const mostrarFeedback = (mensagem: string, tipo: 'sucesso' | 'erro') => {
    setFeedback({ mensagem, tipo });
    setTimeout(() => setFeedback(null), 3000);
  };

  const selecionarItem = (item: any) => {
    const jaExiste = listaSelecionados.find(i => i._id === item._id);
    if (jaExiste) {
      mostrarFeedback("Este item já foi adicionado!", 'erro');
      return;
    }
    
    if (listaSelecionados.length >= 10) {
      mostrarFeedback("Limite de 10 itens atingido.", 'erro');
      return;
    }

    const nomeItem = item.keywords?.length > 0 ? item.keywords[0].keyword : "Item";
    setListaSelecionados([...listaSelecionados, { ...item, nomeFormatado: nomeItem, categoriaOrigem: categoriaAtual }]);
  };

  const removerItem = (id: string) => {
    setListaSelecionados(listaSelecionados.filter(item => item._id !== id));
  };

  const salvarPranchaNoFirebase = async () => {
    if (listaSelecionados.length === 0) return;
    
    setCarregando(true);
    try {
      const colRef = collection(db, 'cartoes_customizados');
      await Promise.all(listaSelecionados.map(item => 
        addDoc(colRef, {
          label: item.nomeFormatado,
          categoria: item.categoriaOrigem,
          arasaacId: item._id,
          paciente_id: paciente.id,
          criadoEm: new Date().toISOString()
        })
      ));
      
      mostrarFeedback("Prancha salva com sucesso!", 'sucesso');
      setListaSelecionados([]);
    } catch (err) {
      mostrarFeedback("Erro ao salvar no banco. Tente novamente.", 'erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
      {feedback && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl text-white font-bold ${feedback.tipo === 'sucesso' ? 'bg-green-600' : 'bg-red-600'}`}>
          {feedback.mensagem}
        </div>
      )}

      <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">Gerenciando: {paciente.nome}</h2>
        
        {tela === 'categorias' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TERMOS_CATEGORIAS.map(termo => (
              <button key={termo} onClick={async () => {
                try {
                  const res = await fetch(`https://api.arasaac.org/v1/pictograms/pt/search/${termo}`);
                  const data = await res.json();
                  setItens(Array.isArray(data) ? data : []);
                  setCategoriaAtual(termo);
                  setTela('itens');
                } catch { mostrarFeedback("Erro na API", "erro"); }
              }} className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 transition capitalize font-medium">{termo}</button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setTela('categorias')} className="mb-4 text-blue-400 hover:underline">← Voltar</button>
            <div className="grid grid-cols-3 gap-4">
              {itens.slice(0, 15).map(item => (
                <button key={item._id} onClick={() => selecionarItem(item)} className="bg-white p-2 rounded-xl text-black flex flex-col items-center hover:scale-105 transition">
                  <img src={`https://static.arasaac.org/pictograms/${item._id}/${item._id}_300.png`} className="w-16 h-16 object-contain" />
                  <p className="font-bold text-xs mt-1 capitalize">{item.keywords?.[0]?.keyword || 'Item'}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Prancha ({listaSelecionados.length}/10)</h3>
        <div className="space-y-3">
          {listaSelecionados.map((item) => (
            <div key={item._id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <img src={`https://static.arasaac.org/pictograms/${item._id}/${item._id}_300.png`} className="w-10 h-10 object-contain" />
              
              <div className="flex-1 flex flex-col">
                <span className="font-bold text-sm text-slate-900 capitalize">{item.nomeFormatado}</span>
                {/* Aqui está a categoria adicionada */}
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit uppercase font-bold tracking-wider mt-0.5">
                  {item.categoriaOrigem}
                </span>
              </div>
              
              <button onClick={() => removerItem(item._id)} className="text-red-500 hover:text-red-700 p-2 text-lg font-bold">✕</button>
            </div>
          ))}
        </div>
        
        {listaSelecionados.length > 0 && (
          <button 
            disabled={carregando}
            onClick={salvarPranchaNoFirebase} 
            className="mt-6 w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-400 transition"
          >
            {carregando ? "Salvando..." : "Confirmar e Salvar"}
          </button>
        )}
      </div>
    </div>
  );
}