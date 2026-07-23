import { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface CadastroPacienteProps {
  onCadastroSucesso?: () => void;
}

export default function CadastroPaciente({ onCadastroSucesso }: CadastroPacienteProps) {
  const [etapa, setEtapa] = useState<'dados' | 'acesso'>('dados');
  const [carregando, setCarregando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const [form, setForm] = useState({
    nome: '', idade: '', 
    nomePai: '', zapPai: '', emailPai: '',
    nomeMae: '', zapMae: '', emailMae: '',
    email: '', senha: '', meioComunicacao: 'WhatsApp'
  });

  const validarEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
  };

  const validarTelefone = (tel: string) => {
    const apenasDigitos = tel.replace(/\D/g, '');
    return apenasDigitos.length >= 10 && apenasDigitos.length <= 11;
  };

  const validarCamposDados = () => {
    if (!form.nome.trim()) return "Preencha o Nome do Paciente!";
    if (!form.idade) return "Preencha a Idade do Paciente!";
    
    if (!form.nomePai.trim()) return "Preencha o Nome do Pai!";
    if (!form.zapPai.trim()) return "Preencha o WhatsApp do Pai!";
    if (!validarTelefone(form.zapPai)) return "O WhatsApp do Pai deve conter DDD e número válido (mínimo 10 dígitos)!";
    if (!form.emailPai.trim()) return "Preencha o E-mail do Pai!";
    if (!validarEmail(form.emailPai)) return "Insira um e-mail válido para o Pai (ex: nome@dominio.com)!";

    if (!form.nomeMae.trim()) return "Preencha o Nome da Mãe!";
    if (!form.zapMae.trim()) return "Preencha o WhatsApp da Mãe!";
    if (!validarTelefone(form.zapMae)) return "O WhatsApp da Mãe deve conter DDD e número válido (mínimo 10 dígitos)!";
    if (!form.emailMae.trim()) return "Preencha o E-mail da Mãe!";
    if (!validarEmail(form.emailMae)) return "Insira um e-mail válido para a Mãe (ex: nome@dominio.com)!";

    return null;
  };

  const validarCamposAcesso = () => {
    if (!form.email.trim()) return "Preencha o E-mail de Acesso!";
    if (!validarEmail(form.email)) return "Insira um E-mail de Acesso válido (ex: nome@dominio.com)!";
    if (!form.senha.trim()) return "Preencha a Senha do App!";
    if (form.senha.length < 6) return "A senha deve ter pelo menos 6 caracteres!";
    return null;
  };

  const erroCampoDados = validarCamposDados();
  const todosPreenchidosDados = erroCampoDados === null;

  const erroCampoAcesso = validarCamposAcesso();
  const todosPreenchidosAcesso = erroCampoAcesso === null;
  const podeFinalizar = todosPreenchidosAcesso && !bloqueado && !carregando;

  const handleAvancar = () => {
    if (bloqueado) return;

    if (erroCampoDados) {
      toast.error(erroCampoDados);
      setBloqueado(true);
      setTimeout(() => {
        setBloqueado(false);
      }, 1500);
    } else {
      setEtapa('acesso');
    }
  };

  const handleFinalizar = async () => {
    if (bloqueado || carregando) return;

    if (erroCampoAcesso) {
      toast.error(erroCampoAcesso);
      setBloqueado(true);
      setTimeout(() => {
        setBloqueado(false);
      }, 1500);
      return;
    }

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

      if (onCadastroSucesso) {
        onCadastroSucesso();
      }
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
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome completo" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Idade</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" type="number" value={form.idade} onChange={e => setForm({...form, idade: e.target.value})} placeholder="Idade" />
          </div>

          {/* Dados do Pai */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-blue-600 mb-2">Dados do Pai</label>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nome do Pai" value={form.nomePai} onChange={e => setForm({...form, nomePai: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="WhatsApp (com DDD)" value={form.zapPai} onChange={e => setForm({...form, zapPai: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2" placeholder="E-mail (ex: email@dominio.com)" value={form.emailPai} onChange={e => setForm({...form, emailPai: e.target.value})} />
            </div>
          </div>

          {/* Dados da Mãe */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-pink-600 mb-2">Dados da Mãe</label>
            <div className="grid grid-cols-2 gap-4">
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="Nome da Mãe" value={form.nomeMae} onChange={e => setForm({...form, nomeMae: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200" placeholder="WhatsApp (com DDD)" value={form.zapMae} onChange={e => setForm({...form, zapMae: e.target.value})} />
              <input className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2" placeholder="E-mail (ex: email@dominio.com)" value={form.emailMae} onChange={e => setForm({...form, emailMae: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={handleAvancar} 
            disabled={bloqueado}
            className={`w-full py-4 mt-2 rounded-xl font-bold transition ${
              bloqueado 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : todosPreenchidosDados 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-pointer'
            }`}
          >
            {bloqueado ? 'Aguarde...' : 'Próximo: Dados de Acesso'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail de Acesso (Paciente)</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@dominio.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha do App (Mínimo 6 caracteres)</label>
            <input className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200" type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} placeholder="Senha" />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button onClick={() => setEtapa('dados')} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition cursor-pointer">Voltar</button>
            <button 
              onClick={handleFinalizar} 
              disabled={!podeFinalizar || carregando} 
              className={`flex-2 w-full py-4 rounded-xl font-bold transition ${
                carregando || bloqueado 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : todosPreenchidosAcesso 
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-pointer'
              }`}
            >
              {carregando ? 'Salvando...' : bloqueado ? 'Aguarde...' : 'Finalizar Cadastro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}