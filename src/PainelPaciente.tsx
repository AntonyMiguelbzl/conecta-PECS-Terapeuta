import { useState } from 'react';
import PerfilPaciente from './PerfilPaciente'; 
import GerenciadorCards from './service/GerenciadorCards'; 
import MonitoramentoPaciente from './Monitoramento';

interface Paciente {
  id: string;
  nome: string;
}

interface PainelProps {
  paciente: Paciente;
  aoVoltar: () => void;
}

export default function PainelPaciente({ paciente, aoVoltar }: PainelProps) {
  const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'monitor' | 'prancha'>('perfil');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Cabeçalho do Painel */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
            <button 
                onClick={aoVoltar}
                className="text-blue-600 text-sm font-semibold hover:underline mb-2 block"
            >
                ← Voltar para lista
            </button>
            <h2 className="text-2xl font-bold text-slate-800">
                Gerenciando: {paciente.nome}
            </h2>
            </div>
        </div>

        {/* Menu de Abas */}
        <div className="flex gap-2 border-b border-slate-200">
            {['perfil', 'monitor', 'prancha'].map((aba) => (
                <button
                    key={aba}
                    onClick={() => setAbaAtiva(aba as any)}
                    className={`px-6 py-3 font-bold transition-all border-b-2 capitalize ${
                        abaAtiva === aba 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {aba === 'perfil' ? 'Perfil e Histórico' : aba === 'monitor' ? 'Monitoramento' : 'Montar Prancha'}
                </button>
            ))}
        </div>

        {/* Conteúdo dinâmico com renderização forçada para o monitor */}
        <div className="mt-4">
            {abaAtiva === 'perfil' && (
                <PerfilPaciente pacienteId={paciente.id} />
            )}
            
            {abaAtiva === 'monitor' && (
                <div className="flex justify-center w-full">
                    {paciente?.id ? (
                        // A key={paciente.id} força o componente a recarregar e conectar no Firebase ao entrar na aba
                        <MonitoramentoPaciente key={paciente.id} pacienteId={paciente.id} />
                    ) : (
                        <div className="p-10 text-slate-400">Carregando dados do paciente...</div>
                    )}
                </div>
            )}
            
            {abaAtiva === 'prancha' && (
                <GerenciadorCards paciente={paciente} />
            )}
        </div>
    </div>
  );
}