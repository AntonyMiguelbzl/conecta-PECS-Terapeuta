import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import LoginTerapeuta from "./loginTerapeuta";
import CadastroTerapeuta from "./CadastroTerapeuta";
import CadastroPaciente from "./CadastroPaciente";
import ListaPacientes from "./ListaPacientes";
import PainelPaciente from "./PainelPaciente";

type StatusTerapeuta = 'pendente' | 'aprovado' | 'reprovado' | null;

export default function App() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [statusTerapeuta, setStatusTerapeuta] = useState<StatusTerapeuta>(null);
  const [nomeTerapeuta, setNomeTerapeuta] = useState<string>("");
  const [tela, setTela] = useState<"login" | "cadastroTerapeuta" | "painel">("login");
  const [abaTerapeuta, setAbaTerapeuta] = useState<"lista" | "cadastro">("lista");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        setTela("painel");
        const docRef = doc(db, "terapeutas", user.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (!docSnap.exists()) {
            signOut(auth).then(() => window.location.reload());
            return;
          }
          const dados = docSnap.data();
          setNomeTerapeuta(dados.nome || "Terapeuta");
          const novoStatus = (dados.status || 'pendente') as StatusTerapeuta;
          if (statusTerapeuta === 'pendente' && novoStatus === 'aprovado') {
            toast.success("Sua conta foi aprovada! Bem-vindo ao painel.");
          }
          setStatusTerapeuta(novoStatus);
          setEstaCarregando(false);
        }, (error) => {
          console.error("Erro no snapshot:", error);
          setEstaCarregando(false);
        });
        return () => unsubscribe();
      } else {
        setUsuario(null);
        setTela("login");
        setStatusTerapeuta(null);
        setNomeTerapeuta("");
        setEstaCarregando(false);
      }
    });
  }, [statusTerapeuta]);

  useEffect(() => {
    if (statusTerapeuta === 'reprovado' && auth.currentUser) {
      toast.error("Acesso não aprovado. Excluindo dados e desconectando...");
      const timer = setTimeout(async () => {
        try {
          const docRef = doc(db, "terapeutas", auth.currentUser!.uid);
          await deleteDoc(docRef);
          await signOut(auth);
          window.location.reload();
        } catch (error) { console.error("Erro na exclusão:", error); }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusTerapeuta]);

  const handleSair = async () => { await signOut(auth); window.location.reload(); };

  if (estaCarregando) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500 animate-pulse">Carregando sistema...</p></div>;
  }

  if (!usuario) {
    return tela === "cadastroTerapeuta" 
      ? <CadastroTerapeuta onVoltar={() => setTela("login")} /> 
      : <LoginTerapeuta onIrParaCadastro={() => setTela("cadastroTerapeuta")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Conecta PECS</h1>
          <span className="text-sm font-medium text-slate-500">
            Olá, <span className="font-bold text-blue-600">{nomeTerapeuta}</span>
          </span>
        </div>
        <button onClick={handleSair} className="text-red-500 text-sm font-semibold hover:underline cursor-pointer">
          Sair
        </button>
      </header>

      <main className="flex-1 py-8 max-w-5xl mx-auto w-full px-4">
        {statusTerapeuta === 'aprovado' ? (
          pacienteSelecionado ? (
            <PainelPaciente paciente={pacienteSelecionado} aoVoltar={() => setPacienteSelecionado(null)} />
          ) : (
            <>
              <nav className="flex gap-2 mb-6">
                <button onClick={() => setAbaTerapeuta("lista")} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${abaTerapeuta === "lista" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}>📋 Meus Pacientes</button>
                <button onClick={() => setAbaTerapeuta("cadastro")} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${abaTerapeuta === "cadastro" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}>➕ Cadastrar Paciente</button>
              </nav>
              {abaTerapeuta === "lista" ? <ListaPacientes onSelecionarPaciente={setPacienteSelecionado} /> : <CadastroPaciente />}
            </>
          )
        ) : statusTerapeuta === 'reprovado' ? (
          <div className="bg-red-50 p-10 rounded-2xl border border-red-200 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-700">Acesso Negado</h2>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-yellow-200 text-center shadow-sm">
            <h2 className="text-xl font-bold text-yellow-700">Conta em Análise</h2>
          </div>
        )}
      </main>
    </div>
  );
}