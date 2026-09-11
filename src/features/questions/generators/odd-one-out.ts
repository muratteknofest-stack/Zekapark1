import { BaseQuestion, DifficultyLevel, VisualOption } from '../../../types';
import { SeededRNG } from '../../../lib/rng';
import { generateVisualFingerprint } from '../fingerprint';
import { PALETTE } from '../../../lib/svg-primitives';
import { ShapeItem, SHAPES_POOL, ASYMMETRIC_SHAPES, COLORS_POOL } from './generator-utils';

export function generateOddOneOutQuestion(seed: number, difficulty: DifficultyLevel): BaseQuestion {
  const rng = new SeededRNG(seed);
  const ruleType = rng.nextInt(1, 4); // 1: rotation, 2: marker, 3: color/fill, 4: side count/category

  let optionsData: ShapeItem[] = [];
  let correctIdx = rng.nextInt(0, 3);
  let ruleTitle = '';
  let explanationStep = '';

  const baseColor = rng.pick(COLORS_POOL);
  const altColor = rng.pick(COLORS_POOL.filter((c) => c !== baseColor));

  if (ruleType === 1) {
    // Rotation difference: asymmetric shape rotated clockwise 90 deg steps, odd one is wrong or mirrored
    const shape = rng.pick(ASYMMETRIC_SHAPES);
    ruleTitle = 'Dönme Yönü Kuralı';
    const angles = [0, 90, 180, 270];
    const chosenAngles = rng.shuffle(angles);

    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        // Odd one: mirrored or weird angle
        optionsData.push({
          kind: shape,
          fill: baseColor,
          rotation: (chosenAngles[i] + 45) % 360,
          marker: 'none',
        });
      } else {
        optionsData.push({
          kind: shape,
          fill: baseColor,
          rotation: chosenAngles[i],
          marker: 'none',
        });
      }
    }
    explanationStep = `${String.fromCharCode(65 + correctIdx)} seçeneğindeki şekil diğerleri gibi 90° dik açılarla değil, 45° eğik bir açıyla döndürülmüştür.`;
  } else if (ruleType === 2) {
    // Marker position rule
    const shape = rng.pick(SHAPES_POOL.filter((s) => s !== 'arrow'));
    ruleTitle = 'İç Nokta Konumu';
    const normalPos: ('top' | 'right' | 'bottom' | 'left') = 'top';
    const oddPos: ('top' | 'right' | 'bottom' | 'left') = 'bottom';

    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        optionsData.push({
          kind: shape,
          fill: baseColor,
          marker: 'dot',
          markerPos: oddPos,
          markerColor: PALETTE.white,
        });
      } else {
        optionsData.push({
          kind: shape,
          fill: baseColor,
          marker: 'dot',
          markerPos: normalPos,
          markerColor: PALETTE.white,
        });
      }
    }
    explanationStep = `Diğer 3 seçenekteki işaretleyici şeklin üst kısmında yer alırken, ${String.fromCharCode(65 + correctIdx)} seçeneğinde alt kısmında yer almaktadır.`;
  } else if (ruleType === 3) {
    // Color or fill difference
    const shape = rng.pick(SHAPES_POOL);
    ruleTitle = 'Renk ve Doku Farkı';

    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        optionsData.push({
          kind: shape,
          fill: altColor,
          rotation: 0,
          marker: 'none',
        });
      } else {
        optionsData.push({
          kind: shape,
          fill: baseColor,
          rotation: 0,
          marker: 'none',
        });
      }
    }
    explanationStep = `Tüm şekiller aynı renge sahipken, yalnızca ${String.fromCharCode(65 + correctIdx)} seçeneği farklı bir renkle renklendirilmiştir.`;
  } else {
    // Shape category: 3 shapes have 4 vertices (square, diamond, trapezoid, rectangle) or circles/curves, 1 has 3 or 5
    ruleTitle = 'Şekil Türü ve Köşe Sayısı';
    const shapesWith4 = ['square', 'diamond', 'trapezoid'] as const;
    const oddShape = rng.pick(['circle', 'triangle', 'star'] as const);

    const pool = rng.shuffle([...shapesWith4]);
    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        optionsData.push({
          kind: oddShape,
          fill: baseColor,
          rotation: 0,
          marker: 'none',
        });
      } else {
        const shapeItem = pool[i % pool.length];
        optionsData.push({
          kind: shapeItem,
          fill: baseColor,
          rotation: 0,
          marker: 'none',
        });
      }
    }
    explanationStep = `Diğer tüm seçenekler 4 kenarlı/köşeli geometrik şekillerden oluşurken, ${String.fromCharCode(65 + correctIdx)} seçeneği farklı bir geometrik yapıya sahiptir.`;
  }

  // Build Visual Options
  const optionLetters = ['A', 'B', 'C', 'D'];
  const options: VisualOption[] = optionsData.map((data, idx) => ({
    id: optionLetters[idx],
    label: optionLetters[idx],
    fingerprint: generateVisualFingerprint(data),
    visualData: data,
  }));

  const correctOptionId = optionLetters[correctIdx];

  return {
    id: `ooo-${seed}-${difficulty}`,
    version: 1,
    type: 'odd_one_out',
    category: 'visual_perception',
    difficulty,
    ageGroup: difficulty <= 2 ? '1-2' : difficulty <= 4 ? '3-4' : 'all',
    prompt: 'Aşağıdaki şekillerden hangisi diğerlerinden FARKLI bir kurala sahiptir?',
    secondaryPrompt: 'Detayları, dönüş yönünü ve işaretleyicileri dikkatle incele.',
    options,
    correctOptionId,
    explanation: {
      ruleTitle,
      summary: explanationStep,
      steps: [
        'Tüm seçeneklerin ortak özelliklerini belirle (şekil türü, yön, konum).',
        '3 şeklin uyduğu ancak 1 şeklin bozduğu kuralı tespit et.',
        explanationStep,
      ],
      visualHint: {
        type: 'highlight',
        highlightOptionId: correctOptionId,
      },
    },
    estimatedSeconds: 20 + difficulty * 5,
    skills: ['Görsel Ayrıştırma', 'Kural Algılama', 'Detay Odaklanması'],
    seed,
    visualConfig: {
      displayMode: 'options_only',
      optionsData,
    },
  };
}
