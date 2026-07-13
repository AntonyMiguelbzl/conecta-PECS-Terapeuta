import { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CadastroPaciente() {
  const [etapa, setEtapa] = useState<'dados' | 'acesso'>('dados');
  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    nome: '', idade: '', 
    nomePai: '', zapPai: '', emailPai: '',
    nomeMae: '', zapMae: '', emailMae: '',
    email: '', senha: '', meioComunicacao: 'WhatsApp'
  });

  const podeAvancar = form.nome.length > 3 && form.idade !== '';

  const handleFinalizar = async () => {
    if (!auth.currentUser) return;
    setCarregando(true);
    try {
      await addDoc(collection(db, "pacientes"), {
        ...form,
        idade: Number(form.idade),
        terapeuta_id: auth.currentUser.uid,
        dataCadastro: new Date().toISOString()
      });
      toast.success("Paciente cadastrado com sucesso!");
      setEtapa('dados');
      setForm({ 
        nome: '', idade: '', 
        nomePai: '', zapPai: '', emailPai: '',
        nomeMae: '', zapMae: '', emailMae: '',
        email: '', senha: '', meioComunicacao: 'WhatsApp' 
      });
    } catch (error) {
      toast.error("Erro ao salvar cadastro.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="mb-8 flex gap-2">
        <div className={`h-2 flex-1 rounded-full ${etapa === 'dados' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${etapa === 'acesso' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        {etapa === 'dados' ? 'Dados do Paciente' : 'Configurar Acesso'}
      </h2>

      {etapa === 'dados' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Paciente</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Idade</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" type="number" value={form.idade} onChange={e => setForm({...form, idade: e.target.value})} />
          </div>

          {/* Dados do Pai */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-blue-600 mb-2">Dados do Pai</label>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nome do Pai" value={form.nomePai} onChange={e => setForm({...form, nomePai: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="WhatsApp do Pai" value={form.zapPai} onChange={e => setForm({...form, zapPai: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2" placeholder="E-mail do Pai" value={form.emailPai} onChange={e => setForm({...form, emailPai: e.target.value})} />
            </div>
          </div>

          {/* Dados da Mãe */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-pink-600 mb-2">Dados da Mãe</label>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nome da Mãe" value={form.nomeMae} onChange={e => setForm({...form, nomeMae: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="WhatsApp da Mãe" value={form.zapMae} onChange={e => setForm({...form, zapMae: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2" placeholder="E-mail da Mãe" value={form.emailMae} onChange={e => setForm({...form, emailMae: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={() => podeAvancar ? setEtapa('acesso') : toast.error("Preencha Nome e Idade!")} 
            className={`w-full py-4 mt-2 rounded-xl font-bold transition ${podeAvancar ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400'}`}
          >
            Próximo: Dados de Acesso
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail de Acesso (Paciente)</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha do App</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Meio de Comunicação Preferencial</label>
            <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" value={form.meioComunicacao} onChange={e => setForm({...form, meioComunicacao: e.target.value})}>
              <option>WhatsApp</option>
              <option>E-mail</option>
              <option>Telefone</option>
            </select>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button onClick={() => setEtapa('dados')} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl">Voltar</button>
            <button onClick={handleFinalizar} disabled={carregando} className="flex-2 w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition">
              {carregando ? 'Salvando...' : 'Finalizar Cadastro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}