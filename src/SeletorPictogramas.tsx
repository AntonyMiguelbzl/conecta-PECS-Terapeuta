import { useState, type KeyboardEvent } from 'react';
import { buscarPictogramas } from '../src/service/arasaac';

interface SeletorProps {
  onSelect: (pictograma: any) => void;
}

export default function SeletorPictogramas({ onSelect }: SeletorProps) {
  const [termo, setTermo] = useState<string>('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleBuscar = async () => {
    if (!termo.trim()) return;
    
    setCarregando(true);
    try {
      const data = await buscarPictogramas(termo);
      setResultados(data);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBuscar();
  };

  return (
    <div className="p-4 bg-slate-800 rounded-xl">
      <div className="flex gap-2 mb-4">
        <input 
          className="p-2 rounded flex-1 bg-slate-700 text-white border border-slate-600"
          placeholder="Ex: Maçã, Brincar..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          onClick={handleBuscar} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          {carregando ? '...' : 'Buscar'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-60">
        {resultados.map((p: any) => (
          <button 
            key={p._id} 
            onClick={() => onSelect(p)}
            className="p-2 bg-white rounded flex flex-col items-center hover:bg-slate-200"
          >
            <img 
              src={`https://static.arasaac.org/pictograms/${p._id}/${p._id}_300.png`} 
              alt={p.keywords[0]?.keyword}
              className="w-16 h-16 object-contain" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}