import { useState, useEffect } from 'react';
import { addDoc, collection, doc, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CardExibicao from '../CardExibicao'; 

interface Paciente { id: string; nome: string; }
interface GerenciadorProps { paciente: Paciente; }

const CATEGORIAS_CONFIG = [
  { label: 'Início', termo: 'casa' },
  { label: 'Essenciais', termo: 'rotina' },
  { label: 'Comer', termo: 'comer' },
  { label: 'Brincar', termo: 'brincar' },
  { label: 'Ir', termo: 'ir' },
  { label: 'Sentir', termo: 'sentimento' },
  { label: 'Família', termo: 'familia' },
  { label: 'Sobre', termo: 'eu' }
];

export default function GerenciadorCards({ paciente }: GerenciadorProps) {
  const [tela, setTela] = useState<'categorias' | 'itens'>('categorias');
  const [itens, setItens] = useState<any[]>([]);
  const [categoriaAtual, setCategoriaAtual] = useState<string>('');
  const [listaSelecionados, setListaSelecionados] = useState<any[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [feedback, setFeedback] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [cartoesAtuais, setCartoesAtuais] = useState<any[]>([]);

  const mostrarFeedback = (mensagem: string, tipo: 'sucesso' | 'erro') => {
    setFeedback({ mensagem, tipo });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    if (!paciente?.id) return;

    const q = query(
      collection(db, "cartoes_customizados"),
      where("paciente_id", "==", paciente.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data()
      }));
      setCartoesAtuais(list);
    }, (error) => {
      console.error("Erro ao escutar cartões:", error);
    });

    return () => unsubscribe();
  }, [paciente?.id]);

  // FUNÇÃO ATUALIZADA: Recebe o objeto card completo para capturar ID e Categoria
  const deletarCartaoSalvo = async (card: any) => {
    const confirmar = window.confirm(`Deseja realmente remover o cartão "${card.label}"?`);
    if (!confirmar) return;

    try {
      setCarregando(true);
      await deleteDoc(doc(db, 'cartoes_customizados', card.firebaseId));

      await addDoc(collection(db, 'historico'), {
        paciente_id: paciente.id,
        tipo: 'exclusao_cartao',
        label: card.label,
        arasaacId: card.arasaacId, // Agora salva o ID da imagem
        categoria: card.categoria, // Agora salva a categoria
        descricao: `O cartão "${card.label}" foi excluído.`,
        autor: 'Terapeuta',
        timestamp: new Date().toISOString()
      });

      mostrarFeedback(`Cartão "${card.label}" removido com sucesso!`, 'sucesso');
    } catch (err) {
      console.error("Erro ao deletar:", err);
      mostrarFeedback("Não foi possível excluir o cartão.", 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const buscarNaApi = async (termo: string, label: string) => {
    try {
      setCarregando(true);
      const res = await fetch(`https://api.arasaac.org/v1/pictograms/pt/search/${termo}`);
      const data = await res.json();
      setItens(Array.isArray(data) ? data : []);
      setCategoriaAtual(label);
      setTela('itens');
    } catch { 
      mostrarFeedback("Erro ao buscar itens. Tente novamente.", "erro"); 
    } finally {
      setCarregando(false);
    }
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
      
      mostrarFeedback("Prancha enviada com sucesso!", 'sucesso');
      setListaSelecionados([]);
    } catch (err) {
      console.error("Erro ao salvar:", err);
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
        
        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 p-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 border border-slate-300" 
            placeholder="Pesquisar item específico..." 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <button 
            onClick={() => termoBusca && buscarNaApi(termoBusca, `Busca: ${termoBusca}`)} 
            className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition"
          >
            Buscar
          </button>
        </div>
        
        {tela === 'categorias' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIAS_CONFIG.map(cat => (
              <button 
                key={cat.termo} 
                onClick={() => buscarNaApi(cat.termo, cat.label)} 
                className="bg-slate-800 p-4 rounded-xl hover:bg-slate-700 transition font-bold"
              >
                {cat.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setTela('categorias')} className="mb-4 text-blue-400 hover:underline">← Voltar para Categorias</button>
            <h3 className="text-xl font-bold mb-4 capitalize">Resultados: {categoriaAtual}</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {itens.slice(0, 16).map(item => (
                <button key={item._id} onClick={() => selecionarItem(item)} className="hover:scale-105 transition">
                  <CardExibicao 
                    label={item.keywords?.[0]?.keyword || 'Item'} 
                    arasaacId={item._id} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-800/80">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-300">
            🎴 Cartões Ativos no Painel ({cartoesAtuais.length})
          </h3>
          {cartoesAtuais.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Nenhum cartão customizado ativo para este paciente no momento.
            </p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {cartoesAtuais.map((card) => (
                <div key={card.firebaseId} className="relative group hover:scale-105 transition">
                  <CardExibicao 
                    label={card.label} 
                    arasaacId={card.arasaacId} 
                  />
                  <button 
                    // Alteração aplicada: passamos o objeto 'card' inteiro
                    onClick={() => deletarCartaoSalvo(card)} 
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition"
                    title="Excluir Cartão"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Prancha ({listaSelecionados.length}/10)</h3>
        <div className="grid grid-cols-2 gap-4">
          {listaSelecionados.map((item) => (
            <div key={item._id} className="relative group">
              <CardExibicao 
                label={item.nomeFormatado} 
                arasaacId={item._id} 
              />
              <button 
                onClick={() => removerItem(item._id)} 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
              >
                ✕
              </button>
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