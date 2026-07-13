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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {pacientes.map((p) => (
        <div
          key={p.id}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
        >
          <h3 className="font-bold text-lg">{p.nome}</h3>
          <p className="text-sm text-slate-500 mb-4">{p.email}</p>
          <button
            onClick={() => onSelecionarPaciente(p)}
            className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 transition"
          >
            Central de Controle do Paciente{" "}
          </button>
        </div>
      ))}
      {pacientes.length === 0 && (
        <p className="text-slate-400">Nenhum paciente encontrado.</p>
      )}
    </div>
  );
}
