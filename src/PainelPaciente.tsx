    import { useState } from 'react';
    import PerfilPaciente from './PerfilPaciente'; // Certifique-se do caminho correto
    import GerenciadorCards from './service/GerenciadorCards'; // Certifique-se do caminho correto

    interface Paciente {
    id: string;
    nome: string;
    }

    interface PainelProps {
    paciente: Paciente;
    aoVoltar: () => void;
    }

    export default function PainelPaciente({ paciente, aoVoltar }: PainelProps) {
    // Estado para controlar a navegação entre as abas do painel
    const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'prancha'>('perfil');

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
            <button
            onClick={() => setAbaAtiva('perfil')}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
                abaAtiva === 'perfil' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            >
            Perfil e Histórico
            </button>
            <button
            onClick={() => setAbaAtiva('prancha')}
            className={`px-6 py-3 font-bold transition-all border-b-2 ${
                abaAtiva === 'prancha' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            >
            Montar Prancha
            </button>
        </div>

        {/* Conteúdo dinâmico baseado na aba ativa */}
        <div className="mt-4">
            {abaAtiva === 'perfil' ? (
            <PerfilPaciente pacienteId={paciente.id} />
            ) : (
            <GerenciadorCards paciente={paciente} />
            )}
        </div>
        </div>
    );
    }