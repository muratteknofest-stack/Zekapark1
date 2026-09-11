import React from 'react';
import { VisualOption } from '../../../types';
import { ShapeSvg } from '../../../lib/svg-primitives';

interface OptionRendererProps {
  option: VisualOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  showCorrect?: boolean;
  isCorrectOption?: boolean;
}

export const OptionRenderer: React.FC<OptionRendererProps> = ({
  option,
  isSelected,
  onSelect,
  disabled = false,
  showCorrect = false,
  isCorrectOption = false,
}) => {
  const { id, visualData } = option;

  // Determine badge styling based on state
  let cardBorder = 'border-slate-200 hover:border-indigo-400 bg-white shadow-xs';
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

  if (isSelected && !showCorrect) {
    cardBorder = 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20';
    badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
  } else if (showCorrect) {
    if (isCorrectOption) {
      cardBorder = 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20';
      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
    } else if (isSelected && !isCorrectOption) {
      cardBorder = 'border-rose-400 bg-rose-50 shadow-xs ring-2 ring-rose-400/20';
      badgeStyle = 'bg-rose-500 text-white border-rose-500';
    }
  }

  const renderVisualContent = () => {
    if (!visualData) return null;

    // Direct numerical or text badge (e.g. counting or number pattern)
    if (visualData.textNumber !== undefined) {
      return (
        <div className="flex items-center justify-center w-full h-20 text-2xl md:text-3xl font-bold font-mono text-slate-800">
          <span className="px-5 py-2.5 rounded-xl bg-slate-100/90 border border-slate-200 shadow-inner">
            {visualData.textNumber}
          </span>
        </div>
      );
    }

    // Stack view (spatial 3D stack)
    if (visualData.stack && Array.isArray(visualData.stack)) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-20 md:h-24">
          {visualData.stack.map((item: any, idx: number) => (
            <ShapeSvg
              key={idx}
              kind={item.kind}
              cx={50}
              cy={50}
              size={item.size}
              style={{ fill: item.fill, stroke: '#1e293b', strokeWidth: 2.5 }}
            />
          ))}
        </svg>
      );
    }

    // Liquid container level
    if (visualData.fillPercent !== undefined) {
      const pct = visualData.fillPercent;
      const fillHeight = (70 * pct) / 100;
      return (
        <svg viewBox="0 0 100 100" className="w-full h-20 md:h-24">
          {/* Glass beaker */}
          <rect x="25" y="15" width="50" height="70" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
          {/* Liquid fill */}
          <rect
            x="27"
            y={83 - fillHeight}
            width="46"
            height={fillHeight}
            rx="2"
            fill={visualData.color || '#06b6d4'}
            opacity={0.85}
          />
          {/* Beaker ticks */}
          <line x1="25" y1="32" x2="33" y2="32" stroke="#64748b" strokeWidth="2" />
          <line x1="25" y1="50" x2="35" y2="50" stroke="#64748b" strokeWidth="2" />
          <line x1="25" y1="67" x2="33" y2="67" stroke="#64748b" strokeWidth="2" />
        </svg>
      );
    }

    // Standard shape visual
    if (visualData.kind) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-20 md:h-24">
          <ShapeSvg
            kind={visualData.kind}
            cx={50}
            cy={50}
            size={visualData.size || 60}
            style={{
              fill: visualData.fill,
              stroke: visualData.stroke || '#1e293b',
              strokeWidth: 3,
              rotation: visualData.rotation || 0,
              marker: visualData.marker,
              markerColor: visualData.markerColor,
              markerPos: visualData.markerPos,
            }}
          />
        </svg>
      );
    }

    return null;
  };

  return (
    <button
      type="button"
      id={`option-card-${id}`}
      onClick={onSelect}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left w-full min-h-[110px] md:min-h-[130px] active:scale-[0.98] ${cardBorder}`}
    >
      {/* Option Identifier Badge */}
      <span
        className={`absolute top-2.5 left-2.5 flex items-center justify-center w-7 h-7 rounded-xl text-sm font-bold border transition-colors ${badgeStyle}`}
      >
        {id}
      </span>

      {/* Visual Content Render */}
      <div className="w-full flex items-center justify-center my-auto pt-2">
        {renderVisualContent()}
      </div>
    </button>
  );
};
