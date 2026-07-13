import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Importação do toast

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar conta profissional</h2>
        
        <form onSubmit={handleCadastro} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            value={formData.nome} 
            onChange={(e) => setFormData({...formData, nome: e.target.value})} 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="email" 
            placeholder="E-mail Profissional" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha (mínimo 6 caracteres)" 
            value={formData.senha} 
            onChange={(e) => setFormData({...formData, senha: e.target.value})} 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Conselho (ex: CRP)" 
              value={formData.conselho} 
              onChange={(e) => setFormData({...formData, conselho: e.target.value})} 
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Registro" 
              value={formData.registro} 
              onChange={(e) => setFormData({...formData, registro: e.target.value})} 
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? 'Processando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <button 
          onClick={onVoltar} 
          className="w-full mt-4 text-blue-600 text-sm hover:underline cursor-pointer font-medium"
        >
          Já possui conta? Entrar
        </button>
      </div>
    </div>
  );
}