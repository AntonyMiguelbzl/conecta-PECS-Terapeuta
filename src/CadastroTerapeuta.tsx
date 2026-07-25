import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import imagemFundo from './assets/Terapeuta.jpeg';

interface CadastroTerapeutaProps {
  onVoltar: () => void;
}

export default function CadastroTerapeuta({ onVoltar }: CadastroTerapeutaProps) {
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', conselho: '', registro: '', especialidade: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const credencial = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      
      await setDoc(doc(db, "terapeutas", credencial.user.uid), {
        nome: formData.nome,
        email: formData.email,
        conselho: formData.conselho,
        registro: formData.registro,
        especialidade: formData.especialidade,
        status: 'pendente',
        dataCadastro: new Date().toISOString()
      });

      toast.success("Cadastro realizado com sucesso! Aguarde a liberação do acesso.");
      onVoltar();
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      // Tratamento de erros comuns do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Este e-mail já está cadastrado.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
      } else {
        toast.error("Erro ao realizar cadastro. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <img
        src={imagemFundo}
        alt="Imagem de fundo"
        className="absolute inset-0 h-full w-full object-cover object-[center_10%]"
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex min-h-screen items-center justify-end px-2 py-4 sm:px-4 sm:py-6 lg:px-60 lg:py-8">
        <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/95 p-10 shadow-2xl backdrop-blur-md sm:p-12 lg:p-14">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Criar conta profissional</h2>
            <p className="mt-1 text-sm text-slate-500">Preencha seus dados para liberar o acesso.</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            <input
              type="text"
              placeholder="Nome Completo"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            <input
              type="email"
              placeholder="E-mail Profissional"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            <input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Conselho (ex: CRP)"
                value={formData.conselho}
                onChange={(e) => setFormData({...formData, conselho: e.target.value})}
                className="rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="text"
                placeholder="Registro"
                value={formData.registro}
                onChange={(e) => setFormData({...formData, registro: e.target.value})}
                className="rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {carregando ? 'Processando...' : 'Finalizar Cadastro'}
            </button>
          </form>

          <button
            onClick={onVoltar}
            className="mt-4 w-full text-sm font-medium text-blue-600 hover:underline cursor-pointer"
          >
            Já possui conta? Entrar
          </button>
        </div>
      </div>
    </div>
  );
}