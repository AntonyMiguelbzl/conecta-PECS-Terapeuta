import * as Lucide from 'lucide-react';

interface CardExibicaoProps {
  label: string;
  image?: string;
  arasaacId?: string;
  icon?: string;
  color?: string; // Cor do texto/ícone
  className?: string; // Permite estilização externa extra
}

export default function CardExibicao({ 
  label, 
  image, 
  arasaacId, 
  icon, 
  color = '#475569', 
  className = '' 
}: CardExibicaoProps) {
  
  // Lógica para renderizar o ícone do Lucide caso não seja imagem
  const renderIcon = () => {
    if (!icon) return <Lucide.HelpCircle size={32} />;
    const iconName = icon.charAt(0).toUpperCase() + icon.slice(1);
    const IconComponent = (Lucide as any)[iconName];
    return IconComponent ? <IconComponent size={32} /> : <Lucide.HelpCircle size={32} />;
  };

  return (
    <div className={`flex flex-col items-center w-28 ${className}`}>
      {/* Container Principal */}
      <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center overflow-hidden relative shadow-sm">
        
        {/* Renderização da Imagem/Pictograma ou Ícone */}
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-contain" />
        ) : arasaacId ? (
          <img 
            src={`https://static.arasaac.org/pictograms/${arasaacId}/${arasaacId}_500.png`} 
            alt={label} 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div style={{ color }}>{renderIcon()}</div>
        )}

        {/* Legenda embutida na imagem */}
        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm py-1 px-1">
          <span className="text-[10px] font-bold text-white uppercase text-center block truncate leading-tight">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}