// ─── Types ──────────────────────────────────────────────────────────────────

export type QuestionType = 'single' | 'multi';

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  why?: string;
  type: QuestionType;
  options: QuizOption[];
  maxSelect?: number;
  optional?: boolean;
  conditional?: {
    questionId: string;
    includesAny: string[];
  };
}

export interface QuizSubSection {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface QuizSection {
  id: 'biology' | 'skin' | 'hair' | 'makeup';
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  gradient: string;
  estimatedMinutes: number;
  subSections: QuizSubSection[];
}

export type AllAnswers = Record<string, string | string[]>;

// ─── Computed Insights ───────────────────────────────────────────────────────

export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type AcneRisk = 'low' | 'moderate' | 'high';
export type HairType = 'straight' | 'wavy' | 'curly' | 'coily' | 'unknown';
export type ScalpType = 'dry' | 'balanced' | 'oily';
export type Porosity = 'low' | 'normal' | 'high';
export type DamageLevel = 'minimal' | 'slight' | 'moderate' | 'heavy';
export type Undertone = 'warm' | 'cool' | 'neutral' | 'unknown';
export type CoveragePreference = 'sheer' | 'light' | 'medium' | 'full';
export type BudgetTier = 'budget' | 'mid-range' | 'premium';
export type RoutineComplexity = 'minimal' | 'moderate' | 'extensive';

export interface QuizInsights {
  // Skin
  skinType: SkinType;
  isSensitive: boolean;
  sensitivityLevel: 'low' | 'moderate' | 'high';
  primaryConcerns: string[];
  acneRisk: AcneRisk;
  pigmentationLevel: 'none' | 'mild' | 'moderate' | 'significant';
  routineMaturity: 'beginner' | 'intermediate' | 'advanced';
  skincareMonthlyBudget: BudgetTier;
  routineComplexity: RoutineComplexity;
  barrierHealth: 'compromised' | 'fair' | 'good';
  ingredientsToAvoid: string[];
  ingredientsToSeek: string[];
  // Biology
  stressLevel: StressLevel;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  dietQuality: 'poor' | 'fair' | 'good';
  internalInflammation: 'high' | 'moderate' | 'low';
  // Hair
  hairType: HairType;
  curlPattern: string | null;
  scalpType: ScalpType;
  porosity: Porosity;
  damageLevel: DamageLevel;
  primaryHairConcerns: string[];
  haircareMonthlyBudget: BudgetTier;
  // Makeup
  undertone: Undertone;
  coveragePreference: CoveragePreference;
  makeupMonthlyBudget: BudgetTier;
  makeupFrequency: 'daily' | 'occasional' | 'rare' | 'never';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function arr(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ─── Insights Computation ────────────────────────────────────────────────────

export function computeInsights(answers: AllAnswers): QuizInsights {

  // ── Skin Type ─────────────────────────────────────────────────────────────
  const scores: Record<string, number> = { dry: 0, oily: 0, combination: 0, normal: 0 };

  const washMap: Record<string, string> = {
    tight_dry: 'dry', comfortable: 'normal',
    slightly_oily: 'combination', very_oily: 'oily',
  };
  const midMap: Record<string, string> = {
    still_dry: 'dry', balanced: 'normal',
    oily_some: 'combination', very_oily: 'oily',
  };
  const moistMap: Record<string, string> = {
    still_dry: 'dry', comfortable: 'normal',
    greasy: 'oily', oily_hour: 'oily',
  };
  const poreMap: Record<string, string> = {
    barely_visible: 'dry', noticeable_nose: 'combination',
    visible_all: 'oily', very_large: 'oily',
  };
  const flakyMap: Record<string, string> = {
    often: 'dry', sometimes: 'dry', rarely: 'normal', never: 'oily',
  };

  const wKey = washMap[answers.wash_feel as string];
  if (wKey) scores[wKey] = (scores[wKey] ?? 0) + 35;
  const mKey = midMap[answers.midday_behavior as string];
  if (mKey) scores[mKey] = (scores[mKey] ?? 0) + 25;
  const moKey = moistMap[answers.moisturizer_feel as string];
  if (moKey) scores[moKey] = (scores[moKey] ?? 0) + 20;
  const pKey = poreMap[answers.pore_size as string];
  if (pKey) scores[pKey] = (scores[pKey] ?? 0) + 10;
  const fKey = flakyMap[answers.flakiness as string];
  if (fKey) scores[fKey] = (scores[fKey] ?? 0) + 10;

  const skinType =
    (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as SkinType) || 'normal';

  // ── Sensitivity ───────────────────────────────────────────────────────────
  const sensitivitySignals = [
    answers.product_reaction === 'yes_frequently',
    arr(answers.reaction_type).some(r => ['redness', 'burning'].includes(r)),
    arr(answers.skin_conditions).some(c => ['eczema_dermatitis', 'rosacea'].includes(c)),
    answers.weather_affect === 'a_lot',
  ].filter(Boolean).length;

  const isSensitive = sensitivitySignals >= 2;
  const sensitivityLevel: 'low' | 'moderate' | 'high' =
    sensitivitySignals >= 3 ? 'high' : sensitivitySignals >= 1 ? 'moderate' : 'low';

  // ── Barrier Health ────────────────────────────────────────────────────────
  const barrierSignals = [
    answers.product_reaction === 'yes_frequently',
    answers.weather_affect === 'a_lot',
    answers.wash_feel === 'tight_dry',
    answers.moisturizer_feel === 'still_dry',
  ].filter(Boolean).length;
  const barrierHealth: QuizInsights['barrierHealth'] =
    barrierSignals >= 3 ? 'compromised' : barrierSignals >= 1 ? 'fair' : 'good';

  // ── Concerns ──────────────────────────────────────────────────────────────
  const primaryConcerns = arr(answers.main_concerns).filter(c => c !== 'none').slice(0, 3);

  // ── Acne Risk ─────────────────────────────────────────────────────────────
  const acneFreqScore: Record<string, number> = {
    rarely: 0, occasionally: 1, frequently: 2, almost_constantly: 3,
  };
  let acneScore = acneFreqScore[answers.breakout_frequency as string] ?? 0;
  if (arr(answers.stress_manifestation).includes('breakouts')) acneScore += 1;
  if (answers.dairy_frequency === 'yes_daily') acneScore += 1;
  if (['daily', 'multiple_daily'].includes(answers.sugar_intake as string)) acneScore += 1;
  if (answers.hormonal_acne === 'yes_regularly') acneScore += 1.5;
  if (answers.hormonal_acne === 'sometimes_cycle') acneScore += 0.75;
  const acneRisk: AcneRisk = acneScore >= 4 ? 'high' : acneScore >= 2 ? 'moderate' : 'low';

  // ── Pigmentation ─────────────────────────────────────────────────────────
  const pigMap: Record<string, QuizInsights['pigmentationLevel']> = {
    mostly_clear_even: 'none',
    slight_uneven: 'mild',
    visible_pigment: 'moderate',
    significant_pigment: 'significant',
  };
  const pigmentationLevel = pigMap[answers.uneven_tone as string] ?? 'none';

  // ── Routine Maturity ──────────────────────────────────────────────────────
  const hasActives = arr(answers.actives_used).some(a =>
    ['retinol', 'aha_bha', 'vitamin_c'].includes(a),
  );
  const routineStatus = answers.routine_status as string;
  let routineMaturity: QuizInsights['routineMaturity'] = 'beginner';
  if (routineStatus === 'consistent_and_regular') {
    routineMaturity = hasActives ? 'advanced' : 'intermediate';
  } else if (routineStatus === 'try_but_irregular' && hasActives) {
    routineMaturity = 'intermediate';
  }

  // ── Budget ────────────────────────────────────────────────────────────────
  const budgetMap: Record<string, BudgetTier> = {
    under_500: 'budget',
    '500_1500': 'budget',
    '1500_3000': 'mid-range',
    '3000_5000': 'premium',
    '5000_plus': 'premium',
  };
  const skincareMonthlyBudget = budgetMap[answers.skincare_budget as string] ?? 'budget';

  // ── Routine Complexity ────────────────────────────────────────────────────
  const complexityMap: Record<string, RoutineComplexity> = {
    '2_3_steps': 'minimal',
    '4_5_steps': 'moderate',
    '6_plus_steps': 'extensive',
  };
  const routineComplexity = complexityMap[answers.routine_complexity as string] ?? 'moderate';

  // ── Ingredients to Seek / Avoid ───────────────────────────────────────────
  const ingredientsToAvoid: string[] = [];
  const ingredientsToSeek: string[] = [];

  if (arr(answers.makeup_sensitivities).includes('fragrance')) {
    ingredientsToAvoid.push('Fragrance / Parfum');
  }
  if (arr(answers.makeup_sensitivities).includes('parabens')) {
    ingredientsToAvoid.push('Parabens');
  }
  if (arr(answers.makeup_sensitivities).includes('talc')) {
    ingredientsToAvoid.push('Talc');
  }
  if (isSensitive && arr(answers.reaction_type).includes('burning')) {
    if (!ingredientsToAvoid.includes('Fragrance / Parfum')) ingredientsToAvoid.push('Fragrance / Parfum');
    ingredientsToAvoid.push('High-concentration Retinol');
  }
  if (arr(answers.skin_conditions).includes('rosacea')) {
    ingredientsToAvoid.push('Denatured Alcohol');
  }
  if (skinType === 'dry' || barrierHealth === 'compromised') {
    ingredientsToSeek.push('Ceramides', 'Hyaluronic Acid', 'Glycerin', 'Squalane');
  }
  if (skinType === 'oily' || acneRisk !== 'low') {
    ingredientsToSeek.push('Niacinamide', 'Salicylic Acid', 'Zinc');
  }
  if (isSensitive) {
    ingredientsToSeek.push('Centella Asiatica', 'Allantoin', 'Panthenol');
  }

  // ── Biology ───────────────────────────────────────────────────────────────
  const sleepHoursScore: Record<string, number> = {
    under_5: 3, '5_6': 2, '6_7': 1, '7_8_plus': 0,
  };
  const wakeRestedScore: Record<string, number> = {
    never: 3, rarely: 2, sometimes: 1, always: 0,
  };
  const sleepScore =
    (sleepHoursScore[answers.sleep_hours as string] ?? 1) +
    (wakeRestedScore[answers.wake_rested as string] ?? 0);
  const sleepQuality: QuizInsights['sleepQuality'] =
    sleepScore >= 5 ? 'poor' : sleepScore >= 3 ? 'fair' : sleepScore >= 1 ? 'good' : 'excellent';

  const stressFreqMap: Record<string, number> = {
    rarely: 0, sometimes: 1, frequently: 2, almost_always: 3,
  };
  let stressScore = stressFreqMap[answers.stress_frequency as string] ?? 1;
  if (answers.sleep_schedule === 'completely_unpredictable') stressScore += 1;
  else if (answers.sleep_schedule === 'highly_irregular') stressScore += 0.5;
  const stressLevel: StressLevel =
    stressScore >= 3.5 ? 'very-high' : stressScore >= 2 ? 'high' : stressScore >= 1 ? 'moderate' : 'low';

  const dietBadSignals = [
    ['daily', 'multiple_daily'].includes(answers.sugar_intake as string),
    ['high_sugar_junk', 'mostly_outside'].includes(answers.diet_type as string),
    answers.water_intake === 'under_1l',
    ['smoke_occasionally', 'both'].includes(answers.smoking_alcohol as string),
  ].filter(Boolean).length;
  const dietQuality: QuizInsights['dietQuality'] =
    dietBadSignals >= 3 ? 'poor' : dietBadSignals >= 1 ? 'fair' : 'good';

  const internalInflammation: QuizInsights['internalInflammation'] =
    (dietQuality === 'poor' && stressLevel === 'high') || acneRisk === 'high'
      ? 'high'
      : dietQuality === 'fair' || stressLevel === 'moderate'
      ? 'moderate'
      : 'low';

  // ── Hair ──────────────────────────────────────────────────────────────────
  const hairTypeMap: Record<string, HairType> = {
    straight: 'straight', wavy: 'wavy', curly: 'curly', coily: 'coily',
  };
  const hairType = hairTypeMap[answers.hair_texture as string] ?? 'unknown';
  const curlPatternRaw = answers.curl_pattern as string;
  const curlPattern =
    curlPatternRaw && curlPatternRaw !== 'not_sure' ? curlPatternRaw : null;

  const scalpMap: Record<string, ScalpType> = {
    dry_tight: 'dry', comfortable: 'balanced',
    slightly_oily: 'oily', very_oily: 'oily',
  };
  const scalpType = scalpMap[answers.scalp_day_after as string] ?? 'balanced';

  const porositySignals: Record<Porosity, number> = { low: 0, normal: 0, high: 0 };
  const waterAbsMap: Record<string, Porosity> = {
    slow: 'low', normal: 'normal', quickly: 'high', instantly: 'high',
  };
  const dryTimeMap: Record<string, Porosity> = {
    very_long: 'low', moderate: 'normal', quick: 'high', very_fast: 'high',
  };
  const prodBehaviorMap: Record<string, Porosity> = {
    sit_top: 'low', absorb_normally: 'normal',
    absorb_quick_fade: 'high', disappear_fast: 'high',
  };
  const waPorosity = waterAbsMap[answers.water_absorption as string];
  if (waPorosity) porositySignals[waPorosity] += 2;
  const drPorosity = dryTimeMap[answers.drying_time as string];
  if (drPorosity) porositySignals[drPorosity] += 1;
  const prPorosity = prodBehaviorMap[answers.product_behavior as string];
  if (prPorosity) porositySignals[prPorosity] += 1;
  const porosity =
    (Object.entries(porositySignals).sort(([, a], [, b]) => b - a)[0][0] as Porosity) || 'normal';

  const damageMap: Record<string, DamageLevel> = {
    virgin: 'minimal', slightly_damaged: 'slight',
    moderately_damaged: 'moderate', heavily_damaged: 'heavy',
  };
  const damageLevel = damageMap[answers.overall_damage as string] ?? 'slight';

  const primaryHairConcerns = arr(answers.main_hair_concerns).slice(0, 2);

  // Derive haircare budget from skincare budget as proxy (no dedicated question)
  const haircareMonthlyBudget = budgetMap[answers.skincare_budget as string] ?? 'budget';

  // ── Makeup ────────────────────────────────────────────────────────────────
  const undertoneAnswerMap: Record<string, Undertone> = {
    warm: 'warm', cool: 'cool', neutral: 'neutral', not_sure: 'unknown',
  };
  const metalToUndertone: Record<string, Undertone> = {
    gold: 'warm', silver: 'cool', both: 'neutral', not_sure: 'neutral',
  };

  let undertone: Undertone = undertoneAnswerMap[answers.undertone as string] ?? 'unknown';
  if (undertone === 'unknown') {
    undertone = metalToUndertone[answers.metal_preference as string] ?? 'neutral';
  }

  const coverageMap: Record<string, CoveragePreference> = {
    sheer: 'sheer', light: 'light', medium: 'medium', full: 'full',
  };
  const coveragePreference = coverageMap[answers.coverage_preference as string] ?? 'light';

  const makeupBudgetMap: Record<string, BudgetTier> = {
    budget_friendly: 'budget', mid_range: 'mid-range', premium: 'premium', mix: 'mid-range',
  };
  const makeupMonthlyBudget = makeupBudgetMap[answers.makeup_budget_range as string] ?? 'budget';

  const makeupFreqMap: Record<string, QuizInsights['makeupFrequency']> = {
    daily: 'daily', few_times_week: 'occasional',
    special_occasions: 'rare', rarely_never: 'never',
  };
  const makeupFrequency = makeupFreqMap[answers.makeup_frequency_makeup as string] ?? 'occasional';

  return {
    skinType,
    isSensitive,
    sensitivityLevel,
    primaryConcerns,
    acneRisk,
    pigmentationLevel,
    routineMaturity,
    skincareMonthlyBudget,
    routineComplexity,
    barrierHealth,
    ingredientsToAvoid,
    ingredientsToSeek,
    stressLevel,
    sleepQuality,
    dietQuality,
    internalInflammation,
    hairType,
    curlPattern,
    scalpType,
    porosity,
    damageLevel,
    primaryHairConcerns,
    haircareMonthlyBudget,
    undertone,
    coveragePreference,
    makeupMonthlyBudget,
    makeupFrequency,
  };
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────

export const QUIZ_SECTIONS: QuizSection[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1: BIOLOGY
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'biology',
    title: 'Your Biology',
    tagline: 'The inside story',
    description:
      "Your skin is a mirror of what's happening inside. Sleep, stress, diet, and hormones all shape how your skin looks and behaves — and knowing this lets us give you recommendations that actually work.",
    emoji: '🧬',
    gradient: 'from-emerald-50 to-teal-50',
    estimatedMinutes: 5,
    subSections: [

      // ── 1.1 Sleep & Recovery ─────────────────────────────────────────────
      {
        id: 'sleep_recovery',
        title: 'Sleep & Recovery',
        description:
          'Your skin repairs itself while you sleep. This section helps us understand how well your body gets to do that work.',
        questions: [
          {
            id: 'sleep_hours',
            text: 'How many hours of sleep do you usually get?',
            why: 'Skin repairs itself during sleep — both quantity and consistency matter',
            type: 'single',
            options: [
              { value: 'under_5', label: 'Less than 5 hours' },
              { value: '5_6', label: '5–6 hours' },
              { value: '6_7', label: '6–7 hours' },
              { value: '7_8_plus', label: '7–8+ hours' },
            ],
          },
          {
            id: 'wake_rested',
            text: 'Do you wake up feeling rested?',
            type: 'single',
            options: [
              { value: 'always', label: 'Always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'sleep_schedule',
            text: 'How often does your sleep schedule change?',
            type: 'single',
            options: [
              { value: 'very_consistent', label: 'Very consistent' },
              { value: 'slightly_irregular', label: 'Slightly irregular' },
              { value: 'highly_irregular', label: 'Highly irregular' },
              { value: 'completely_unpredictable', label: 'Completely unpredictable' },
            ],
          },
          {
            id: 'peak_active_time',
            text: 'When do you feel most active and energetic?',
            why: 'Your chronotype affects cortisol patterns, which influences skin oiliness and acne',
            type: 'single',
            options: [
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
              { value: 'evening', label: 'Evening' },
              { value: 'night', label: 'Night' },
            ],
          },
        ],
      },

      // ── 1.2 Stress & Gut Health ───────────────────────────────────────────
      {
        id: 'stress_gut',
        title: 'Stress & Gut Health',
        description:
          'Stress and digestion are two of the biggest — and most overlooked — drivers of skin issues like acne, dullness, and inflammation.',
        questions: [
          {
            id: 'stress_frequency',
            text: 'How often do you feel stressed?',
            why: 'Stress directly triggers cortisol spikes, leading to acne, hair fall, and dullness',
            type: 'single',
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'frequently', label: 'Frequently' },
              { value: 'almost_always', label: 'Almost always' },
            ],
          },
          {
            id: 'stress_manifestation',
            text: 'How does stress usually show up for you?',
            type: 'multi',
            options: [
              { value: 'breakouts', label: 'Breakouts or flare-ups' },
              { value: 'hair_fall', label: 'Hair fall' },
              { value: 'poor_sleep', label: 'Poor sleep' },
              { value: 'digestive_issues', label: 'Digestive issues' },
            ],
          },
          {
            id: 'digestion_general',
            text: 'How would you describe your digestion generally?',
            why: 'The gut-skin axis is real — poor digestion often shows on your face',
            type: 'single',
            options: [
              { value: 'smooth_regular', label: 'Smooth and regular' },
              { value: 'bloating_gas', label: 'Bloating or gas frequently' },
              { value: 'acidity', label: 'Acidity or heartburn' },
              { value: 'irregular', label: 'Irregular (constipation or loose motion)' },
            ],
          },
          {
            id: 'gut_stress',
            text: 'When stressed, how does your gut react?',
            type: 'single',
            options: [
              { value: 'acidity_nausea', label: 'I get acidity or nausea' },
              { value: 'lose_appetite', label: 'I lose appetite completely' },
              { value: 'overeat_junk', label: 'I overeat or crave junk' },
              { value: 'no_reaction', label: 'My digestion stays unaffected' },
            ],
          },
          {
            id: 'mood_changes',
            text: 'Do you experience sudden mood changes?',
            type: 'single',
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'frequently', label: 'Frequently' },
              { value: 'almost_always', label: 'Almost always' },
            ],
          },
        ],
      },

      // ── 1.3 Diet & Nutrition ──────────────────────────────────────────────
      {
        id: 'diet_nutrition',
        title: 'Diet & Nutrition',
        description:
          'What you eat shows up on your skin — sugar, dairy, and hydration levels directly affect breakouts, dullness, and skin texture.',
        questions: [
          {
            id: 'diet_type',
            text: 'Which best describes your overall diet?',
            why: 'Diet quality is reflected in skin texture, glow, and inflammation levels',
            type: 'single',
            options: [
              { value: 'balanced_homecooked', label: 'Balanced home-cooked meals' },
              { value: 'mostly_outside', label: 'Mostly outside or processed food' },
              { value: 'high_sugar_junk', label: 'High sugar or junk intake' },
              { value: 'dieting_restrictive', label: 'Dieting or restrictive eating' },
            ],
          },
          {
            id: 'sugar_intake',
            text: 'How often do you consume sugar (desserts, soft drinks, packaged food)?',
            type: 'single',
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: '2_3_week', label: '2–3 times a week' },
              { value: 'daily', label: 'Daily' },
              { value: 'multiple_daily', label: 'Multiple times a day' },
            ],
          },
          {
            id: 'water_intake',
            text: 'How much water do you drink daily?',
            type: 'single',
            options: [
              { value: 'under_1l', label: 'Less than 1L' },
              { value: '1_2l', label: '1–2L' },
              { value: '2_3l', label: '2–3L' },
              { value: '3l_plus', label: '3L or more' },
            ],
          },
          {
            id: 'dairy_frequency',
            text: 'Do you consume dairy regularly? (milk, paneer, curd, butter, whey protein)',
            why: 'Dairy can influence hormonal acne and skin oiliness in some people',
            type: 'single',
            options: [
              { value: 'yes_daily', label: 'Yes, daily' },
              { value: 'occasionally', label: 'Occasionally (2–3 times a week)' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'dairy_free', label: 'No, completely dairy-free' },
            ],
          },
          {
            id: 'smoking_alcohol',
            text: 'Do you smoke or drink alcohol?',
            type: 'single',
            optional: true,
            options: [
              { value: 'neither', label: 'Neither' },
              { value: 'drink_occasionally', label: 'I drink occasionally' },
              { value: 'smoke_occasionally', label: 'I smoke occasionally' },
              { value: 'both', label: 'Both' },
            ],
          },
          {
            id: 'deficiencies',
            text: 'Do you have any known nutritional deficiencies?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'iron', label: 'Iron' },
              { value: 'vitamin_d_b12', label: 'Vitamin D or B12' },
              { value: 'multiple', label: 'Multiple deficiencies' },
              { value: 'none_not_sure', label: 'None or not sure' },
            ],
          },
        ],
      },

      // ── 1.4 Hormonal Health ───────────────────────────────────────────────
      {
        id: 'hormonal',
        title: 'Hormonal Health',
        description:
          'Hormones are one of the most powerful forces behind acne, hair fall, oiliness, and pigmentation. This section is optional but gives us much deeper insight.',
        questions: [
          {
            id: 'hormonal_acne',
            text: 'Do you experience hormonal acne — breakouts around the jawline or chin?',
            why: 'Jawline/chin acne is a strong signal of hormonal imbalance',
            type: 'single',
            options: [
              { value: 'yes_regularly', label: 'Yes, regularly' },
              { value: 'sometimes_cycle', label: 'Sometimes around my cycle' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'period_regularity',
            text: 'Are your periods regular?',
            type: 'single',
            optional: true,
            options: [
              { value: 'yes_regular', label: 'Yes, very regular' },
              { value: 'slightly_irregular', label: 'Slightly irregular' },
              { value: 'quite_irregular', label: 'Quite irregular' },
              { value: 'prefer_not', label: 'Prefer not to say' },
            ],
          },
          {
            id: 'hormonal_conditions',
            text: 'Do you have any diagnosed hormonal conditions?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'pcos_pcod', label: 'PCOS or PCOD' },
              { value: 'thyroid', label: 'Thyroid condition' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'medications',
            text: 'Do you take any medications regularly?',
            why: 'Certain medications directly affect skin, pigmentation, and hair',
            type: 'multi',
            optional: true,
            options: [
              { value: 'birth_control', label: 'Birth control pills' },
              { value: 'steroids_antibiotics', label: 'Steroids or antibiotics' },
              { value: 'thyroid_med', label: 'Thyroid medication' },
              { value: 'none_prefer_not', label: 'None or prefer not to say' },
            ],
          },
        ],
      },

      // ── 1.5 Body Constitution ─────────────────────────────────────────────
      {
        id: 'body_constitution',
        title: 'Body Constitution',
        description:
          'Your body type and how it responds to seasons and temperature are subtle but powerful indicators of your internal balance.',
        questions: [
          {
            id: 'body_temperature',
            text: 'Your body temperature usually feels:',
            type: 'single',
            options: [
              { value: 'always_cold', label: 'Always cold' },
              { value: 'normal', label: 'Normal' },
              { value: 'often_warm', label: 'Often warm' },
              { value: 'varies_a_lot', label: 'Varies a lot' },
            ],
          },
          {
            id: 'body_type',
            text: 'How would you describe your body type?',
            type: 'single',
            options: [
              { value: 'lean', label: 'Lean, hard to gain weight' },
              { value: 'medium', label: 'Medium and balanced' },
              { value: 'gains_easily', label: 'Gains weight easily' },
              { value: 'changed_significantly', label: 'Has changed significantly over time' },
            ],
          },
          {
            id: 'seasonal_skin',
            text: 'How does your skin behave across seasons?',
            why: 'Seasonal skin shifts reveal whether your skin is truly dry, oily, or combination',
            type: 'single',
            options: [
              { value: 'dry_winters', label: 'Very dry and tight in winters' },
              { value: 'oily_summers', label: 'Very oily and breaks out in summers' },
              { value: 'dry_and_oily', label: 'Dry in winters and oily in summers both' },
              { value: 'stays_same', label: 'Stays mostly the same year round' },
            ],
          },
        ],
      },

      // ── 1.6 Lifestyle & Environment ───────────────────────────────────────
      {
        id: 'lifestyle_environment',
        title: 'Lifestyle & Environment',
        description:
          'Your daily environment, habits, and exposure levels directly affect how fast your skin ages, how congested it gets, and how well products work for you.',
        questions: [
          {
            id: 'exercise_frequency',
            text: 'How often do you exercise?',
            why: 'Exercise improves circulation, which visibly affects skin texture and glow',
            type: 'single',
            options: [
              { value: 'regularly', label: 'Regularly (4–5 times a week)' },
              { value: 'occasionally', label: 'Occasionally (1–2 times a week)' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'screen_time',
            text: 'How much screen time do you get daily?',
            type: 'single',
            options: [
              { value: 'under_3h', label: 'Less than 3 hours' },
              { value: '3_6h', label: '3–6 hours' },
              { value: '6h_plus', label: '6+ hours' },
              { value: 'almost_all_day', label: 'Almost all day' },
            ],
          },
          {
            id: 'pollution_exposure',
            text: 'How would you rate your overall pollution and sun exposure?',
            type: 'single',
            options: [
              { value: 'low', label: 'Low — mostly indoors, minimal travel' },
              { value: 'moderate', label: 'Moderate — mix of indoors and outdoors' },
              { value: 'high', label: 'High — outdoors often, heavy commute' },
              { value: 'very_high', label: 'Very high — constant outdoor exposure' },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2: SKIN
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'skin',
    title: 'Your Skin',
    tagline: 'Know exactly what you\'re working with',
    description:
      'We go beyond "dry or oily" — understanding your barrier, sensitivity, and existing routine helps us find products that truly work for you.',
    emoji: '✨',
    gradient: 'from-rose-50 to-pink-50',
    estimatedMinutes: 7,
    subSections: [

      // ── 2.1 Skin Type ─────────────────────────────────────────────────────
      {
        id: 'skin_type_id',
        title: 'Skin Type',
        description:
          "The foundation of everything. How your skin behaves on its own — without any products — tells us more than any ingredient list ever could.",
        questions: [
          {
            id: 'wash_feel',
            text: 'How does your skin feel 30 minutes after washing with no products applied?',
            why: 'This is the most accurate self-test for skin type — no products to mask the result',
            type: 'single',
            options: [
              { value: 'tight_dry', label: 'Tight and dry' },
              { value: 'comfortable', label: 'Normal and comfortable' },
              { value: 'slightly_oily', label: 'Slightly oily in the T-zone only' },
              { value: 'very_oily', label: 'Very oily all over' },
            ],
          },
          {
            id: 'midday_behavior',
            text: 'How does your skin behave by midday?',
            type: 'single',
            options: [
              { value: 'still_dry', label: 'Still dry or tight' },
              { value: 'balanced', label: 'Balanced and comfortable' },
              { value: 'oily_some', label: 'Oily in some areas' },
              { value: 'very_oily', label: 'Very oily all over' },
            ],
          },
          {
            id: 'moisturizer_feel',
            text: 'How does your skin feel after applying moisturiser?',
            type: 'single',
            options: [
              { value: 'still_dry', label: 'Still feels dry and tight' },
              { value: 'comfortable', label: 'Feels comfortable and balanced' },
              { value: 'greasy', label: 'Feels greasy or heavy' },
              { value: 'oily_hour', label: 'Gets oily within an hour' },
            ],
          },
          {
            id: 'flakiness',
            text: 'Do you experience flakiness or dry patches?',
            type: 'single',
            options: [
              { value: 'often', label: 'Often' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'pore_size',
            text: 'How visible are your pores?',
            type: 'single',
            options: [
              { value: 'barely_visible', label: 'Barely visible' },
              { value: 'noticeable_nose', label: 'Noticeable on the nose and chin only' },
              { value: 'visible_all', label: 'Clearly visible all over' },
              { value: 'very_large', label: 'Very large and prominent' },
            ],
          },
        ],
      },

      // ── 2.2 Sensitivity & Reactivity ──────────────────────────────────────
      {
        id: 'sensitivity',
        title: 'Sensitivity & Reactivity',
        description:
          'Some skin is naturally reactive — it flushes, stings, or breaks out in response to products, weather, or stress. Knowing this helps us filter out anything that could trigger your skin.',
        questions: [
          {
            id: 'product_reaction',
            text: 'Does your skin react to new products easily?',
            type: 'single',
            options: [
              { value: 'yes_frequently', label: 'Yes, frequently' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'reaction_type',
            text: 'What kind of reactions do you usually notice?',
            type: 'multi',
            options: [
              { value: 'redness', label: 'Redness or flushing' },
              { value: 'burning', label: 'Burning or stinging' },
              { value: 'breakouts', label: 'Breakouts' },
              { value: 'no_reaction', label: 'No reaction' },
            ],
          },
          {
            id: 'weather_affect',
            text: 'Do weather or temperature changes visibly affect your skin?',
            type: 'single',
            options: [
              { value: 'a_lot', label: 'Yes, a lot' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'not_really', label: 'Not really' },
              { value: 'never_noticed', label: "Never noticed" },
            ],
          },
          {
            id: 'skin_conditions',
            text: 'Have you ever been diagnosed with a skin condition?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'eczema_dermatitis', label: 'Eczema or dermatitis' },
              { value: 'rosacea', label: 'Rosacea' },
              { value: 'psoriasis', label: 'Psoriasis' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
        ],
      },

      // ── 2.3 Skin Concerns & Goals ─────────────────────────────────────────
      {
        id: 'concerns',
        title: 'Skin Concerns & Goals',
        description:
          'This is your skin on your terms — what bothers you most and what you most want to change.',
        questions: [
          {
            id: 'skin_overall',
            text: 'How would you describe your skin overall right now?',
            type: 'single',
            options: [
              { value: 'mostly_clear', label: "My skin is mostly clear and I just want to maintain it" },
              { value: 'few_minor', label: 'I have a few minor concerns I would like to address' },
              { value: 'specific_concerns', label: 'I have specific concerns I actively want to fix' },
              { value: 'multiple_concerns', label: 'My skin has multiple concerns and needs serious attention' },
            ],
          },
          {
            id: 'main_concerns',
            text: 'What are your main skin concerns? (Select up to 3)',
            why: 'This drives your personalised product recommendations',
            type: 'multi',
            maxSelect: 3,
            options: [
              { value: 'acne', label: 'Acne and breakouts' },
              { value: 'acne_marks', label: 'Acne marks and pigmentation' },
              { value: 'dullness', label: 'Dullness' },
              { value: 'dryness', label: 'Dryness' },
              { value: 'oiliness', label: 'Oiliness' },
              { value: 'large_pores', label: 'Large pores' },
              { value: 'uneven_texture', label: 'Uneven texture' },
              { value: 'dark_circles', label: 'Dark circles' },
              { value: 'fine_lines', label: 'Fine lines and premature aging' },
              { value: 'redness', label: 'Redness and flushing' },
              { value: 'firmness', label: 'Loss of firmness' },
              { value: 'none', label: 'None — my skin is currently clear' },
            ],
          },
          {
            id: 'primary_goal',
            text: 'What is your primary skin goal right now?',
            type: 'single',
            options: [
              { value: 'clear_acne', label: 'Clear and acne-free skin' },
              { value: 'bright_glow', label: 'Bright and glowing skin' },
              { value: 'youthful_firm', label: 'Youthful and firm skin' },
              { value: 'calm_repair', label: 'Calm and repaired skin barrier' },
              { value: 'simple_healthy', label: 'Just a simple healthy routine' },
            ],
          },
        ],
      },

      // ── 2.4 Acne Deep Dive (conditional) ─────────────────────────────────
      {
        id: 'acne_dive',
        title: 'Acne Deep Dive',
        description:
          'Acne is not one size fits all. Where it appears, when it appears, and how it heals all point to very different causes — and very different solutions.',
        questions: [
          {
            id: 'breakout_frequency',
            text: 'How often do you get breakouts?',
            type: 'single',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'frequently', label: 'Frequently' },
              { value: 'almost_constantly', label: 'Almost constantly' },
            ],
          },
          {
            id: 'breakout_location',
            text: 'Where do breakouts mostly occur?',
            type: 'multi',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'forehead', label: 'Forehead' },
              { value: 'cheeks', label: 'Cheeks' },
              { value: 'jawline', label: 'Jawline and chin' },
              { value: 'all_over', label: 'All over the face' },
            ],
          },
          {
            id: 'acne_type',
            text: 'What type of acne do you usually get?',
            type: 'single',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'whiteheads_blackheads', label: 'Whiteheads or blackheads' },
              { value: 'painful_pimples', label: 'Painful red pimples' },
              { value: 'cystic', label: 'Deep cystic acne' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'breakout_timing',
            text: 'When do breakouts usually occur?',
            type: 'multi',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'no_pattern', label: 'Randomly with no pattern' },
              { value: 'hormonal', label: 'Before or during periods' },
              { value: 'food_related', label: 'After eating certain foods' },
              { value: 'stress', label: 'When stressed' },
              { value: 'product_related', label: 'After using certain products' },
            ],
          },
          {
            id: 'healing_time',
            text: 'How long do breakouts typically take to heal?',
            type: 'single',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'few_days', label: 'A few days' },
              { value: '1_2_weeks', label: '1–2 weeks' },
              { value: 'weeks_months', label: 'Weeks to months' },
              { value: 'always_leaves_marks', label: 'They always leave marks or scars' },
            ],
          },
        ],
      },

      // ── 2.5 Pigmentation & Skin Tone ─────────────────────────────────────
      {
        id: 'pigmentation',
        title: 'Pigmentation & Skin Tone',
        description:
          'Skin tone and pigmentation affect which ingredients work best for you — even if your skin is currently clear, your tone helps us recommend the right brightening and protective options.',
        questions: [
          {
            id: 'uneven_tone',
            text: 'How would you describe your overall skin tone and clarity?',
            type: 'single',
            options: [
              { value: 'mostly_clear_even', label: 'My skin tone is mostly clear and even' },
              { value: 'slight_uneven', label: 'I have slight unevenness but nothing major' },
              { value: 'visible_pigment', label: 'I have visible pigmentation or dark spots' },
              { value: 'significant_pigment', label: 'I have significant pigmentation that bothers me' },
            ],
          },
          {
            id: 'skin_tone',
            text: 'What is your skin tone?',
            type: 'single',
            options: [
              { value: 'very_fair', label: 'Very fair' },
              { value: 'fair', label: 'Fair' },
              { value: 'medium_wheatish', label: 'Medium or wheatish' },
              { value: 'dusky', label: 'Dusky' },
              { value: 'deep_dark', label: 'Deep or dark' },
            ],
          },
          {
            id: 'pigmentation_type',
            text: 'What type of pigmentation or unevenness do you notice?',
            type: 'multi',
            optional: true,
            conditional: {
              questionId: 'uneven_tone',
              includesAny: ['slight_uneven', 'visible_pigment', 'significant_pigment'],
            },
            options: [
              { value: 'acne_marks', label: 'Post-acne marks — spots left after breakouts' },
              { value: 'sun_damage', label: 'Sun tan or sun damage' },
              { value: 'melasma', label: 'Dark patches or melasma' },
              { value: 'dullness', label: 'General dullness and uneven tone' },
              { value: 'not_sure', label: 'Not sure what type it is' },
            ],
          },
          {
            id: 'pigmentation_duration',
            text: 'How long have you had this unevenness?',
            type: 'single',
            conditional: {
              questionId: 'uneven_tone',
              includesAny: ['slight_uneven', 'visible_pigment', 'significant_pigment'],
            },
            options: [
              { value: 'recent_6mo', label: 'Recent — less than 6 months' },
              { value: '6mo_2yr', label: '6 months to 2 years' },
              { value: 'over_2yr', label: 'More than 2 years' },
              { value: 'always', label: 'As long as I can remember' },
            ],
          },
          {
            id: 'summer_worse',
            text: 'Does your skin tone or pigmentation get noticeably worse in summers?',
            type: 'single',
            conditional: {
              questionId: 'uneven_tone',
              includesAny: ['slight_uneven', 'visible_pigment', 'significant_pigment'],
            },
            options: [
              { value: 'yes_significantly', label: 'Yes, significantly' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'no_difference', label: 'No difference' },
              { value: 'havent_noticed', label: "I haven't paid attention" },
            ],
          },
        ],
      },

      // ── 2.6 Current Routine & Actives ─────────────────────────────────────
      {
        id: 'routine',
        title: 'Current Routine & Actives',
        description:
          "Knowing what you already use helps us build on your routine rather than starting from scratch — and makes sure we never recommend something that clashes with what you're already doing.",
        questions: [
          {
            id: 'routine_status',
            text: 'How would you describe your current skincare routine?',
            type: 'single',
            options: [
              { value: 'consistent_and_regular', label: 'Consistent and regular' },
              { value: 'try_but_irregular', label: 'I try but it is irregular' },
              { value: 'just_starting', label: 'No routine yet — just starting out' },
              { value: 'not_interested', label: 'No routine and not interested in a long one' },
            ],
          },
          {
            id: 'products_used',
            text: 'Which products do you currently use?',
            type: 'multi',
            options: [
              { value: 'cleanser', label: 'Cleanser' },
              { value: 'moisturizer', label: 'Moisturiser' },
              { value: 'sunscreen', label: 'Sunscreen' },
              { value: 'serums', label: 'Serums or actives' },
              { value: 'none', label: 'None' },
            ],
          },
          {
            id: 'sunscreen_use',
            text: 'How often do you apply sunscreen?',
            why: 'Sunscreen use is the single most important factor in preventing premature aging and pigmentation',
            type: 'single',
            options: [
              { value: 'daily', label: 'Daily without fail' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely_never', label: 'Rarely or never' },
            ],
          },
          {
            id: 'actives_used',
            text: 'Which actives are you currently using?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'retinol', label: 'Retinol or retinoids' },
              { value: 'vitamin_c', label: 'Vitamin C' },
              { value: 'aha_bha', label: 'AHA or BHA exfoliants' },
              { value: 'niacinamide', label: 'Niacinamide' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure what actives are' },
            ],
          },
          {
            id: 'skincare_budget',
            text: 'What is your average monthly skincare budget?',
            type: 'single',
            options: [
              { value: 'under_500', label: 'Under ₹500 — I want the most affordable options' },
              { value: '500_1500', label: '₹500–₹1500 — I\'m okay spending a little for good quality' },
              { value: '1500_3000', label: '₹1500–₹3000 — I invest when it\'s worth it' },
              { value: '3000_5000', label: '₹3000–₹5000 — I regularly buy mid to premium products' },
              { value: '5000_plus', label: '₹5000+ — I buy high end and want the best dupes' },
            ],
          },
        ],
      },

      // ── 2.7 Product Preferences ───────────────────────────────────────────
      {
        id: 'preferences',
        title: 'Product Preferences',
        description:
          "Your preferences determine whether a recommendation actually fits into your life — the best product in the world is useless if you hate how it feels or how many steps it adds.",
        questions: [
          {
            id: 'texture_preference',
            text: 'What texture do you prefer in skincare products?',
            type: 'single',
            options: [
              { value: 'lightweight', label: 'Lightweight — gel or water-based' },
              { value: 'creamy_rich', label: 'Creamy and rich' },
              { value: 'no_preference', label: 'No preference' },
            ],
          },
          {
            id: 'finish_preference',
            text: 'What finish do you prefer on your skin daily?',
            type: 'single',
            options: [
              { value: 'matte', label: 'Matte' },
              { value: 'dewy_glowy', label: 'Dewy and glowy' },
              { value: 'natural_satin', label: 'Natural satin finish' },
              { value: 'no_preference', label: 'No preference' },
            ],
          },
          {
            id: 'routine_complexity',
            text: 'How extensive do you want your skincare routine to be?',
            type: 'single',
            options: [
              { value: '2_3_steps', label: 'Minimal — maximum 2 to 3 steps' },
              { value: '4_5_steps', label: 'Moderate — 4 to 5 steps' },
              { value: '6_plus_steps', label: 'Full routine — 6 or more steps' },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3: HAIR
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'hair',
    title: 'Your Hair',
    tagline: 'From root to tip',
    description:
      'Hair type, porosity, scalp health — these determine which products will actually work vs what will weigh your hair down or cause buildup.',
    emoji: '💇',
    gradient: 'from-amber-50 to-yellow-50',
    estimatedMinutes: 6,
    subSections: [

      // ── 3.1 Hair Identity ─────────────────────────────────────────────────
      {
        id: 'hair_identity',
        title: 'Hair Identity',
        description:
          'This defines your natural hair blueprint — texture, curl pattern, density, and strand type. It helps us understand how your hair behaves naturally and what it fundamentally needs.',
        questions: [
          {
            id: 'hair_texture',
            text: 'How would you describe your natural hair texture?',
            type: 'single',
            options: [
              { value: 'straight', label: 'Straight' },
              { value: 'wavy', label: 'Wavy' },
              { value: 'curly', label: 'Curly' },
              { value: 'coily', label: 'Coily' },
            ],
          },
          {
            id: 'curl_pattern',
            text: 'What is your curl pattern?',
            type: 'single',
            optional: true,
            conditional: {
              questionId: 'hair_texture',
              includesAny: ['wavy', 'curly', 'coily'],
            },
            options: [
              { value: '2_range', label: '2A / 2B / 2C — Wavy' },
              { value: '3_range', label: '3A / 3B / 3C — Curly' },
              { value: '4_range', label: '4A / 4B / 4C — Coily' },
              { value: 'not_sure', label: "Not sure" },
            ],
          },
          {
            id: 'strand_width',
            text: 'How would you describe your hair strand thickness?',
            type: 'single',
            options: [
              { value: 'very_fine', label: 'Very fine — barely visible' },
              { value: 'thin', label: 'Thin — visible but fine' },
              { value: 'medium', label: 'Medium — clearly visible' },
              { value: 'thick', label: 'Thick — clearly visible and coarse' },
            ],
          },
          {
            id: 'hair_density',
            text: 'Your hair density (volume on scalp) is:',
            type: 'single',
            options: [
              { value: 'low', label: 'Low (scalp is visible)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'very_high', label: 'Very high' },
            ],
          },
        ],
      },

      // ── 3.2 Porosity & Elasticity ─────────────────────────────────────────
      {
        id: 'porosity_elasticity',
        title: 'Porosity & Elasticity',
        description:
          'This reveals how your hair absorbs and retains moisture — the most critical factor for product selection and hydration strategy.',
        questions: [
          {
            id: 'water_absorption',
            text: 'When you apply water to your hair:',
            why: 'This is the key field test for hair porosity — a fundamental factor in product choice',
            type: 'single',
            options: [
              { value: 'slow', label: 'It takes time to get fully wet' },
              { value: 'normal', label: 'Gets wet normally' },
              { value: 'quickly', label: 'Absorbs very quickly' },
              { value: 'instantly', label: 'Absorbs instantly and feels dry again soon' },
            ],
          },
          {
            id: 'drying_time',
            text: 'How long does your hair take to air-dry?',
            type: 'single',
            options: [
              { value: 'very_long', label: 'Very long' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'quick', label: 'Quick' },
              { value: 'very_fast', label: 'Very fast' },
            ],
          },
          {
            id: 'product_behavior',
            text: 'How do products behave on your hair?',
            type: 'single',
            options: [
              { value: 'sit_top', label: 'Sit on top / feel greasy' },
              { value: 'absorb_normally', label: 'Absorb normally' },
              { value: 'absorb_quick_fade', label: "Absorb quickly but don't last" },
              { value: 'disappear_fast', label: 'Disappear very fast' },
            ],
          },
          {
            id: 'strand_elasticity',
            text: 'When you stretch a strand of hair:',
            why: 'Elasticity reveals protein-moisture balance — critical for preventing breakage',
            type: 'single',
            options: [
              { value: 'breaks_instantly', label: 'Breaks immediately' },
              { value: 'slight_stretch', label: 'Stretches slightly then breaks' },
              { value: 'stretches_returns', label: 'Stretches and returns' },
              { value: 'stretchy_weak', label: 'Very stretchy but weak' },
            ],
          },
        ],
      },

      // ── 3.3 Scalp Health ──────────────────────────────────────────────────
      {
        id: 'scalp',
        title: 'Scalp Health',
        description:
          'Healthy hair starts at the scalp. This section identifies oil balance, buildup, and underlying scalp conditions affecting growth and hair fall.',
        questions: [
          {
            id: 'scalp_day_after',
            text: 'How does your scalp feel 1 day after washing?',
            why: 'Scalp type determines shampoo frequency and the right formula for you',
            type: 'single',
            options: [
              { value: 'dry_tight', label: 'Dry / tight' },
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'slightly_oily', label: 'Slightly oily' },
              { value: 'very_oily', label: 'Very oily' },
            ],
          },
          {
            id: 'dandruff',
            text: 'Do you experience dandruff or flaking?',
            type: 'single',
            options: [
              { value: 'frequently', label: 'Frequently' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'dandruff_type',
            text: 'What type of flakes do you notice?',
            type: 'single',
            optional: true,
            conditional: {
              questionId: 'dandruff',
              includesAny: ['frequently', 'occasionally'],
            },
            options: [
              { value: 'small_white', label: 'Small dry white flakes' },
              { value: 'large_oily', label: 'Oily yellowish flakes' },
              { value: 'flakes_redness', label: 'Flakes with redness or irritation' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'scalp_itch',
            text: 'Do you feel itchiness or scalp discomfort?',
            type: 'single',
            options: [
              { value: 'often', label: 'Often' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
        ],
      },

      // ── 3.4 Hair Concerns ─────────────────────────────────────────────────
      {
        id: 'hair_concerns',
        title: 'Hair Concerns',
        description:
          'This identifies what you actually want to fix — allowing us to prioritise treatments and personalise your routine.',
        questions: [
          {
            id: 'main_hair_concerns',
            text: 'What are your main hair concerns? (Select up to 2)',
            why: 'Focusing on your top 2 gives us the clearest direction for recommendations',
            type: 'multi',
            maxSelect: 2,
            options: [
              { value: 'hair_fall', label: 'Hair fall' },
              { value: 'frizz', label: 'Frizz' },
              { value: 'dryness', label: 'Dryness' },
              { value: 'breakage', label: 'Breakage' },
              { value: 'dullness', label: 'Dullness / lack of shine' },
              { value: 'scalp_issues', label: 'Scalp issues (dandruff, oiliness)' },
              { value: 'thinning', label: 'Thinning / density loss' },
              { value: 'growth', label: 'Lack of growth or length retention' },
            ],
          },
        ],
      },

      // ── 3.5 Hair Fall Deep Dive (conditional) ─────────────────────────────
      {
        id: 'hair_fall_dive',
        title: 'Hair Fall Deep Dive',
        description:
          'Hair fall is multi-factorial — this section helps identify whether it is due to stress, genetics, scalp issues, or lifestyle.',
        questions: [
          {
            id: 'hair_fall_severity',
            text: 'How severe is your hair fall?',
            type: 'single',
            conditional: {
              questionId: 'main_hair_concerns',
              includesAny: ['hair_fall', 'thinning'],
            },
            options: [
              { value: 'minimal', label: 'Minimal' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'high', label: 'High' },
              { value: 'very_high', label: 'Very high' },
            ],
          },
          {
            id: 'hair_issue_onset',
            text: 'When did your hair fall start?',
            type: 'single',
            conditional: {
              questionId: 'main_hair_concerns',
              includesAny: ['hair_fall', 'thinning'],
            },
            options: [
              { value: 'recently', label: 'Recently' },
              { value: 'few_months', label: 'A few months ago' },
              { value: '1_2_years', label: '1–2 years ago' },
              { value: 'always', label: 'I have always had it' },
            ],
          },
          {
            id: 'hair_fall_location',
            text: 'Where do you notice hair fall most?',
            type: 'single',
            conditional: {
              questionId: 'main_hair_concerns',
              includesAny: ['hair_fall', 'thinning'],
            },
            options: [
              { value: 'all_over', label: 'All over' },
              { value: 'hairline', label: 'Hairline or temples' },
              { value: 'crown', label: 'Crown' },
              { value: 'patchy', label: 'Patchy areas' },
            ],
          },
          {
            id: 'hair_fall_trend',
            text: 'Has your hair fall changed recently compared to before?',
            type: 'single',
            conditional: {
              questionId: 'main_hair_concerns',
              includesAny: ['hair_fall', 'thinning'],
            },
            options: [
              { value: 'yes_significantly', label: 'Yes, significantly more' },
              { value: 'slightly_more', label: 'Slightly more than before' },
              { value: 'same', label: 'About the same' },
              { value: 'reduced', label: 'Actually reduced' },
            ],
          },
        ],
      },

      // ── 3.6 Hair Condition & Damage ───────────────────────────────────────
      {
        id: 'hair_condition',
        title: 'Hair Condition & Damage',
        description:
          'This reveals the current state of your hair fiber — dryness, breakage, frizz, and overall damage level.',
        questions: [
          {
            id: 'hair_feel',
            text: 'Generally, your hair feels:',
            type: 'single',
            options: [
              { value: 'very_dry', label: 'Very dry' },
              { value: 'slightly_dry', label: 'Slightly dry' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'oily', label: 'Oily' },
            ],
          },
          {
            id: 'frizz_prone',
            text: 'How prone is your hair to frizz?',
            type: 'single',
            options: [
              { value: 'very_prone', label: 'Very prone' },
              { value: 'moderately', label: 'Moderate' },
              { value: 'slightly', label: 'Slight' },
              { value: 'not_at_all', label: 'Not at all' },
            ],
          },
          {
            id: 'split_ends',
            text: 'Do you have split ends?',
            type: 'single',
            options: [
              { value: 'a_lot', label: 'A lot' },
              { value: 'some', label: 'Some' },
              { value: 'very_few', label: 'Very few' },
              { value: 'none', label: 'None' },
            ],
          },
          {
            id: 'overall_damage',
            text: 'Rate your overall hair damage:',
            why: 'Determines treatment intensity and protein / moisture balance needed',
            type: 'single',
            options: [
              { value: 'virgin', label: 'Virgin hair — never chemically treated, minimal heat' },
              { value: 'slightly_damaged', label: 'Slightly damaged — occasional heat, no chemicals' },
              { value: 'moderately_damaged', label: 'Moderately damaged — regular heat or some chemical treatment' },
              { value: 'heavily_damaged', label: 'Heavily damaged — multiple chemical treatments and regular heat' },
            ],
          },
          {
            id: 'heat_chemical_use',
            text: 'Do you use heat styling tools or chemical treatments?',
            type: 'single',
            options: [
              { value: 'frequently', label: 'Frequently' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
        ],
      },

      // ── 3.7 Hair Care Routine ─────────────────────────────────────────────
      {
        id: 'hair_routine',
        title: 'Hair Care Routine',
        description:
          'Your current habits directly shape your hair condition. This helps identify gaps, overuse, or missing steps.',
        questions: [
          {
            id: 'wash_frequency',
            text: 'How often do you wash your hair?',
            type: 'single',
            options: [
              { value: 'daily', label: 'Daily' },
              { value: '2_3_week', label: '2–3 times a week' },
              { value: 'once_week', label: 'Once a week' },
              { value: 'less_once_week', label: 'Less than once a week' },
            ],
          },
          {
            id: 'conditioner_use',
            text: 'Do you use conditioner?',
            type: 'single',
            options: [
              { value: 'always', label: 'Always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'hair_mask_frequency',
            text: 'Do you use hair masks or deep conditioning treatments?',
            type: 'single',
            options: [
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'never', label: 'Never' },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4: MAKEUP
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'makeup',
    title: 'Your Makeup',
    tagline: 'Find what actually suits you',
    description:
      'Your skin tone, undertone, and lifestyle shape which formulas and shades work for you — and which products are worth the investment.',
    emoji: '💄',
    gradient: 'from-purple-50 to-fuchsia-50',
    estimatedMinutes: 4,
    subSections: [

      // ── 4.1 Skin Tone & Undertone ─────────────────────────────────────────
      {
        id: 'tone_undertone',
        title: 'Skin Tone & Undertone',
        description:
          'This helps us match you with the right shades and avoid common issues like oxidation, ashiness, or mismatch.',
        questions: [
          {
            id: 'skin_tone_range',
            text: 'Your skin tone falls under:',
            type: 'single',
            options: [
              { value: 'fair', label: 'Fair' },
              { value: 'light_medium', label: 'Light to medium' },
              { value: 'medium_deep', label: 'Medium to deep' },
              { value: 'deep', label: 'Deep' },
            ],
          },
          {
            id: 'undertone',
            text: 'Your undertone appears:',
            why: 'Undertone determines which foundation, blush, and lip shades will complement your skin',
            type: 'single',
            options: [
              { value: 'warm', label: 'Warm (yellow / golden)' },
              { value: 'cool', label: 'Cool (pink / blue)' },
              { value: 'neutral', label: 'Neutral (mix of both)' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'metal_preference',
            text: 'Which jewelry suits you better?',
            type: 'single',
            options: [
              { value: 'gold', label: 'Gold looks better on me' },
              { value: 'silver', label: 'Silver looks better on me' },
              { value: 'both', label: 'Both look equally good' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'foundation_experience',
            text: 'How do foundation shades usually look on you?',
            type: 'single',
            options: [
              { value: 'too_pink', label: 'Always looks too pink or red' },
              { value: 'too_yellow', label: 'Always looks too yellow or orange' },
              { value: 'too_grey', label: 'Always looks too grey or ashy' },
              { value: 'matches_well', label: 'Usually matches well' },
              { value: 'never_tried', label: "I've never tried foundation" },
            ],
          },
          {
            id: 'sun_reaction',
            text: 'In sunlight, your skin:',
            type: 'single',
            options: [
              { value: 'tans_easily', label: 'Tans easily' },
              { value: 'burns_easily', label: 'Burns easily' },
              { value: 'sometimes_both', label: 'Sometimes tans, sometimes burns' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
        ],
      },

      // ── 4.2 Makeup Lifestyle & Preference ─────────────────────────────────
      {
        id: 'makeup_lifestyle',
        title: 'Makeup Lifestyle & Preference',
        description:
          "This helps us understand how makeup fits into your daily life so we don't recommend unrealistic routines.",
        questions: [
          {
            id: 'makeup_frequency_makeup',
            text: 'How often do you wear makeup?',
            type: 'single',
            options: [
              { value: 'daily', label: 'Daily' },
              { value: 'few_times_week', label: 'A few times a week' },
              { value: 'special_occasions', label: 'Special occasions only' },
              { value: 'rarely_never', label: 'Rarely or never' },
            ],
          },
          {
            id: 'makeup_occasions',
            text: 'Where do you usually wear makeup?',
            type: 'single',
            options: [
              { value: 'work_college', label: 'Daily — work or college' },
              { value: 'social_outings', label: 'Social outings' },
              { value: 'special_only', label: 'Special events only' },
              { value: 'home_fun', label: 'For fun or at home' },
            ],
          },
          {
            id: 'everyday_vibe',
            text: 'Your everyday makeup vibe is:',
            type: 'single',
            options: [
              { value: 'natural', label: 'Natural / no-makeup makeup' },
              { value: 'soft_glam', label: 'Soft glam' },
              { value: 'full_glam', label: 'Full glam' },
              { value: 'dont_use', label: "I don't use makeup regularly" },
            ],
          },
          {
            id: 'preferred_look',
            text: 'You prefer your makeup to look:',
            type: 'single',
            options: [
              { value: 'minimal', label: 'Very minimal' },
              { value: 'balanced', label: 'Balanced and polished' },
              { value: 'bold', label: 'Bold and noticeable' },
              { value: 'depends', label: 'Depends on the occasion' },
            ],
          },
        ],
      },

      // ── 4.3 Coverage & Finish Preferences ────────────────────────────────
      {
        id: 'coverage_finish',
        title: 'Coverage & Finish Preferences',
        description:
          'Defines how your base should look and feel — this directly impacts product type and layering.',
        questions: [
          {
            id: 'coverage_preference',
            text: 'Your preferred base coverage:',
            type: 'single',
            options: [
              { value: 'sheer', label: 'Sheer / tint' },
              { value: 'light', label: 'Light' },
              { value: 'medium', label: 'Medium' },
              { value: 'full', label: 'Full coverage' },
            ],
          },
          {
            id: 'finish_preference_makeup',
            text: 'Finish you like most:',
            type: 'single',
            options: [
              { value: 'dewy', label: 'Dewy / glowing' },
              { value: 'natural', label: 'Natural skin-like' },
              { value: 'matte', label: 'Matte' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'wear_duration',
            text: 'How long do you need your makeup to last?',
            type: 'single',
            options: [
              { value: '2_4h', label: '2–4 hours' },
              { value: '4_8h', label: '4–8 hours' },
              { value: '8_12h', label: '8–12 hours' },
              { value: '12h_plus', label: 'All day and night (12+ hours)' },
            ],
          },
          {
            id: 'set_makeup',
            text: 'Do you set your makeup?',
            type: 'single',
            options: [
              { value: 'powder', label: 'Yes, always with setting powder' },
              { value: 'spray', label: 'Yes, with setting spray' },
              { value: 'both', label: 'Both powder and spray' },
              { value: 'skip', label: 'No, I skip this step' },
            ],
          },
        ],
      },

      // ── 4.4 Product Behavior & Struggles ─────────────────────────────────
      {
        id: 'struggles',
        title: 'Product Behavior & Struggles',
        description:
          "This tells us where you face problems so we can fix technique, product type, or routine gaps.",
        questions: [
          {
            id: 'makeup_struggles',
            text: 'What do you struggle with most?',
            type: 'single',
            options: [
              { value: 'shade_matching', label: 'Shade matching' },
              { value: 'longevity', label: "Makeup doesn't last" },
              { value: 'blending', label: 'Blending' },
              { value: 'choosing', label: 'Choosing the right products' },
            ],
          },
          {
            id: 'most_important_area',
            text: 'Which product area matters most to you?',
            type: 'single',
            options: [
              { value: 'base', label: 'Base (foundation / concealer)' },
              { value: 'eyes', label: 'Eyes' },
              { value: 'lips', label: 'Lips' },
              { value: 'minimal', label: 'Minimal / all-in-one' },
            ],
          },
          {
            id: 'confused_about',
            text: 'Which category confuses you the most when buying?',
            type: 'single',
            options: [
              { value: 'foundation', label: 'Foundation shade and formula' },
              { value: 'concealer', label: 'Concealer shade and type' },
              { value: 'blush_bronzer', label: 'Blush and bronzer' },
              { value: 'eye_makeup', label: 'Eye makeup' },
              { value: 'lip_shades', label: 'Lip shades for my skin tone' },
            ],
          },
          {
            id: 'uses_primer',
            text: 'Do you use primer?',
            type: 'single',
            options: [
              { value: 'yes_always', label: 'Yes, always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'want_to_start', label: 'No, but I want to start' },
              { value: 'no_interest', label: 'No and not interested' },
            ],
          },
        ],
      },

      // ── 4.5 Style Preferences ─────────────────────────────────────────────
      {
        id: 'style_preferences',
        title: 'Style Preferences',
        description:
          'Helps personalise your look — whether you lean natural, bold, or feature-focused.',
        questions: [
          {
            id: 'lip_shades',
            text: 'Lip shades you prefer:',
            type: 'single',
            options: [
              { value: 'nude', label: 'Nude tones' },
              { value: 'pink_mauve', label: 'Pink / mauve' },
              { value: 'bold', label: 'Bold (red / berry)' },
              { value: 'gloss_clear', label: 'Gloss / clear' },
            ],
          },
          {
            id: 'eye_makeup_style',
            text: 'Eye makeup preference:',
            type: 'single',
            options: [
              { value: 'bare_minimal', label: 'Minimal' },
              { value: 'soft_definition', label: 'Soft definition' },
              { value: 'smokey_glam', label: 'Smokey / glam' },
              { value: 'graphic', label: 'Experimental / graphic' },
            ],
          },
          {
            id: 'makeup_goal',
            text: 'What is your main goal with makeup?',
            type: 'single',
            options: [
              { value: 'enhance_natural', label: 'Enhance natural features' },
              { value: 'look_polished', label: 'Look polished' },
              { value: 'bold_glam', label: 'Look bold or glamorous' },
              { value: 'keep_simple', label: 'Keep it simple' },
            ],
          },
        ],
      },

      // ── 4.6 Skin Compatibility with Makeup ───────────────────────────────
      {
        id: 'skin_makeup_compat',
        title: 'Skin Compatibility',
        description:
          'This is critical — it ensures makeup recommendations do not damage your skin or worsen existing concerns.',
        questions: [
          {
            id: 'makeup_feel',
            text: 'Your makeup usually feels:',
            type: 'single',
            options: [
              { value: 'heavy_clogging', label: 'Heavy / clogging' },
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'drying', label: 'Drying' },
              { value: 'oily_shiny', label: 'Oily / shiny' },
            ],
          },
          {
            id: 'makeup_breakouts',
            text: 'Do you break out due to makeup?',
            type: 'single',
            options: [
              { value: 'often', label: 'Often' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'oxidation',
            text: 'Does your makeup oxidise during the day? (turn darker or more orange)',
            type: 'single',
            options: [
              { value: 'yes_always', label: 'Yes, always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'not_sure', label: "Not sure / I don't notice" },
            ],
          },
          {
            id: 'transfer',
            text: 'Does your makeup transfer or rub off easily?',
            type: 'single',
            options: [
              { value: 'yes_quickly', label: 'Yes, very quickly' },
              { value: 'few_hours', label: 'After a few hours' },
              { value: 'mostly_stays', label: 'Mostly stays put' },
              { value: 'never', label: 'Never transfers' },
            ],
          },
          {
            id: 'makeup_sensitivities',
            text: 'Any known makeup ingredient sensitivities?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'fragrance', label: 'Fragrance' },
              { value: 'talc', label: 'Talc' },
              { value: 'parabens', label: 'Parabens' },
              { value: 'none_known', label: 'None known' },
            ],
          },
        ],
      },

      // ── 4.7 Budget & Buying Behaviour ─────────────────────────────────────
      {
        id: 'budget_buying',
        title: 'Budget & Buying Behaviour',
        description:
          'Helps us recommend realistic options — not just ideal ones.',
        questions: [
          {
            id: 'makeup_budget_range',
            text: 'Your budget preference:',
            type: 'single',
            options: [
              { value: 'budget_friendly', label: 'Budget-friendly' },
              { value: 'mid_range', label: 'Mid-range' },
              { value: 'premium', label: 'Premium' },
              { value: 'mix', label: 'Mix of all' },
            ],
          },
          {
            id: 'product_choice_method',
            text: 'How do you usually choose products?',
            type: 'single',
            options: [
              { value: 'trends', label: 'Trends / social media' },
              { value: 'reviews', label: 'Reviews and ratings' },
              { value: 'brand_loyalty', label: 'Brand loyalty' },
              { value: 'trial_error', label: 'Trial and error' },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns all visible questions for a section (respecting conditionals) */
export function getVisibleQuestions(
  section: QuizSection,
  answers: AllAnswers,
): QuizQuestion[] {
  return section.subSections.flatMap(ss =>
    ss.questions.filter(q => {
      if (!q.conditional) return true;
      const val = answers[q.conditional.questionId];
      if (!val) return false;
      const vals = Array.isArray(val) ? val : [val];
      return q.conditional.includesAny.some(v => vals.includes(v));
    }),
  );
}

/** Total answerable question count across all sections */
export function getTotalQuestions(answers: AllAnswers): number {
  return QUIZ_SECTIONS.reduce(
    (sum, s) => sum + getVisibleQuestions(s, answers).length,
    0,
  );
}

/** Count of answered questions across all sections */
export function getAnsweredCount(answers: AllAnswers): number {
  return Object.keys(answers).length;
}
