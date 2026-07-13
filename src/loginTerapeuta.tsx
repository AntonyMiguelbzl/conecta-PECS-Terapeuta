import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';

interface LoginTerapeutaProps {
  onIrParaCadastro: () => void;
}

export default function LoginTerapeuta({ onIrParaCadastro }: LoginTerapeutaProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos vazios antes mesmo de ir ao Firebase
    if (!email.trim() || !senha.trim()) {
      toast.error("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      console.error("Erro completo no login:", err);
      
      // Mapeamento preciso de erros do Firebase
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          toast.error("E-mail ou senha incorretos.");
          break;
        case 'auth/too-many-requests':
          toast.error("Muitas tentativas. Tente novamente mais tarde.");
          break;
        case 'auth/invalid-email':
          toast.error("O e-mail informado é inválido.");
          break;
        case 'auth/network-request-failed':
          toast.error("Verifique sua conexão com a internet.");
          break;
        default:
          // Caso ocorra algo que não está mapeado, mostramos a mensagem do próprio Firebase
          toast.error(err.message || "Ocorreu um erro ao tentar entrar.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Conecta PECS</h1>
          <p className="text-sm text-slate-500 mt-1">Painel de Controle do Terapeuta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              E-mail Profissional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@terapia.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-700 transition"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200 disabled:opacity-50 cursor-pointer"
          >
            {carregando ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button 
            type="button" 
            onClick={onIrParaCadastro} 
            className="w-full text-blue-600 text-sm hover:underline cursor-pointer"
          >
            Não tem conta? Cadastre-se aqui
          </button>
        </div>
      </div>
    </div>
  );
}