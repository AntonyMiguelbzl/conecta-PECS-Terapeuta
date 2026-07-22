import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

interface Paciente {
  id: string;
  nome: string;
  email: string;
  idade: number;
  senhaApp: string;
}

interface ListaProps {
  onSelecionarPaciente: (paciente: Paciente) => void;
}

export default function ListaPacientes({ onSelecionarPaciente }: ListaProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "pacientes"),
      where("terapeuta_id", "==", auth.currentUser.uid),
    );

    const desinscrever = onSnapshot(
      q,
      (snapshot) => {
        const lista: Paciente[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Paciente,
        );
        setPacientes(lista);
      },
      (err) => console.error("Erro ao carregar pacientes:", err),
    );

    return () => desinscrever();
  }, []);

  // Filtra os pacientes com base no texto digitado (por nome ou e-mail)
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      
      {/* Barra de Pesquisa */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar paciente por nome ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
        />
      </div>

      {/* Grid de Pacientes Filtrados */}
      {pacientesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pacientesFiltrados.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg text-slate-800">{p.nome}</h3>
              <p className="text-sm text-slate-500 mb-4">{p.email}</p>
              <button
                onClick={() => onSelecionarPaciente(p)}
                className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 transition font-medium"
              >
                Central de Controle do Paciente{" "}
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Mensagem se não encontrar nenhum paciente (ou lista vazia) */
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium">Nenhum paciente encontrado.</p>
          <p className="text-sm text-slate-400 mt-1">
            {pacientes.length === 0 
              ? "Você ainda não possui pacientes cadastrados." 
              : "Tente buscar por outro nome ou e-mail."}
          </p>
        </div>
      )}

    </div>
  );
}