import React from 'react';
import { BaseQuestion } from '../../../types';
import { ShapeSvg, PALETTE } from '../../../lib/svg-primitives';
import { ArrowRight, HelpCircle, Compass } from 'lucide-react';

interface QuestionRendererProps {
  question: BaseQuestion;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  const { visualConfig, type } = question;
  const mode = visualConfig?.displayMode || 'default';

  // 1. Sequence Mode (Görsel Örüntü)
  if (mode === 'sequence') {
    const items = visualConfig.sequenceItems || [];
    return (
      <div className="w-full flex items-center justify-center p-3 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 max-w-full">
          {items.map((item: any, idx: number) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-center justify-center p-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <ShapeSvg kind={item.kind} style={item} size={60} />
                  </svg>
                </div>
                <span className="text-xs text-slate-600 mt-1 font-semibold">{idx + 1}. Adım</span>
              </div>

              <div className="text-slate-500 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
              </div>
            </React.Fragment>
          ))}

          {/* Missing Step '?' */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-50/70 border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center shadow-xs">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 animate-pulse" />
            </div>
            <span className="text-xs text-indigo-600 mt-1 font-bold">?</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Matrix 2x2 Mode
  if (mode === 'matrix_2x2') {
    const grid = visualConfig.grid || [];
    return (
      <div className="w-full flex items-center justify-center p-3 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 bg-slate-200/70 rounded-2xl">
          {/* Row 0, Col 0 */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-center p-2">
            {grid[0]?.[0] && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ShapeSvg kind={grid[0][0].kind} style={grid[0][0]} size={65} />
              </svg>
            )}
          </div>

          {/* Row 0, Col 1 */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-center p-2">
            {grid[0]?.[1] && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ShapeSvg kind={grid[0][1].kind} style={grid[0][1]} size={65} />
              </svg>
            )}
          </div>

          {/* Row 1, Col 0 */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-center p-2">
            {grid[1]?.[0] && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ShapeSvg kind={grid[1][0].kind} style={grid[1][0]} size={65} />
              </svg>
            )}
          </div>

          {/* Row 1, Col 1 (The Missing Question Cell) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Matrix 3x3 Mode
  if (mode === 'matrix_3x3') {
    const grid = visualConfig.grid || [];
    const color = visualConfig.color || PALETTE.indigo;
    return (
      <div className="w-full flex items-center justify-center p-3 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-slate-200/70 rounded-2xl">
          {grid.map((row: string[], rIdx: number) =>
            row.map((cell: string, cIdx: number) => {
              const isMissing = cell === '?';
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-xl flex items-center justify-center p-2 ${
                    isMissing
                      ? 'bg-indigo-50 border-2 border-dashed border-indigo-400'
                      : 'bg-white border border-slate-300 shadow-xs'
                  }`}
                >
                  {isMissing ? (
                    <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <ShapeSvg kind={cell as any} style={{ fill: color, stroke: '#1e293b' }} size={60} />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 4. Single Target Figure (Rotation)
  if (mode === 'single_target') {
    const target = visualConfig.targetItem;
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center p-3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ShapeSvg kind={target.kind} style={target} size={70} />
          </svg>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
          <Compass className="w-4 h-4" />
          <span>{visualConfig.direction} {visualConfig.rotationAngle}°</span>
        </div>
      </div>
    );
  }

  // 5. Mirror Target Mode
  if (mode === 'mirror_target') {
    const base = visualConfig.baseItem;
    const axis = visualConfig.mirrorAxis;
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex items-center justify-center p-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ShapeSvg kind={base.kind} style={base} size={65} />
            </svg>
          </div>

          {/* Mirror axis line */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-1 h-28 bg-indigo-500 rounded-full flex flex-col justify-between py-1 shadow-sm">
              <div className="w-2 h-2 bg-indigo-600 rounded-full -ml-0.5" />
              <div className="w-2 h-2 bg-indigo-600 rounded-full -ml-0.5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-700 mt-1 uppercase tracking-wider">Ayna</span>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 6. Symmetry Half Mode
  if (mode === 'symmetry_half') {
    const shape = visualConfig.halfShape;
    const color = visualConfig.color;
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="w-48 h-32 md:w-56 md:h-40 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center relative overflow-hidden">
          {/* Left half with actual shape clipped */}
          <div className="w-1/2 h-full flex items-center justify-end pr-0.5 overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform translate-x-1/2">
              <ShapeSvg kind={shape} style={{ fill: color, stroke: '#1e293b', strokeWidth: 3 }} size={75} />
            </svg>
          </div>
          {/* Center symmetry dotted line */}
          <div className="w-0.5 h-full border-r-2 border-dashed border-indigo-500 z-10" />
          {/* Right missing half */}
          <div className="w-1/2 h-full bg-indigo-50/60 flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-600">?</span>
          </div>
        </div>
      </div>
    );
  }

  // 7. Missing Corner (Parça Bütün)
  if (mode === 'missing_corner') {
    const mainShape = visualConfig.mainShape;
    const color = visualConfig.color;
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="w-36 h-36 md:w-44 md:h-44 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center p-3 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ShapeSvg kind={mainShape} style={{ fill: color, stroke: '#1e293b', strokeWidth: 3 }} size={75} />
          </svg>
          {/* Missing cut overlay badge */}
          <div className="absolute top-4 right-4 w-10 h-10 bg-slate-50 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-indigo-600">?</span>
          </div>
        </div>
      </div>
    );
  }

  // 8. Analogy Pairs (A : B :: C : ?)
  if (mode === 'analogy_pairs') {
    const { pairA, pairB, pairC } = visualConfig;
    return (
      <div className="w-full flex flex-wrap items-center justify-center gap-3 p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        {/* Pair 1: A -> B */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ShapeSvg kind={pairA.kind} style={pairA} size={65} />
            </svg>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500" />
          <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ShapeSvg kind={pairB.kind} style={pairB} size={65} />
            </svg>
          </div>
        </div>

        <span className="text-lg font-bold text-slate-400 px-1">::</span>

        {/* Pair 2: C -> ? */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ShapeSvg kind={pairC.kind} style={pairC} size={65} />
            </svg>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500" />
          <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center">
            <span className="text-base font-bold text-indigo-600">?</span>
          </div>
        </div>
      </div>
    );
  }

  // 9. Scatter Counting Arena
  if (mode === 'scatter_counting') {
    const { shape, color, coords = [] } = visualConfig;
    return (
      <div className="w-full flex items-center justify-center p-3 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="w-64 h-48 sm:w-80 sm:h-56 md:w-96 md:h-64 bg-white rounded-2xl border-2 border-slate-300 shadow-inner relative overflow-hidden p-2">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {coords.map((pt: { x: number; y: number }, idx: number) => (
              <ShapeSvg
                key={idx}
                kind={shape}
                cx={pt.x}
                cy={pt.y}
                size={16}
                style={{ fill: color, stroke: '#1e293b', strokeWidth: 1.5 }}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  }

  // 10. Number Sequence Cards
  if (mode === 'number_sequence_cards') {
    const nums = visualConfig.displayNumbers || [];
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          {nums.map((n: any, idx: number) => {
            const isMissing = n === '?';
            return (
              <React.Fragment key={idx}>
                <div
                  className={`w-14 h-16 sm:w-18 sm:h-20 md:w-20 md:h-24 rounded-2xl flex items-center justify-center font-mono font-bold text-xl sm:text-2xl shadow-xs border-2 ${
                    isMissing
                      ? 'bg-indigo-50 border-dashed border-indigo-500 text-indigo-600 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {n}
                </div>
                {idx < nums.length - 1 && (
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // 11. Symbol Coding Table Key
  if (mode === 'symbol_code_table') {
    const { mapping, targetSequence } = visualConfig;
    return (
      <div className="w-full flex flex-col items-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200 gap-4">
        {/* Key table */}
        <div className="flex items-center gap-2 sm:gap-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          {mapping.map((m: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-1 px-2 border-r last:border-0 border-slate-200">
              <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10">
                <ShapeSvg kind={m.shape} style={{ fill: m.fill, stroke: '#1e293b' }} size={70} />
              </svg>
              <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                = {m.code}
              </span>
            </div>
          ))}
        </div>

        {/* Target Sequence */}
        <div className="flex items-center gap-3 bg-indigo-50/70 px-6 py-3 rounded-2xl border border-indigo-200">
          <span className="text-sm font-semibold text-indigo-900">Soru:</span>
          {targetSequence.map((s: any, idx: number) => (
            <div key={idx} className="w-10 h-10 bg-white rounded-lg border border-indigo-200 flex items-center justify-center p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ShapeSvg kind={s.shape} style={{ fill: s.fill, stroke: '#1e293b' }} size={70} />
              </svg>
            </div>
          ))}
          <ArrowRight className="w-4 h-4 text-indigo-500" />
          <span className="text-lg font-bold font-mono text-indigo-600">?</span>
        </div>
      </div>
    );
  }

  // 12. Liquid Levels
  if (mode === 'liquid_levels') {
    const levels = visualConfig.levels || [];
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          {levels.map((lvl: number, idx: number) => {
            const fillHeight = (70 * lvl) / 100;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white rounded-xl border border-slate-300 p-2 shadow-xs">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="25" y="15" width="50" height="70" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
                      <rect x="27" y={83 - fillHeight} width="46" height={fillHeight} rx="2" fill="#06b6d4" opacity={0.85} />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 font-semibold">%{lvl}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </React.Fragment>
            );
          })}
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">?</span>
            </div>
            <span className="text-xs text-indigo-600 mt-1 font-bold">Hedef</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Options only mode (e.g. Odd One Out)
  return null;
};
