import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; 
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardExibicao from './CardExibicao'; // Certifique-se de que este caminho está correto

interface CardData {
  label: string;
  image?: string;
  arasaacId?: string;
  icon?: string;
  color?: string; 
  bgColor?: string;
  borderColor?: string;
  categoria?: string;
}

interface MonitoramentoProps {
  pacienteId: string;
}

export default function MonitoramentoPaciente({ pacienteId }: MonitoramentoProps) {
  const [sentence, setSentence] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pacienteId) return;

    const docRef = doc(db, 'pacientes', pacienteId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSentence(data.currentSentence || []);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao monitorar paciente:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pacienteId]);

  // Função para converter classes do Firebase para HEX
  const classToHex = (className: string | undefined) => {
    if (!className) return null;
    const map: Record<string, string> = {
      'text-amber-600': '#d97706', 'text-red-500': '#ef4444', 'text-amber-700': '#b45309',
      'text-amber-500': '#f59e0b', 'text-sky-400': '#38bdf8', 'text-orange-500': '#f97316',
      'text-blue-500': '#3b82f6', 'text-sky-600': '#0284c7', 'text-indigo-500': '#6366f1',
      'text-purple-600': '#9333ea', 'text-indigo-600': '#4f46e5', 'text-emerald-600': '#059669',
      'text-cyan-500': '#06b6d4', 'text-rose-500': '#f43f5e', 'text-rose-600': '#e11d48',
      'text-yellow-500': '#eab308', 'text-blue-400': '#60a5fa', 'text-red-600': '#dc2626',
      'text-purple-500': '#a855f7', 'text-violet-500': '#8b5cf6', 'text-emerald-700': '#047857',
      'text-pink-500': '#ec4899', 'text-pink-600': '#db2777', 'text-sky-500': '#06b6d4',
      'text-rose-400': '#fb7185'
    };
    return map[className] || null;
  };

  const getStyle = (card: CardData) => {
    return { color: classToHex(card.color) || '#475569' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Lucide.Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Lucide.Activity className="text-green-500" />
          Monitoramento em Tempo Real
        </h2>
      </div>

      {sentence.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
          <Lucide.MousePointer2 className="text-slate-300 mb-2" size={40} />
          <p className="text-slate-500 font-medium">Aguardando interação...</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <AnimatePresence>
            {sentence.map((card, idx) => {
              const style = getStyle(card);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={idx} 
                >
                  <CardExibicao 
                    label={card.label}
                    arasaacId={card.arasaacId}
                    image={card.image}
                    icon={card.icon}
                    color={style.color}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}