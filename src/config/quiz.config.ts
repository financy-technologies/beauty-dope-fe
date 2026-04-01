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

// ─── Insights Computation ────────────────────────────────────────────────────

function pick<T>(map: Record<string, T>, val: string | string[] | undefined, fallback: T): T {
  if (!val) return fallback;
  const key = Array.isArray(val) ? val[0] : val;
  return key in map ? map[key] : fallback;
}

function arr(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export function computeInsights(answers: AllAnswers): QuizInsights {
  // ── Skin Type ────────────────────────────────────────────────────────────
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

  const skinType = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as SkinType) || 'normal';

  // Sensitivity detection
  const sensitivitySignals = [
    answers.product_reaction === 'yes_frequently',
    answers.flush_red === 'yes_easily',
    arr(answers.skin_conditions).some(c => ['eczema', 'rosacea', 'dermatitis'].includes(c)),
    arr(answers.reaction_type).some(r => ['redness', 'burning'].includes(r)),
  ].filter(Boolean).length;
  const isSensitive = sensitivitySignals >= 2;
  const sensitivityLevel = sensitivitySignals >= 3 ? 'high' : sensitivitySignals >= 1 ? 'moderate' : 'low';

  // Barrier health
  const barrierSignals = [
    answers.product_reaction === 'yes_frequently',
    answers.irritation_duration === 'days',
    answers.wash_feel === 'tight_dry',
    answers.moisturizer_feel === 'still_dry',
  ].filter(Boolean).length;
  const barrierHealth = barrierSignals >= 3 ? 'compromised' : barrierSignals >= 1 ? 'fair' : 'good';

  // Primary concerns
  const primaryConcerns = arr(answers.main_concerns).slice(0, 3);

  // Acne risk
  const acneFreqScore: Record<string, number> = { rarely: 0, occasionally: 1, frequently: 2, constant: 3 };
  let acneScore = acneFreqScore[answers.breakout_frequency as string] ?? 0;
  if (arr(answers.stress_effects).includes('breakouts')) acneScore += 1;
  if (answers.dairy_frequency === 'yes_daily') acneScore += 1;
  if (answers.sugar_intake === 'daily') acneScore += 1;
  if (answers.hormonal_acne === 'yes') acneScore += 1.5;
  const acneRisk: AcneRisk = acneScore >= 4 ? 'high' : acneScore >= 2 ? 'moderate' : 'low';

  // Pigmentation
  const pigMap: Record<string, QuizInsights['pigmentationLevel']> = {
    yes_clearly: 'significant', slightly: 'mild', no: 'none',
  };
  const pigmentationLevel = pigMap[answers.uneven_tone as string] ?? 'none';

  // Routine maturity
  const maturityMap: Record<string, QuizInsights['routineMaturity']> = {
    just_starting: 'beginner', under_6mo: 'beginner',
    '6mo_2yr': 'intermediate', over_2yr: 'advanced',
  };
  const routineMaturity = maturityMap[answers.routine_duration as string] ?? 'beginner';

  // Budget
  const budgetMap: Record<string, BudgetTier> = {
    under_500: 'budget', '500_1500': 'budget',
    '1500_3000': 'mid-range', '3000_plus': 'premium',
  };
  const skincareMonthlyBudget = budgetMap[answers.skincare_budget as string] ?? 'budget';

  // Routine complexity preference
  const complexityMap: Record<string, RoutineComplexity> = {
    '2_3_steps': 'minimal', '4_5_steps': 'moderate', '6_plus_steps': 'extensive',
  };
  const routineComplexity = complexityMap[answers.routine_complexity as string] ?? 'moderate';

  // Ingredients to avoid / seek
  const ingredientsToAvoid: string[] = [];
  const ingredientsToSeek: string[] = [];
  if (arr(answers.known_allergies).includes('fragrance')) ingredientsToAvoid.push('Fragrance/Parfum');
  if (arr(answers.known_allergies).includes('essential_oils')) ingredientsToAvoid.push('Essential Oils');
  if (arr(answers.known_allergies).includes('alcohol')) ingredientsToAvoid.push('Denatured Alcohol');
  if (arr(answers.known_allergies).includes('sulfates')) ingredientsToAvoid.push('Sodium Lauryl Sulfate');
  if (skinType === 'dry' || barrierHealth === 'compromised') {
    ingredientsToSeek.push('Ceramides', 'Hyaluronic Acid', 'Glycerin', 'Squalane');
  }
  if (skinType === 'oily' || acneRisk !== 'low') {
    ingredientsToSeek.push('Niacinamide', 'Salicylic Acid', 'Zinc');
  }
  if (isSensitive) {
    ingredientsToSeek.push('Centella Asiatica', 'Allantoin', 'Panthenol');
    ingredientsToAvoid.push('Synthetic Fragrance', 'High-concentration Retinol');
  }

  // ── Biology ──────────────────────────────────────────────────────────────
  const sleepMap: Record<string, number> = { 'under_5': 3, '5_6': 2, '6_7': 1, '7_8_plus': 0 };
  const sleepScore = (sleepMap[answers.sleep_hours as string] ?? 1)
    + (answers.wake_rested === 'rarely' ? 2 : answers.wake_rested === 'sometimes' ? 1 : 0);
  const sleepQuality: QuizInsights['sleepQuality'] = sleepScore >= 4 ? 'poor' : sleepScore >= 2 ? 'fair' : sleepScore >= 1 ? 'good' : 'excellent';

  const stressFreqMap: Record<string, number> = { rarely: 0, sometimes: 1, frequently: 2, almost_always: 3 };
  const stressScore = (stressFreqMap[answers.stress_frequency as string] ?? 1)
    + (answers.sleep_consistency === 'highly_irregular' ? 1 : 0);
  const stressLevel: StressLevel = stressScore >= 3 ? 'very-high' : stressScore >= 2 ? 'high' : stressScore >= 1 ? 'moderate' : 'low';

  const dietBadSignals = [
    answers.sugar_intake === 'daily',
    answers.diet_type === 'high_sugar_junk',
    answers.skip_meals === 'often',
    answers.water_intake === 'under_1l',
    answers.alcohol === 'regularly' || answers.alcohol === 'daily',
  ].filter(Boolean).length;
  const dietQuality: QuizInsights['dietQuality'] = dietBadSignals >= 3 ? 'poor' : dietBadSignals >= 1 ? 'fair' : 'good';

  const internalInflammation: QuizInsights['internalInflammation'] =
    (dietQuality === 'poor' && stressLevel === 'high') || acneRisk === 'high' ? 'high'
    : dietQuality === 'fair' || stressLevel === 'moderate' ? 'moderate' : 'low';

  // ── Hair ─────────────────────────────────────────────────────────────────
  const hairTypeMap: Record<string, HairType> = {
    straight: 'straight', wavy: 'wavy', curly: 'curly', coily: 'coily',
  };
  const hairType = hairTypeMap[answers.hair_texture as string] ?? 'unknown';
  const curlPattern = (answers.curl_pattern as string) ?? null;

  const scalpMap: Record<string, ScalpType> = {
    dry_tight: 'dry', comfortable: 'balanced',
    slightly_oily: 'oily', very_oily: 'oily',
  };
  const scalpType = scalpMap[answers.scalp_day_after as string] ?? 'balanced';

  // Porosity from multiple signals
  const porositySignals: Record<Porosity, number> = { low: 0, normal: 0, high: 0 };
  const waterAbsMap: Record<string, Porosity> = {
    slow: 'low', normal: 'normal', quickly: 'high', instantly: 'high',
  };
  const dryMap: Record<string, Porosity> = { very_long: 'low', moderate: 'normal', quick: 'high', very_fast: 'high' };
  const prodMap: Record<string, Porosity> = { sit_top: 'low', absorb_normally: 'normal', absorb_quick_fade: 'high', disappear_fast: 'high' };
  const waPorosity = waterAbsMap[answers.water_absorption as string];
  if (waPorosity) porositySignals[waPorosity] += 2;
  const drPorosity = dryMap[answers.drying_time as string];
  if (drPorosity) porositySignals[drPorosity] += 1;
  const prPorosity = prodMap[answers.product_behavior as string];
  if (prPorosity) porositySignals[prPorosity] += 1;
  const porosity = (Object.entries(porositySignals).sort(([, a], [, b]) => b - a)[0][0] as Porosity) || 'normal';

  const damageMap: Record<string, DamageLevel> = {
    virgin: 'minimal', slightly_damaged: 'slight',
    moderately_damaged: 'moderate', heavily_damaged: 'heavy',
  };
  const damageLevel = damageMap[answers.overall_damage as string] ?? 'slight';

  const primaryHairConcerns = arr(answers.main_hair_concerns).slice(0, 2);

  const hairBudgetMap: Record<string, BudgetTier> = {
    under_300: 'budget', '300_800': 'budget',
    '800_1500': 'mid-range', '1500_plus': 'premium',
  };
  const haircareMonthlyBudget = hairBudgetMap[answers.haircare_budget as string] ?? 'budget';

  // ── Makeup ───────────────────────────────────────────────────────────────
  const undertoneMap: Record<string, Undertone> = {
    warm: 'warm', cool: 'cool', neutral: 'neutral', not_sure: 'unknown',
  };
  const undertoneTestMap: Record<string, Undertone> = {
    blue_purple: 'cool', green: 'warm', mix: 'neutral',
  };
  const metalMap: Record<string, Undertone> = { gold: 'warm', silver: 'cool', both: 'neutral' };

  let undertone: Undertone = undertoneMap[answers.undertone as string] ?? 'unknown';
  if (undertone === 'unknown') {
    undertone = undertoneTestMap[answers.undertone_test as string]
      ?? metalMap[answers.metal_preference as string]
      ?? 'neutral';
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
  // ── SECTION 1: Biology ──────────────────────────────────────────────────
  {
    id: 'biology',
    title: 'Your Biology',
    tagline: 'The inside story',
    description: 'Your skin is a mirror of what\'s happening inside. Sleep, stress, diet, and hormones all shape how your skin looks and behaves.',
    emoji: '🧬',
    gradient: 'from-emerald-50 to-teal-50',
    estimatedMinutes: 5,
    subSections: [
      {
        id: 'daily_rhythm',
        title: 'Daily Rhythm & Energy',
        questions: [
          {
            id: 'energy_level',
            text: 'How would you describe your energy levels throughout the day?',
            why: 'Reveals internal balance, fatigue patterns, and repair cycles',
            type: 'single',
            options: [
              { value: 'consistent', label: 'Consistent' },
              { value: 'peaks_crashes', label: 'Peaks and crashes' },
              { value: 'low_most', label: 'Low most of the time' },
              { value: 'high_restless', label: 'High but restless' },
            ],
          },
          {
            id: 'peak_time',
            text: 'When do you feel most active?',
            type: 'single',
            options: [
              { value: 'morning', label: 'Morning' },
              { value: 'afternoon', label: 'Afternoon' },
              { value: 'evening_night', label: 'Evening / night' },
            ],
          },
          {
            id: 'sleep_hours',
            text: 'How many hours of sleep do you usually get?',
            why: 'Skin repairs itself during sleep — quality and quantity both matter',
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
            ],
          },
          {
            id: 'sleep_consistency',
            text: 'How often does your sleep schedule change?',
            type: 'single',
            options: [
              { value: 'very_consistent', label: 'Very consistent' },
              { value: 'slightly_irregular', label: 'Slightly irregular' },
              { value: 'highly_irregular', label: 'Highly irregular' },
            ],
          },
        ],
      },
      {
        id: 'stress',
        title: 'Stress & Mental State',
        questions: [
          {
            id: 'stress_frequency',
            text: 'How often do you feel stressed?',
            why: 'Stress directly triggers acne, hair fall, and dullness',
            type: 'single',
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'frequently', label: 'Frequently' },
              { value: 'almost_always', label: 'Almost always' },
            ],
          },
          {
            id: 'stress_effects',
            text: 'How does stress usually affect you?',
            type: 'multi',
            options: [
              { value: 'breakouts', label: 'Breakouts' },
              { value: 'hair_fall', label: 'Hair fall' },
              { value: 'poor_sleep', label: 'Poor sleep' },
              { value: 'anxiety', label: 'Overthinking / anxiety' },
              { value: 'no_effect', label: 'No visible effect' },
            ],
          },
          {
            id: 'mood_changes',
            text: 'Do you experience sudden mood changes?',
            type: 'single',
            options: [
              { value: 'no', label: 'No' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'frequently', label: 'Frequently' },
            ],
          },
          {
            id: 'digestion_general',
            text: 'How would you describe your digestion generally?',
            why: 'The gut-skin axis is real — poor digestion shows on your face',
            type: 'single',
            options: [
              { value: 'smooth_regular', label: 'Smooth and regular' },
              { value: 'bloating_gas', label: 'Bloating or gas frequently' },
              { value: 'acidity', label: 'Acidity or heartburn' },
              { value: 'irregular', label: 'Irregular (constipation or loose stools)' },
              { value: 'never_notice', label: "I never pay attention to it" },
            ],
          },
          {
            id: 'stress_gut',
            text: 'When stressed, does your gut react?',
            type: 'single',
            options: [
              { value: 'acidity_nausea', label: 'Yes — acidity or nausea' },
              { value: 'lose_appetite', label: 'Yes — lose appetite completely' },
              { value: 'overeat_junk', label: 'Yes — overeat or crave junk' },
              { value: 'no_reaction', label: 'No — digestion stays unaffected' },
            ],
          },
        ],
      },
      {
        id: 'diet',
        title: 'Diet & Nutrition',
        questions: [
          {
            id: 'diet_type',
            text: 'Which best describes your diet?',
            why: 'What you eat is reflected in your skin texture and glow',
            type: 'single',
            options: [
              { value: 'balanced_homecooked', label: 'Balanced home-cooked' },
              { value: 'mostly_outside', label: 'Mostly outside / processed food' },
              { value: 'high_sugar_junk', label: 'High sugar / junk intake' },
              { value: 'dieting_restrictive', label: 'Dieting / restrictive' },
            ],
          },
          {
            id: 'sugar_intake',
            text: 'How often do you consume sugar (desserts, soft drinks)?',
            type: 'single',
            options: [
              { value: 'rarely', label: 'Rarely' },
              { value: '2_3_week', label: '2–3 times a week' },
              { value: 'daily', label: 'Daily' },
            ],
          },
          {
            id: 'water_intake',
            text: 'How much water do you drink per day?',
            type: 'single',
            options: [
              { value: 'under_1l', label: 'Less than 1L' },
              { value: '1_2l', label: '1–2L' },
              { value: '2_3l', label: '2–3L' },
              { value: '3l_plus', label: '3L+' },
            ],
          },
          {
            id: 'skip_meals',
            text: 'Do you skip meals frequently?',
            type: 'single',
            options: [
              { value: 'never', label: 'Never' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'often', label: 'Often' },
            ],
          },
          {
            id: 'deficiencies',
            text: 'Any known deficiencies?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'iron', label: 'Iron' },
              { value: 'vitamin_d', label: 'Vitamin D' },
              { value: 'b12', label: 'B12' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'dairy_frequency',
            text: 'Do you consume dairy regularly? (milk, cheese, paneer, curd, butter, whey)',
            why: 'Dairy can influence hormonal acne and skin oiliness in some people',
            type: 'single',
            options: [
              { value: 'yes_daily', label: 'Yes, daily' },
              { value: 'occasionally', label: 'Occasionally (2–3 times a week)' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'dairy_free', label: 'No, I am dairy-free' },
            ],
          },
          {
            id: 'dairy_type',
            text: 'What type of dairy do you mostly consume?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'dairy_frequency', includesAny: ['yes_daily', 'occasionally'] },
            options: [
              { value: 'full_fat', label: 'Full fat (whole milk, paneer, butter)' },
              { value: 'low_fat', label: 'Low fat (skimmed milk, low fat curd)' },
              { value: 'fermented', label: 'Fermented (curd/yogurt, chaach)' },
              { value: 'protein_based', label: 'Protein-based (whey, casein)' },
            ],
          },
          {
            id: 'alcohol',
            text: 'Do you consume alcohol?',
            type: 'single',
            optional: true,
            options: [
              { value: 'never', label: 'Never' },
              { value: 'occasionally', label: 'Occasionally (social / weekends)' },
              { value: 'regularly', label: 'Regularly (3–4 times a week)' },
              { value: 'daily', label: 'Daily' },
            ],
          },
        ],
      },
      {
        id: 'hormonal',
        title: 'Hormonal & Body Signals',
        questions: [
          {
            id: 'hormonal_acne',
            text: 'Do you experience hormonal acne (jawline / chin area)?',
            type: 'single',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'period_regularity',
            text: 'Are your periods regular?',
            type: 'single',
            optional: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'prefer_not', label: 'Prefer not to say' },
            ],
          },
          {
            id: 'hormonal_conditions',
            text: 'Any diagnosed hormonal conditions?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'pcos_pcod', label: 'PCOS / PCOD' },
              { value: 'thyroid', label: 'Thyroid' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'medications',
            text: 'Do you take any medications regularly?',
            why: 'Certain medications affect skin, pigmentation, and hair directly',
            type: 'multi',
            optional: true,
            options: [
              { value: 'birth_control', label: 'Birth control pills' },
              { value: 'steroids', label: 'Steroids or immunosuppressants' },
              { value: 'antibiotics', label: 'Antibiotics (long-term)' },
              { value: 'thyroid_med', label: 'Thyroid medication' },
              { value: 'none', label: 'None' },
              { value: 'prefer_not', label: 'Prefer not to say' },
            ],
          },
          {
            id: 'medication_duration',
            text: 'How long have you been on this medication?',
            type: 'single',
            optional: true,
            conditional: {
              questionId: 'medications',
              includesAny: ['birth_control', 'steroids', 'antibiotics', 'thyroid_med'],
            },
            options: [
              { value: 'under_3mo', label: 'Less than 3 months' },
              { value: '3_6mo', label: '3–6 months' },
              { value: '6mo_1yr', label: '6 months to a year' },
              { value: 'over_1yr', label: 'More than a year' },
            ],
          },
        ],
      },
      {
        id: 'physical',
        title: 'Physical Tendencies',
        questions: [
          {
            id: 'body_temp',
            text: 'Your body temperature usually feels:',
            type: 'single',
            options: [
              { value: 'cold', label: 'Cold' },
              { value: 'normal', label: 'Normal' },
              { value: 'warm', label: 'Warm' },
            ],
          },
          {
            id: 'digestion_speed',
            text: 'Your digestion is:',
            type: 'single',
            options: [
              { value: 'fast', label: 'Fast (hungry often)' },
              { value: 'slow', label: 'Slow (feel heavy)' },
              { value: 'irregular', label: 'Irregular' },
            ],
          },
          {
            id: 'body_type',
            text: 'How would you describe your body type?',
            type: 'single',
            options: [
              { value: 'lean', label: 'Lean, hard to gain weight' },
              { value: 'medium', label: 'Medium, balanced' },
              { value: 'gains_easily', label: 'Gains weight easily' },
            ],
          },
          {
            id: 'season_skin',
            text: 'How does your skin behave across seasons?',
            type: 'single',
            options: [
              { value: 'dry_winters', label: 'Gets very dry, flaky and tight in winters' },
              { value: 'oily_summers', label: 'Gets very oily and breaks out in summers' },
              { value: 'stays_same', label: 'Stays mostly the same year round' },
              { value: 'dry_and_oily', label: 'Dry in winters AND oily in summers both' },
            ],
          },
        ],
      },
      {
        id: 'lifestyle',
        title: 'Lifestyle & External Factors',
        questions: [
          {
            id: 'exercise',
            text: 'How often do you exercise?',
            type: 'single',
            options: [
              { value: 'regularly', label: 'Regularly (4–5× a week)' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
            ],
          },
          {
            id: 'screen_time',
            text: 'Your daily screen time:',
            type: 'single',
            options: [
              { value: 'under_3h', label: 'Under 3 hours' },
              { value: '3_6h', label: '3–6 hours' },
              { value: '6h_plus', label: '6+ hours' },
            ],
          },
          {
            id: 'pollution_lifestyle',
            text: 'Pollution exposure (city, travel, outdoors):',
            type: 'single',
            options: [
              { value: 'low', label: 'Low' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'high', label: 'High' },
            ],
          },
          {
            id: 'smoking',
            text: 'Do you smoke?',
            type: 'single',
            optional: true,
            options: [
              { value: 'never', label: 'No, never' },
              { value: 'quit', label: 'I quit smoking' },
              { value: 'occasionally', label: 'Occasionally (social)' },
              { value: 'regularly', label: 'Yes, regularly' },
            ],
          },
          {
            id: 'smoking_duration',
            text: 'How long have you been smoking?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'smoking', includesAny: ['occasionally', 'regularly'] },
            options: [
              { value: 'under_1yr', label: 'Less than 1 year' },
              { value: '1_3yr', label: '1–3 years' },
              { value: '3_5yr', label: '3–5 years' },
              { value: 'over_5yr', label: 'More than 5 years' },
            ],
          },
        ],
      },
    ],
  },

  // ── SECTION 2: Skin ──────────────────────────────────────────────────────
  {
    id: 'skin',
    title: 'Your Skin',
    tagline: 'Know exactly what you\'re working with',
    description: 'We go beyond "dry or oily" — understanding your barrier, sensitivity, and existing routine helps us find products that truly work for you.',
    emoji: '✨',
    gradient: 'from-rose-50 to-pink-50',
    estimatedMinutes: 7,
    subSections: [
      {
        id: 'skin_type_id',
        title: 'Skin Type',
        questions: [
          {
            id: 'wash_feel',
            text: 'How does your skin feel 30 minutes after washing — with no products applied?',
            why: 'This is the most accurate self-test for skin type',
            type: 'single',
            options: [
              { value: 'tight_dry', label: 'Tight and dry' },
              { value: 'comfortable', label: 'Normal and comfortable' },
              { value: 'slightly_oily', label: 'Slightly oily (T-zone)' },
              { value: 'very_oily', label: 'Very oily all over' },
            ],
          },
          {
            id: 'midday_behavior',
            text: 'How does your skin behave by midday?',
            type: 'single',
            options: [
              { value: 'still_dry', label: 'Still dry' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'oily_some', label: 'Oily in some areas' },
              { value: 'very_oily', label: 'Very oily' },
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
            id: 'moisturizer_feel',
            text: 'How does your skin feel after applying moisturizer?',
            type: 'single',
            options: [
              { value: 'still_dry', label: 'Still feels dry and tight' },
              { value: 'comfortable', label: 'Feels comfortable and balanced' },
              { value: 'greasy', label: 'Feels greasy or heavy' },
              { value: 'oily_hour', label: 'Gets oily within an hour' },
            ],
          },
          {
            id: 'pore_size',
            text: 'How large are your pores visibly?',
            type: 'single',
            options: [
              { value: 'barely_visible', label: 'Barely visible' },
              { value: 'noticeable_nose', label: 'Noticeable on nose / chin' },
              { value: 'visible_all', label: 'Clearly visible all over' },
              { value: 'very_large', label: 'Very large and prominent' },
            ],
          },
        ],
      },
      {
        id: 'sensitivity',
        title: 'Sensitivity & Reactivity',
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
            text: 'What kind of reactions do you notice?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'redness', label: 'Redness' },
              { value: 'burning', label: 'Burning / stinging' },
              { value: 'breakouts', label: 'Breakouts' },
              { value: 'no_reaction', label: 'No reaction' },
            ],
          },
          {
            id: 'weather_affect',
            text: 'Do weather changes affect your skin?',
            type: 'single',
            options: [
              { value: 'a_lot', label: 'A lot' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'not_really', label: 'Not really' },
            ],
          },
          {
            id: 'flush_red',
            text: 'Does your skin flush or turn red easily?',
            type: 'single',
            options: [
              { value: 'yes_easily', label: 'Yes, very easily' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'skin_conditions',
            text: 'Have you ever been diagnosed with any skin condition?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'eczema', label: 'Eczema' },
              { value: 'rosacea', label: 'Rosacea' },
              { value: 'psoriasis', label: 'Psoriasis' },
              { value: 'dermatitis', label: 'Dermatitis' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'irritation_duration',
            text: 'How long does redness or irritation last when it occurs?',
            type: 'single',
            options: [
              { value: 'minutes', label: 'Goes away in minutes' },
              { value: 'few_hours', label: 'Lasts a few hours' },
              { value: 'days', label: 'Stays for days' },
              { value: 'permanent', label: 'Becomes a permanent mark' },
            ],
          },
        ],
      },
      {
        id: 'concerns',
        title: 'Your Concerns',
        questions: [
          {
            id: 'main_concerns',
            text: 'What are your main skin concerns? (Select up to 3)',
            why: 'This drives your personalised product recommendations',
            type: 'multi',
            maxSelect: 3,
            options: [
              { value: 'acne', label: 'Acne / breakouts' },
              { value: 'acne_marks', label: 'Acne marks / pigmentation' },
              { value: 'dullness', label: 'Dullness' },
              { value: 'dryness', label: 'Dryness' },
              { value: 'oiliness', label: 'Oiliness' },
              { value: 'large_pores', label: 'Large pores' },
              { value: 'uneven_texture', label: 'Uneven texture' },
              { value: 'dark_circles', label: 'Dark circles' },
              { value: 'fine_lines', label: 'Fine lines / premature aging' },
              { value: 'redness', label: 'Redness / skin flushing' },
              { value: 'sensitivity', label: 'Sensitive / reactive skin' },
              { value: 'firmness', label: 'Loss of firmness' },
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
      {
        id: 'acne_dive',
        title: 'Acne Deep Dive',
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
              { value: 'constant', label: 'Constant' },
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
              { value: 'jawline', label: 'Jawline / chin' },
              { value: 'all_over', label: 'All over' },
            ],
          },
          {
            id: 'acne_type',
            text: 'What type of acne do you usually get?',
            type: 'single',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'whiteheads_blackheads', label: 'Whiteheads / blackheads' },
              { value: 'painful_pimples', label: 'Painful pimples' },
              { value: 'cystic', label: 'Cystic acne' },
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
            text: 'How long do breakouts take to heal?',
            type: 'single',
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'few_days', label: 'A few days' },
              { value: '1_2_weeks', label: '1–2 weeks' },
              { value: 'weeks_months', label: 'Weeks to months' },
              { value: 'leave_marks', label: 'They leave marks / scars' },
            ],
          },
          {
            id: 'acne_treatments',
            text: 'Have you tried any acne treatments before?',
            type: 'multi',
            optional: true,
            conditional: { questionId: 'main_concerns', includesAny: ['acne'] },
            options: [
              { value: 'otc', label: 'Over-the-counter products' },
              { value: 'prescription', label: 'Prescription medication' },
              { value: 'dermatologist', label: 'Dermatologist treatments' },
              { value: 'nothing', label: 'Nothing yet' },
            ],
          },
        ],
      },
      {
        id: 'pigmentation',
        title: 'Pigmentation & Tone',
        questions: [
          {
            id: 'uneven_tone',
            text: 'Do you have uneven skin tone or pigmentation?',
            type: 'single',
            options: [
              { value: 'yes_clearly', label: 'Yes, clearly visible' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'pigmentation_type',
            text: 'Type of pigmentation:',
            type: 'multi',
            optional: true,
            conditional: { questionId: 'uneven_tone', includesAny: ['yes_clearly', 'slightly'] },
            options: [
              { value: 'acne_marks', label: 'Acne marks' },
              { value: 'sun_tan', label: 'Sun tan' },
              { value: 'dark_spots', label: 'Dark spots' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'skin_tone',
            text: 'What is your skin tone?',
            type: 'single',
            options: [
              { value: 'very_fair', label: 'Very fair' },
              { value: 'fair', label: 'Fair' },
              { value: 'medium_wheatish', label: 'Medium / wheatish' },
              { value: 'dusky', label: 'Dusky' },
              { value: 'deep_dark', label: 'Deep / dark' },
            ],
          },
          {
            id: 'pigmentation_location',
            text: 'Where is the pigmentation mostly located?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'uneven_tone', includesAny: ['yes_clearly', 'slightly'] },
            options: [
              { value: 'under_eyes', label: 'Under eyes' },
              { value: 'cheeks_forehead', label: 'Cheeks / forehead' },
              { value: 'all_over', label: 'All over face' },
              { value: 'specific_spots', label: 'Specific spots only' },
            ],
          },
          {
            id: 'summer_worse',
            text: 'Does your pigmentation get worse in summers?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'uneven_tone', includesAny: ['yes_clearly', 'slightly'] },
            options: [
              { value: 'yes_significantly', label: 'Yes, significantly' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'no_difference', label: 'No difference' },
            ],
          },
        ],
      },
      {
        id: 'routine',
        title: 'Current Routine',
        questions: [
          {
            id: 'has_routine',
            text: 'Do you currently follow a skincare routine?',
            type: 'single',
            options: [
              { value: 'yes_consistent', label: 'Yes, consistent' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'products_used',
            text: 'Which products do you use regularly?',
            type: 'multi',
            options: [
              { value: 'cleanser', label: 'Cleanser' },
              { value: 'moisturizer', label: 'Moisturizer' },
              { value: 'sunscreen', label: 'Sunscreen' },
              { value: 'serums', label: 'Serums / actives' },
              { value: 'none', label: 'None' },
            ],
          },
          {
            id: 'sunscreen_use',
            text: 'How often do you use sunscreen?',
            type: 'single',
            options: [
              { value: 'daily', label: 'Daily' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely_never', label: 'Rarely / Never' },
            ],
          },
          {
            id: 'routine_duration',
            text: 'How long have you been following a skincare routine?',
            type: 'single',
            options: [
              { value: 'just_starting', label: 'Just starting out' },
              { value: 'under_6mo', label: 'Less than 6 months' },
              { value: '6mo_2yr', label: '6 months to 2 years' },
              { value: 'over_2yr', label: 'More than 2 years' },
            ],
          },
          {
            id: 'actives_used',
            text: 'What actives are you currently using?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'retinol', label: 'Retinol / Retinoids' },
              { value: 'vitamin_c', label: 'Vitamin C' },
              { value: 'aha_bha', label: 'AHA / BHA (exfoliants)' },
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
              { value: 'under_500', label: 'Under ₹500' },
              { value: '500_1500', label: '₹500–₹1500' },
              { value: '1500_3000', label: '₹1500–₹3000' },
              { value: '3000_plus', label: '₹3000+' },
            ],
          },
        ],
      },
      {
        id: 'product_compatibility',
        title: 'Product Compatibility',
        questions: [
          {
            id: 'product_breakouts',
            text: 'Have you experienced breakouts due to products?',
            type: 'single',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'texture_preference',
            text: 'What textures do you prefer?',
            type: 'single',
            options: [
              { value: 'lightweight', label: 'Lightweight (gel / water-based)' },
              { value: 'creamy_rich', label: 'Creamy / rich' },
              { value: 'no_preference', label: 'No preference' },
            ],
          },
          {
            id: 'known_allergies',
            text: 'Any ingredients you know you are allergic or sensitive to?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'fragrance', label: 'Fragrance' },
              { value: 'essential_oils', label: 'Essential oils' },
              { value: 'alcohol', label: 'Alcohol' },
              { value: 'sulfates', label: 'Sulfates' },
              { value: 'silicones', label: 'Silicones' },
              { value: 'none', label: 'None known' },
            ],
          },
          {
            id: 'fragrance_free',
            text: 'Do you prefer fragrance-free products?',
            type: 'single',
            options: [
              { value: 'yes_always', label: 'Yes, always' },
              { value: 'doesnt_matter', label: "Doesn't matter" },
              { value: 'like_scented', label: 'I like scented products' },
            ],
          },
          {
            id: 'finish_preference',
            text: 'What finish do you prefer on your skin?',
            type: 'single',
            options: [
              { value: 'matte', label: 'Matte' },
              { value: 'dewy_glowy', label: 'Dewy / glowy' },
              { value: 'natural_satin', label: 'Natural / satin' },
              { value: 'no_preference', label: 'No preference' },
            ],
          },
          {
            id: 'routine_complexity',
            text: 'How minimal or extensive do you want your routine to be?',
            type: 'single',
            options: [
              { value: '2_3_steps', label: 'Maximum 2–3 steps' },
              { value: '4_5_steps', label: 'A moderate 4–5 step routine' },
              { value: '6_plus_steps', label: 'I love a full 6+ step routine' },
            ],
          },
        ],
      },
      {
        id: 'environment',
        title: 'Environmental Exposure',
        questions: [
          {
            id: 'environment_type',
            text: 'Your environment:',
            type: 'single',
            options: [
              { value: 'mostly_indoors', label: 'Mostly indoors' },
              { value: 'mixed', label: 'Mixed' },
              { value: 'mostly_outdoors', label: 'Mostly outdoors' },
            ],
          },
          {
            id: 'climate',
            text: "What is your city/region's climate like?",
            type: 'single',
            options: [
              { value: 'hot_humid', label: 'Hot and humid' },
              { value: 'hot_dry', label: 'Hot and dry' },
              { value: 'cold_dry', label: 'Cold and dry' },
              { value: 'cold_humid', label: 'Cold and humid' },
              { value: 'moderate', label: 'Moderate / mixed' },
            ],
          },
          {
            id: 'ac_time',
            text: 'How much time do you spend in AC environments daily?',
            type: 'single',
            options: [
              { value: 'most_day', label: 'Most of my day' },
              { value: 'few_hours', label: 'A few hours' },
              { value: 'rarely', label: 'Rarely' },
            ],
          },
          {
            id: 'makeup_wear',
            text: 'Do you wear makeup regularly?',
            type: 'single',
            options: [
              { value: 'yes_daily', label: 'Yes, daily' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'water_hardness',
            text: 'How hard is the water in your area?',
            type: 'single',
            optional: true,
            options: [
              { value: 'very_hard', label: 'Very hard (leaves residue)' },
              { value: 'normal', label: 'Normal' },
              { value: 'soft', label: 'Soft' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
        ],
      },
    ],
  },

  // ── SECTION 3: Hair ──────────────────────────────────────────────────────
  {
    id: 'hair',
    title: 'Your Hair',
    tagline: 'From root to tip',
    description: 'Hair type, porosity, scalp health — these determine which products will actually work vs what will weigh your hair down or cause buildup.',
    emoji: '💇',
    gradient: 'from-amber-50 to-yellow-50',
    estimatedMinutes: 6,
    subSections: [
      {
        id: 'hair_type',
        title: 'Hair Type & Texture',
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
            conditional: { questionId: 'hair_texture', includesAny: ['wavy', 'curly', 'coily'] },
            options: [
              { value: '2a', label: '2A — Loose barely-there waves' },
              { value: '2b', label: '2B — Defined S-waves, slight frizz' },
              { value: '2c', label: '2C — Strong waves, more frizz' },
              { value: '3a', label: '3A — Large loose curls, shiny' },
              { value: '3b', label: '3B — Springy medium curls' },
              { value: '3c', label: '3C — Tight corkscrew curls' },
              { value: '4a', label: '4A — Soft defined coils, S-pattern' },
              { value: '4b', label: '4B — Z-pattern, less definition' },
              { value: '4c', label: '4C — Tightest coils, max shrinkage' },
            ],
          },
          {
            id: 'hair_shrinkage',
            text: 'How much does your hair shrink when dry?',
            type: 'single',
            options: [
              { value: 'no_shrinkage', label: 'Little to no shrinkage' },
              { value: '25_percent', label: 'Shrinks about 25%' },
              { value: '50_percent', label: 'Shrinks about 50%' },
              { value: '75_percent', label: 'Shrinks 75% or more' },
            ],
          },
          {
            id: 'strand_width',
            text: 'How would you describe your hair strand width?',
            type: 'single',
            options: [
              { value: 'very_fine', label: "Can barely see it — very fine" },
              { value: 'thin', label: 'Visible but thin' },
              { value: 'medium', label: 'Clearly visible and medium' },
              { value: 'thick', label: 'Thick and clearly visible' },
            ],
          },
          {
            id: 'hair_density',
            text: 'Your hair density (volume on scalp) is:',
            type: 'single',
            options: [
              { value: 'low', label: 'Low (scalp visible)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'very_high', label: 'Very high' },
            ],
          },
          {
            id: 'water_absorption',
            text: 'When you apply water to your hair:',
            why: 'This is a key indicator of hair porosity',
            type: 'single',
            options: [
              { value: 'slow', label: 'It takes time to get fully wet' },
              { value: 'normal', label: 'Gets wet normally' },
              { value: 'quickly', label: 'Absorbs very quickly' },
              { value: 'instantly', label: 'Absorbs instantly and feels dry soon' },
            ],
          },
          {
            id: 'drying_time',
            text: 'How long does your hair take to dry?',
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
      {
        id: 'scalp',
        title: 'Scalp Type',
        questions: [
          {
            id: 'scalp_day_after',
            text: 'How does your scalp feel 1 day after washing?',
            why: 'Scalp type determines shampoo frequency and formula needs',
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
            text: 'What does your dandruff / flaking look like?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'dandruff', includesAny: ['frequently', 'occasionally'] },
            options: [
              { value: 'small_white', label: 'Small white dry flakes' },
              { value: 'large_oily', label: 'Large oily yellowish flakes' },
              { value: 'flakes_redness', label: 'Flakes with redness' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'scalp_sensitivity',
            text: 'Do you have any scalp sensitivity or pain?',
            type: 'single',
            options: [
              { value: 'yes_tender', label: 'Yes — scalp feels tender or sore' },
              { value: 'after_styling', label: 'Sometimes after styling' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'scalp_buildup',
            text: 'Do you notice any scalp buildup?',
            type: 'single',
            options: [
              { value: 'heavy_buildup', label: 'Yes, heavy buildup even after washing' },
              { value: 'slight_buildup', label: 'Slight buildup' },
              { value: 'no_buildup', label: 'No buildup at all' },
              { value: 'not_sure', label: "Not sure what buildup feels like" },
            ],
          },
          {
            id: 'scalp_itch',
            text: 'Do you feel itchiness on your scalp?',
            type: 'single',
            options: [
              { value: 'often', label: 'Often' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'scalp_conditions',
            text: 'Has any doctor diagnosed a scalp condition?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'seborrheic_dermatitis', label: 'Seborrheic dermatitis' },
              { value: 'scalp_psoriasis', label: 'Scalp psoriasis' },
              { value: 'scalp_eczema', label: 'Scalp eczema' },
              { value: 'fungal', label: 'Fungal infection' },
              { value: 'none', label: 'None' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
        ],
      },
      {
        id: 'hair_concerns',
        title: 'Hair Concerns',
        questions: [
          {
            id: 'main_hair_concerns',
            text: 'What are your main hair concerns? (Select up to 2)',
            type: 'multi',
            maxSelect: 2,
            options: [
              { value: 'hair_fall', label: 'Hair fall' },
              { value: 'frizz', label: 'Frizz' },
              { value: 'dryness', label: 'Dryness' },
              { value: 'dullness', label: 'Dullness / lack of shine' },
              { value: 'breakage', label: 'Breakage' },
              { value: 'curl_definition', label: 'Lack of curl definition' },
              { value: 'scalp_issues', label: 'Scalp issues (dandruff, oiliness)' },
              { value: 'thinning', label: 'Thinning / density loss' },
              { value: 'color_fading', label: 'Color fading' },
              { value: 'growth', label: 'Lack of growth / length retention' },
            ],
          },
          {
            id: 'hair_fall_severity',
            text: 'How severe is your hair fall?',
            type: 'single',
            conditional: { questionId: 'main_hair_concerns', includesAny: ['hair_fall', 'thinning'] },
            options: [
              { value: 'minimal', label: 'Minimal' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'high', label: 'High' },
              { value: 'very_high', label: 'Very high' },
            ],
          },
          {
            id: 'hair_issue_onset',
            text: 'When did you start noticing hair issues?',
            type: 'single',
            options: [
              { value: 'recently', label: 'Recently' },
              { value: 'few_months', label: 'Few months ago' },
              { value: '1_2_years', label: '1–2 years ago' },
              { value: 'always', label: 'Always had them' },
            ],
          },
          {
            id: 'hair_fall_location',
            text: 'Where is your hair fall coming from mostly?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'main_hair_concerns', includesAny: ['hair_fall'] },
            options: [
              { value: 'all_over', label: 'All over scalp evenly' },
              { value: 'hairline', label: 'Hairline / temples' },
              { value: 'crown', label: 'Crown / top of head' },
              { value: 'patchy', label: 'Patchy areas' },
            ],
          },
          {
            id: 'hair_fall_pattern',
            text: 'Do you notice more hair fall at a specific time?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'main_hair_concerns', includesAny: ['hair_fall'] },
            options: [
              { value: 'after_washing', label: 'After washing' },
              { value: 'while_combing', label: 'While combing' },
              { value: 'throughout_day', label: 'Throughout the day randomly' },
              { value: 'no_pattern', label: 'No specific pattern' },
            ],
          },
          {
            id: 'hair_fall_trend',
            text: 'Has your hair fall increased recently compared to before?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'main_hair_concerns', includesAny: ['hair_fall'] },
            options: [
              { value: 'yes_significantly', label: 'Yes, significantly' },
              { value: 'slightly_more', label: 'Slightly more than before' },
              { value: 'same', label: 'About the same' },
              { value: 'less', label: 'Actually less than before' },
            ],
          },
        ],
      },
      {
        id: 'hair_condition',
        title: 'Hair Condition & Damage',
        questions: [
          {
            id: 'hair_feel',
            text: 'Your hair feels:',
            type: 'single',
            options: [
              { value: 'very_dry', label: 'Very dry' },
              { value: 'slightly_dry', label: 'Slightly dry' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'oily', label: 'Oily' },
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
            id: 'frizz_prone',
            text: 'How prone is your hair to frizz?',
            type: 'single',
            options: [
              { value: 'very_prone', label: 'Very prone' },
              { value: 'moderately', label: 'Moderately prone' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'not_at_all', label: 'Not at all' },
            ],
          },
          {
            id: 'post_wash_feel',
            text: 'How does your hair feel after washing and air drying with no products?',
            type: 'single',
            options: [
              { value: 'very_dry_straw', label: 'Very dry and straw-like' },
              { value: 'slightly_rough', label: 'Slightly rough' },
              { value: 'soft_smooth', label: 'Soft and smooth' },
              { value: 'soft_frizzy', label: 'Soft but frizzy' },
            ],
          },
          {
            id: 'breakage',
            text: 'Does your hair break easily when combing or styling?',
            type: 'single',
            options: [
              { value: 'yes_constantly', label: 'Yes, constantly' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'humidity_reaction',
            text: 'How does your hair respond to humidity?',
            type: 'single',
            options: [
              { value: 'very_frizzy', label: 'Becomes very frizzy' },
              { value: 'slightly_puffy', label: 'Gets slightly wavy or puffy' },
              { value: 'no_change', label: 'No change' },
              { value: 'looks_better', label: 'Actually looks better' },
            ],
          },
          {
            id: 'overall_damage',
            text: 'Rate your overall hair damage:',
            why: 'Determines treatment intensity and protein / moisture balance needs',
            type: 'single',
            options: [
              { value: 'virgin', label: 'Virgin hair — never chemically treated, minimal heat' },
              { value: 'slightly_damaged', label: 'Slightly damaged — occasional heat, no chemicals' },
              { value: 'moderately_damaged', label: 'Moderately damaged — regular heat or some chemical treatment' },
              { value: 'heavily_damaged', label: 'Heavily damaged — multiple chemical treatments and regular heat' },
            ],
          },
        ],
      },
      {
        id: 'hair_routine',
        title: 'Hair Care Routine',
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
            id: 'oil_frequency',
            text: 'Do you oil your hair?',
            type: 'single',
            options: [
              { value: 'regularly', label: 'Regularly' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
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
            id: 'shampoo_type',
            text: 'What type of shampoo do you currently use?',
            type: 'single',
            options: [
              { value: 'sulfate_free', label: 'Sulfate-free' },
              { value: 'regular', label: 'Regular / drugstore' },
              { value: 'anti_dandruff', label: 'Anti-dandruff' },
              { value: 'clarifying', label: 'Clarifying' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'hair_mask_frequency',
            text: 'Do you use any hair masks or deep conditioning treatments?',
            type: 'single',
            options: [
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'haircare_budget',
            text: 'What is your monthly haircare budget?',
            type: 'single',
            options: [
              { value: 'under_300', label: 'Under ₹300' },
              { value: '300_800', label: '₹300–₹800' },
              { value: '800_1500', label: '₹800–₹1500' },
              { value: '1500_plus', label: '₹1500+' },
            ],
          },
          {
            id: 'co_wash',
            text: 'Do you co-wash? (wash with conditioner only)',
            type: 'single',
            optional: true,
            options: [
              { value: 'yes_regularly', label: 'Yes regularly' },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'no_new', label: "No, didn't know this was a thing" },
              { value: 'no_prefer_shampoo', label: 'No, I prefer shampoo always' },
            ],
          },
        ],
      },
      {
        id: 'styling',
        title: 'Styling & Chemical Exposure',
        questions: [
          {
            id: 'heat_use',
            text: 'Do you use heat styling tools?',
            type: 'single',
            options: [
              { value: 'frequently', label: 'Frequently' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'heat_tools',
            text: 'What heat tools do you use?',
            type: 'multi',
            optional: true,
            conditional: { questionId: 'heat_use', includesAny: ['frequently', 'sometimes'] },
            options: [
              { value: 'flat_iron', label: 'Straightener / flat iron' },
              { value: 'curling_wand', label: 'Curling wand / iron' },
              { value: 'blow_dryer', label: 'Blow dryer' },
              { value: 'multiple', label: 'Multiple tools' },
            ],
          },
          {
            id: 'heat_temp',
            text: 'What temperature do you use heat tools at?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'heat_use', includesAny: ['frequently', 'sometimes'] },
            options: [
              { value: 'below_150', label: 'Below 150°C' },
              { value: '150_185', label: '150–185°C' },
              { value: '185_220', label: '185–220°C' },
              { value: 'max_heat', label: 'Maximum heat always' },
            ],
          },
          {
            id: 'chemical_treatment',
            text: 'Have you chemically treated your hair?',
            type: 'single',
            options: [
              { value: 'color_and_treatment', label: 'Yes (color + treatments)' },
              { value: 'color_only', label: 'Yes (only color)' },
              { value: 'smoothing_keratin', label: 'Yes (smoothing / keratin)' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'last_treatment',
            text: 'How long ago was your last chemical treatment?',
            type: 'single',
            optional: true,
            conditional: {
              questionId: 'chemical_treatment',
              includesAny: ['color_and_treatment', 'color_only', 'smoothing_keratin'],
            },
            options: [
              { value: 'under_1mo', label: 'Less than 1 month ago' },
              { value: '1_6mo', label: '1–6 months ago' },
              { value: '6mo_1yr', label: '6 months to a year' },
              { value: 'over_1yr', label: 'More than a year ago' },
            ],
          },
          {
            id: 'heat_protectant',
            text: 'Do you use heat protectant?',
            type: 'single',
            options: [
              { value: 'always', label: 'Always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'sun_pollution_exposure',
            text: 'How often do you expose your hair to sun / pollution?',
            type: 'single',
            options: [
              { value: 'very_often', label: 'Very often' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'almost_never', label: 'Almost never' },
            ],
          },
        ],
      },
      {
        id: 'internal_hair',
        title: 'Internal Indicators',
        questions: [
          {
            id: 'hair_fall_type',
            text: 'Your hair fall is usually:',
            type: 'single',
            options: [
              { value: 'continuous', label: 'Continuous' },
              { value: 'seasonal', label: 'Seasonal' },
              { value: 'stress_related', label: 'Stress-related' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'hair_thinning',
            text: 'Do you notice hair thinning?',
            type: 'single',
            options: [
              { value: 'clearly_visible', label: 'Clearly visible' },
              { value: 'slightly', label: 'Slightly' },
              { value: 'not_really', label: 'Not really' },
              { value: 'not_at_all', label: 'Not at all' },
            ],
          },
          {
            id: 'scalp_oiliness_rate',
            text: 'Your scalp gets oily:',
            type: 'single',
            options: [
              { value: 'within_a_day', label: 'Within a day' },
              { value: 'after_2_days', label: 'After 2 days' },
              { value: 'after_3_4_days', label: 'After 3–4 days' },
              { value: 'rarely', label: 'Rarely' },
            ],
          },
          {
            id: 'hair_skin_connection',
            text: 'Do you notice your hair and skin changing together?',
            type: 'single',
            options: [
              { value: 'yes_both_oily', label: 'Yes — when skin breaks out hair also gets oily' },
              { value: 'yes_stress', label: 'Yes — when stressed both get affected' },
              { value: 'not_connected', label: 'Not really connected' },
              { value: 'never_noticed', label: 'Never noticed' },
            ],
          },
          {
            id: 'family_hair_loss',
            text: 'Has anyone in your family experienced significant hair loss?',
            type: 'single',
            optional: true,
            options: [
              { value: 'mothers_side', label: "Yes, mother's side" },
              { value: 'fathers_side', label: "Yes, father's side" },
              { value: 'both_sides', label: 'Both sides' },
              { value: 'no_history', label: 'No family history' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
        ],
      },
    ],
  },

  // ── SECTION 4: Makeup ────────────────────────────────────────────────────
  {
    id: 'makeup',
    title: 'Your Makeup',
    tagline: 'Find what actually suits you',
    description: 'Your skin tone, undertone, and lifestyle shape which formulas and shades work for you — and which products are worth the investment.',
    emoji: '💄',
    gradient: 'from-purple-50 to-fuchsia-50',
    estimatedMinutes: 4,
    subSections: [
      {
        id: 'tone_undertone',
        title: 'Skin Tone & Undertone',
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
            type: 'single',
            options: [
              { value: 'warm', label: 'Warm (yellow / golden)' },
              { value: 'cool', label: 'Cool (pink / blue)' },
              { value: 'neutral', label: 'Neutral (mix of both)' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'undertone_test',
            text: 'How do you find your undertone most easily?',
            type: 'single',
            optional: true,
            conditional: { questionId: 'undertone', includesAny: ['not_sure'] },
            options: [
              { value: 'blue_purple', label: 'My veins look blue / purple' },
              { value: 'green', label: 'My veins look green' },
              { value: 'mix', label: "Mix of both — hard to tell" },
              { value: 'never_checked', label: "I've never checked" },
            ],
          },
          {
            id: 'metal_preference',
            text: 'Which metals suit you better?',
            type: 'single',
            options: [
              { value: 'gold', label: 'Gold jewelry looks better on me' },
              { value: 'silver', label: 'Silver jewelry looks better on me' },
              { value: 'both', label: 'Both look equally good' },
              { value: 'not_sure', label: 'Not sure' },
            ],
          },
          {
            id: 'foundation_experience',
            text: "How does your skin react to foundation shades you've tried before?",
            type: 'single',
            options: [
              { value: 'too_pink', label: 'Always looks too pink / red' },
              { value: 'too_yellow', label: 'Always looks too yellow / orange' },
              { value: 'too_grey', label: 'Always looks too grey / ashy' },
              { value: 'never_tried', label: "I've never tried foundation" },
              { value: 'matches_well', label: 'Usually matches well' },
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
      {
        id: 'makeup_style',
        title: 'Makeup Style',
        questions: [
          {
            id: 'makeup_frequency_makeup',
            text: 'How often do you wear makeup?',
            type: 'single',
            options: [
              { value: 'daily', label: 'Daily' },
              { value: 'few_times_week', label: 'A few times a week' },
              { value: 'special_occasions', label: 'Only for special occasions' },
              { value: 'rarely_never', label: 'Rarely or never' },
            ],
          },
          {
            id: 'makeup_occasions',
            text: 'Where do you mostly wear makeup?',
            type: 'single',
            options: [
              { value: 'work_college', label: 'Work / college daily' },
              { value: 'social_outings', label: 'Social events and outings' },
              { value: 'special_only', label: 'Special occasions only' },
              { value: 'home_fun', label: 'At home / for fun' },
            ],
          },
          {
            id: 'everyday_vibe',
            text: 'Your everyday makeup vibe is:',
            type: 'single',
            options: [
              { value: 'natural', label: 'Natural / no-makeup look' },
              { value: 'soft_glam', label: 'Soft glam' },
              { value: 'full_glam', label: 'Full glam' },
              { value: 'dont_use', label: "I don't use makeup regularly" },
            ],
          },
          {
            id: 'preferred_look',
            text: 'You prefer makeup that looks:',
            type: 'single',
            options: [
              { value: 'minimal', label: 'Very minimal' },
              { value: 'balanced', label: 'Balanced and polished' },
              { value: 'bold', label: 'Bold and noticeable' },
              { value: 'depends', label: 'Depends on occasion' },
            ],
          },
        ],
      },
      {
        id: 'coverage_finish',
        title: 'Coverage & Finish',
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
        ],
      },
      {
        id: 'product_focus',
        title: 'Product Focus',
        questions: [
          {
            id: 'most_used_products',
            text: 'What do you use most often?',
            type: 'multi',
            options: [
              { value: 'base', label: 'Base (foundation, concealer)' },
              { value: 'eyes', label: 'Eyes (liner, mascara, shadow)' },
              { value: 'lips', label: 'Lips' },
              { value: 'minimal', label: 'Minimal / none' },
              { value: 'blush_bronzer', label: 'Blush / bronzer / highlighter' },
              { value: 'setting', label: 'Setting products' },
              { value: 'brows', label: 'Brows' },
              { value: 'skincare_makeup', label: 'Skincare-makeup hybrids (BB/CC cream)' },
            ],
          },
          {
            id: 'makeup_struggles',
            text: 'What do you struggle with most?',
            type: 'single',
            options: [
              { value: 'shade_matching', label: 'Shade matching' },
              { value: 'longevity', label: "Longevity (makeup doesn't last)" },
              { value: 'blending', label: 'Blending' },
              { value: 'choosing', label: 'Choosing products' },
            ],
          },
          {
            id: 'invest_in',
            text: 'Which product are you most willing to invest in?',
            type: 'single',
            options: [
              { value: 'base', label: 'Base (foundation / concealer)' },
              { value: 'eye_products', label: 'Eye products' },
              { value: 'lip_products', label: 'Lip products' },
              { value: 'skincare_hybrids', label: 'Skincare-makeup hybrids' },
            ],
          },
          {
            id: 'confused_about',
            text: 'Which product category are you most confused about when buying?',
            type: 'single',
            options: [
              { value: 'foundation', label: 'Foundation shade and formula' },
              { value: 'concealer', label: 'Concealer shade and type' },
              { value: 'blush_bronzer', label: 'Blush and bronzer placement' },
              { value: 'eyeshadow', label: 'Eye shadow and liner types' },
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
      {
        id: 'lip_eye',
        title: 'Lip & Eye Preferences',
        questions: [
          {
            id: 'lip_product_type',
            text: 'Lip product type you prefer:',
            type: 'single',
            options: [
              { value: 'lipstick', label: 'Lipstick' },
              { value: 'liquid_lipstick', label: 'Liquid lipstick / matte lip' },
              { value: 'gloss', label: 'Lip gloss' },
              { value: 'tint', label: 'Lip tint' },
              { value: 'liner', label: 'Lip liner' },
              { value: 'whatever_works', label: 'I use whatever works' },
            ],
          },
          {
            id: 'eye_shape_concern',
            text: 'Your eye shape concern:',
            type: 'single',
            options: [
              { value: 'bigger', label: 'I want to make my eyes look bigger' },
              { value: 'defined', label: 'I want to make them look more defined' },
              { value: 'lift', label: 'I want to lift my eyes' },
              { value: 'hooded', label: "I have hooded eyes — products don't show up well" },
              { value: 'no_concern', label: 'No specific concern' },
            ],
          },
          {
            id: 'kajal_use',
            text: 'Do you wear kajal or kohl?',
            type: 'single',
            options: [
              { value: 'daily_essential', label: "Yes, daily — it's my essential" },
              { value: 'occasionally', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' },
            ],
          },
          {
            id: 'lip_shades',
            text: 'Lip shades you gravitate towards:',
            type: 'single',
            options: [
              { value: 'nude', label: 'Nude tones' },
              { value: 'pink_mauve', label: 'Pink / mauve' },
              { value: 'bold', label: 'Bold (red, berry)' },
              { value: 'gloss_clear', label: 'Gloss / clear' },
            ],
          },
          {
            id: 'eye_makeup_style',
            text: 'Eye makeup preference:',
            type: 'single',
            options: [
              { value: 'bare_minimal', label: 'Bare / minimal' },
              { value: 'soft_definition', label: 'Soft definition' },
              { value: 'smokey_glam', label: 'Smokey / glam' },
              { value: 'graphic', label: 'Graphic / experimental' },
            ],
          },
        ],
      },
      {
        id: 'skin_makeup_compat',
        title: 'Skin Compatibility',
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
            text: 'Does your makeup oxidise during the day? (gets darker or more orange)',
            type: 'single',
            options: [
              { value: 'yes_always', label: 'Yes, always' },
              { value: 'sometimes', label: 'Sometimes' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'what_is_that', label: "I don't know what oxidation means" },
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
            text: 'Do you have any known makeup ingredient sensitivities?',
            type: 'multi',
            optional: true,
            options: [
              { value: 'fragrance', label: 'Fragrance' },
              { value: 'talc', label: 'Talc' },
              { value: 'bismuth', label: 'Bismuth oxychloride' },
              { value: 'parabens', label: 'Parabens' },
              { value: 'none', label: 'None known' },
            ],
          },
          {
            id: 'makeup_long_term',
            text: 'Does makeup affect your skin long term?',
            type: 'single',
            options: [
              { value: 'worse', label: 'Yes — skin has gotten worse since using makeup' },
              { value: 'slightly_congested', label: 'Slightly more congested' },
              { value: 'no_change', label: 'No change' },
              { value: 'fine', label: 'Skin seems fine' },
            ],
          },
        ],
      },
      {
        id: 'budget_buying',
        title: 'Budget & Buying Behaviour',
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
            text: 'How do you choose products?',
            type: 'single',
            options: [
              { value: 'trends', label: 'Trends / social media' },
              { value: 'reviews', label: 'Reviews' },
              { value: 'brand_loyalty', label: 'Brand loyalty' },
              { value: 'impulse', label: 'Random / impulse' },
            ],
          },
          {
            id: 'makeup_monthly_budget',
            text: 'What is your approximate monthly makeup budget?',
            type: 'single',
            options: [
              { value: 'under_500', label: 'Under ₹500' },
              { value: '500_1500', label: '₹500–₹1500' },
              { value: '1500_3000', label: '₹1500–₹3000' },
              { value: '3000_plus', label: '₹3000+' },
            ],
          },
          {
            id: 'high_end_barrier',
            text: 'What stops you from buying high-end makeup?',
            type: 'single',
            options: [
              { value: 'price', label: 'Price — too expensive' },
              { value: 'not_worth_it', label: 'Not sure if worth it' },
              { value: 'dont_know_what', label: "Don't know which products to pick" },
              { value: 'nothing', label: 'Nothing — I buy high-end sometimes' },
              { value: 'didnt_know_dupes', label: "I didn't know dupes existed" },
            ],
          },
          {
            id: 'dupe_history',
            text: 'Have you ever bought a dupe intentionally?',
            type: 'single',
            options: [
              { value: 'yes_regularly', label: 'Yes, regularly' },
              { value: 'few_times', label: 'A few times' },
              { value: 'no_want_to', label: 'No, but I want to' },
              { value: 'no_unsure', label: 'No and not sure about it' },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Flat list of all questions (with conditional filtering) */
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
