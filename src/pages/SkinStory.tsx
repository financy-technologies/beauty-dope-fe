import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowRight, Sparkles, RotateCcw, Save, Lock, TrendingUp, Zap, AlertTriangle, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { cn } from '@/lib/utils';
import {
  QUIZ_SECTIONS,
  QuizSection,
  QuizQuestion,
  AllAnswers,
  computeInsights,
  getVisibleQuestions,
  type QuizInsights,
} from '@/config/quiz.config';
import { useSaveSkinStorySection, loadLocalProgress, type SectionId } from '@/hooks/api/useSkinStory';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

// ─── Types ──────────────────────────────────────────────────────────────────

type View = 'landing' | 'section-intro' | 'quiz' | 'section-done' | 'results';

// ─── Option Button ───────────────────────────────────────────────────────────

function OptionButton({
  label, selected, onClick, disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-sm font-medium',
        'hover:border-teal-400 hover:bg-teal-50 active:scale-[0.98]',
        selected
          ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all',
            selected ? 'border-teal-500 bg-teal-500' : 'border-slate-300',
          )}
        >
          {selected && (
            <svg viewBox="0 0 20 20" fill="white" className="w-full h-full">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        {label}
      </span>
    </button>
  );
}

// ─── Section Card (landing) ──────────────────────────────────────────────────

function SectionCard({
  section,
  isDone,
  isActive,
  questionCount,
  onClick,
}: {
  section: QuizSection;
  isDone: boolean;
  isActive: boolean;
  questionCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group',
        isDone
          ? 'border-teal-300 bg-teal-50'
          : isActive
          ? 'border-teal-500 bg-white shadow-lg shadow-teal-100'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0',
          `bg-gradient-to-br ${section.gradient}`,
        )}>
          {section.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-slate-800 text-base">{section.title}</h3>
            {isDone && <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 mb-2">{section.tagline}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{questionCount} questions</span>
            <span>·</span>
            <span>~{section.estimatedMinutes} min</span>
          </div>
        </div>
        <ArrowRight className={cn(
          'w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5',
          isDone ? 'text-teal-400' : 'text-slate-300',
        )} />
      </div>

      {isDone && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-teal-100 text-teal-700 text-xs border-0 px-2">Done</Badge>
        </div>
      )}
    </button>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function QuizProgressBar({
  sectionIndex,
  questionIndex,
  totalQuestions,
  sectionTitle,
  sectionEmoji,
}: {
  sectionIndex: number;
  questionIndex: number;
  totalQuestions: number;
  sectionTitle: string;
  sectionEmoji: string;
}) {
  const pct = totalQuestions > 0 ? Math.round((questionIndex / totalQuestions) * 100) : 0;
  return (
    <div className="w-full px-4 pt-4 pb-3 bg-white border-b border-slate-100">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{sectionEmoji}</span>
            <span className="text-sm font-medium text-slate-600">{sectionTitle}</span>
          </div>
          <span className="text-xs text-slate-400">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <Progress value={pct} className="h-1.5 bg-slate-100" />
        {/* Section dots */}
        <div className="flex gap-1.5 mt-2 justify-center">
          {QUIZ_SECTIONS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1 rounded-full transition-all',
                i < sectionIndex ? 'bg-teal-400 w-4' :
                i === sectionIndex ? 'bg-teal-600 w-6' :
                'bg-slate-200 w-4',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  answers,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  questionIndex,
  totalQuestions,
}: {
  question: QuizQuestion;
  answers: AllAnswers;
  onAnswer: (id: string, val: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionIndex: number;
  totalQuestions: number;
}) {
  const current = answers[question.id];
  const selectedArr: string[] = Array.isArray(current) ? current : current ? [current] : [];

  function toggle(value: string) {
    if (question.type === 'single') {
      onAnswer(question.id, value);
      // Auto-advance for single-select after small delay
      setTimeout(() => onNext(), 250);
      return;
    }
    // Multi-select
    const max = question.maxSelect ?? 99;
    if (selectedArr.includes(value)) {
      onAnswer(question.id, selectedArr.filter(v => v !== value));
    } else if (selectedArr.length < max) {
      onAnswer(question.id, [...selectedArr, value]);
    }
  }

  const hasAnswer = selectedArr.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Question text */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-1">
          {question.text}
        </p>
        {question.type === 'multi' && (
          <p className="text-xs text-slate-400">
            {question.maxSelect
              ? `Select up to ${question.maxSelect}`
              : 'Select all that apply'}
            {selectedArr.length > 0 && ` · ${selectedArr.length} selected`}
          </p>
        )}
        {question.why && (
          <p className="text-xs text-teal-600 mt-1.5 italic">↳ {question.why}</p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-1">
        {question.options.map(opt => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={selectedArr.includes(opt.value)}
            onClick={() => toggle(opt.value)}
            disabled={
              question.type === 'multi' &&
              !selectedArr.includes(opt.value) &&
              selectedArr.length >= (question.maxSelect ?? 99)
            }
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {question.type === 'multi' ? (
          <Button
            size="sm"
            onClick={onNext}
            disabled={!hasAnswer && !question.optional}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
          >
            {isLast ? 'Finish section' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          question.optional && !hasAnswer && (
            <button
              onClick={onNext}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Skip
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Insight Badge ────────────────────────────────────────────────────────────

function InsightChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={cn('rounded-xl p-3 text-center', color)}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="font-semibold text-sm capitalize">{value.replace(/-/g, ' ')}</p>
    </div>
  );
}

// ─── Section Result Card ──────────────────────────────────────────────────────

function ResultRow({ label, value, color = 'bg-slate-50 text-slate-700' }: { label: string; value: string; color?: string }) {
  return (
    <div className={cn('rounded-xl px-4 py-3 flex items-center justify-between gap-3', color)}>
      <p className="text-xs font-medium text-current opacity-70">{label}</p>
      <p className="text-sm font-semibold capitalize">{value.replace(/-/g, ' ')}</p>
    </div>
  );
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map(i => (
        <Badge key={i} className={cn('border-0 text-xs', color)}>
          {i.replace(/_/g, ' ')}
        </Badge>
      ))}
    </div>
  );
}

function SectionResultCard({
  sectionId,
  answers,
}: {
  sectionId: 'biology' | 'skin' | 'hair' | 'makeup';
  answers: AllAnswers;
}) {
  // Compute full insights — we only display the relevant subset for this section
  const ins = computeInsights(answers);

  if (sectionId === 'skin') {
    const skinTypeLabel: Record<string, string> = {
      dry: 'Dry', oily: 'Oily', combination: 'Combination', normal: 'Normal', sensitive: 'Sensitive',
    };
    const acneColor: Record<string, string> = {
      low: 'bg-green-50 text-green-700', moderate: 'bg-yellow-50 text-yellow-700', high: 'bg-red-50 text-red-700',
    };
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-0.5">Your Skin Profile</p>
          <h3 className="text-xl font-bold text-slate-800">
            {skinTypeLabel[ins.skinType] ?? ins.skinType} Skin
            {ins.isSensitive ? ' + Sensitive' : ''}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">
            {ins.routineMaturity} routine · {ins.skincareMonthlyBudget} budget
          </p>
        </div>
        <div className="p-4 space-y-2">
          <ResultRow label="Barrier Health"  value={ins.barrierHealth}       color="bg-slate-50 text-slate-700" />
          <ResultRow label="Acne Risk"        value={ins.acneRisk}            color={acneColor[ins.acneRisk]} />
          <ResultRow label="Pigmentation"     value={ins.pigmentationLevel}   color="bg-slate-50 text-slate-700" />
          <ResultRow label="Sensitivity"      value={ins.sensitivityLevel}    color="bg-slate-50 text-slate-700" />
        </div>
        {ins.primaryConcerns.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Top concerns
            </p>
            <TagList items={ins.primaryConcerns} color="bg-teal-50 text-teal-700" />
          </div>
        )}
        {(ins.ingredientsToSeek.length > 0 || ins.ingredientsToAvoid.length > 0) && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-3">
            {ins.ingredientsToSeek.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" /> Ingredients to seek
                </p>
                <TagList items={ins.ingredientsToSeek} color="bg-green-50 text-green-700" />
              </div>
            )}
            {ins.ingredientsToAvoid.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-500 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Ingredients to avoid
                </p>
                <TagList items={ins.ingredientsToAvoid} color="bg-red-50 text-red-600" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (sectionId === 'biology') {
    const stressColor: Record<string, string> = {
      low: 'bg-green-50 text-green-700', moderate: 'bg-yellow-50 text-yellow-700',
      high: 'bg-orange-50 text-orange-700', 'very-high': 'bg-red-50 text-red-700',
    };
    const tip =
      ins.internalInflammation === 'high'
        ? 'High internal inflammation is often visible on skin as redness, breakouts, or dullness. Focus on stress reduction and anti-inflammatory foods.'
        : ins.stressLevel === 'high' || ins.stressLevel === 'very-high'
        ? 'Chronic stress elevates cortisol, increasing sebum production and slowing barrier repair. Prioritise sleep and recovery.'
        : ins.sleepQuality === 'poor' || ins.sleepQuality === 'fair'
        ? 'Skin repairs itself during deep sleep. Even one extra hour can noticeably improve barrier function and reduce puffiness.'
        : 'Your internal health signals look solid — your skin is likely benefiting from your lifestyle habits.';
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-0.5">Internal Health Snapshot</p>
          <h3 className="text-xl font-bold text-slate-800">Your Biology at a Glance</h3>
        </div>
        <div className="p-4 space-y-2">
          <ResultRow label="Stress Level"         value={ins.stressLevel}          color={stressColor[ins.stressLevel] ?? 'bg-slate-50 text-slate-700'} />
          <ResultRow label="Sleep Quality"         value={ins.sleepQuality}         color="bg-slate-50 text-slate-700" />
          <ResultRow label="Diet Quality"          value={ins.dietQuality}          color="bg-slate-50 text-slate-700" />
          <ResultRow label="Internal Inflammation" value={ins.internalInflammation} color={ins.internalInflammation === 'high' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'} />
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> What this means for your skin
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
        </div>
      </div>
    );
  }

  if (sectionId === 'hair') {
    const hairTypeLabel: Record<string, string> = {
      straight: 'Straight', wavy: 'Wavy', curly: 'Curly', coily: 'Coily', unknown: 'Not answered',
    };
    const dmgColor: Record<string, string> = {
      minimal: 'bg-green-50 text-green-700', slight: 'bg-green-50 text-green-700',
      moderate: 'bg-orange-50 text-orange-700', heavy: 'bg-red-50 text-red-700',
    };
    if (ins.hairType === 'unknown') {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center text-slate-400 text-sm">
          Hair section skipped — no hair insights to show.
        </div>
      );
    }
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-0.5">Hair Profile</p>
          <h3 className="text-xl font-bold text-slate-800">
            {hairTypeLabel[ins.hairType]} Hair
            {ins.curlPattern ? ` · ${ins.curlPattern.toUpperCase()}` : ''}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{ins.haircareMonthlyBudget} haircare budget</p>
        </div>
        <div className="p-4 space-y-2">
          <ResultRow label="Scalp Type"    value={ins.scalpType}    color="bg-slate-50 text-slate-700" />
          <ResultRow label="Porosity"      value={ins.porosity}     color="bg-slate-50 text-slate-700" />
          <ResultRow label="Damage Level"  value={ins.damageLevel}  color={dmgColor[ins.damageLevel]} />
        </div>
        {ins.primaryHairConcerns.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Primary hair concerns
            </p>
            <TagList items={ins.primaryHairConcerns} color="bg-amber-50 text-amber-700" />
          </div>
        )}
      </div>
    );
  }

  if (sectionId === 'makeup') {
    if (ins.undertone === 'unknown') {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center text-slate-400 text-sm">
          Makeup section skipped — no makeup insights to show.
        </div>
      );
    }
    const freqLabel: Record<string, string> = {
      daily: 'Daily', occasional: 'Occasional', rare: 'Rarely', never: 'Never',
    };
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-0.5">Makeup Profile</p>
          <h3 className="text-xl font-bold text-slate-800 capitalize">
            {ins.undertone} Undertone · {ins.coveragePreference} coverage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{ins.makeupMonthlyBudget} budget · {freqLabel[ins.makeupFrequency] ?? ins.makeupFrequency} wear</p>
        </div>
        <div className="p-4 space-y-2">
          <ResultRow label="Undertone"         value={ins.undertone}           color="bg-slate-50 text-slate-700" />
          <ResultRow label="Coverage Preference" value={ins.coveragePreference} color="bg-slate-50 text-slate-700" />
          <ResultRow label="Wears Makeup"      value={freqLabel[ins.makeupFrequency] ?? ins.makeupFrequency} color="bg-slate-50 text-slate-700" />
          <ResultRow label="Monthly Budget"    value={ins.makeupMonthlyBudget} color="bg-slate-50 text-slate-700" />
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> What this means
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {ins.undertone === 'warm'
              ? 'Warm undertones suit golden, peachy, and coral shades. Look for foundations with yellow or golden bases.'
              : ins.undertone === 'cool'
              ? 'Cool undertones suit pink, berry, and mauve shades. Look for foundations with pink or red bases.'
              : 'Neutral undertones suit a wide range of shades — you can wear both warm and cool tones easily.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Results ──────────────────────────────────────────────────────────────────

function Results({
  insights,
  onRetake,
  onBrowse,
}: {
  insights: QuizInsights;
  onRetake: () => void;
  onBrowse: () => void;
}) {
  const skinTypeLabel: Record<string, string> = {
    dry: 'Dry Skin', oily: 'Oily Skin', combination: 'Combination Skin',
    normal: 'Normal Skin', sensitive: 'Sensitive Skin',
  };
  const hairTypeLabel: Record<string, string> = {
    straight: 'Straight', wavy: 'Wavy', curly: 'Curly', coily: 'Coily', unknown: 'Not answered',
  };
  const stressColor: Record<string, string> = {
    low: 'bg-green-50 text-green-800',
    moderate: 'bg-yellow-50 text-yellow-800',
    high: 'bg-orange-50 text-orange-800',
    'very-high': 'bg-red-50 text-red-800',
  };
  const acneColor: Record<string, string> = {
    low: 'bg-green-50 text-green-800',
    moderate: 'bg-yellow-50 text-yellow-800',
    high: 'bg-red-50 text-red-800',
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-teal-200">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Your Skin Story</h1>
        <p className="text-slate-500 text-sm">Here's what we learned about you</p>
      </div>

      {/* Skin Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-400 font-medium uppercase tracking-wide mb-0.5">Skin Profile</p>
              <h2 className="text-xl font-bold text-slate-800">
                {skinTypeLabel[insights.skinType] ?? insights.skinType}
                {insights.isSensitive && ' + Sensitive'}
              </h2>
            </div>
            <span className="text-3xl">✨</span>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          <InsightChip label="Barrier Health" value={insights.barrierHealth} color="bg-slate-50 text-slate-700" />
          <InsightChip label="Acne Risk" value={insights.acneRisk} color={acneColor[insights.acneRisk]} />
          <InsightChip label="Sensitivity" value={insights.sensitivityLevel} color="bg-slate-50 text-slate-700" />
          <InsightChip label="Pigmentation" value={insights.pigmentationLevel} color="bg-slate-50 text-slate-700" />
        </div>

        {insights.primaryConcerns.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-slate-400 font-medium mb-2">Your top concerns</p>
            <div className="flex flex-wrap gap-1.5">
              {insights.primaryConcerns.map(c => (
                <Badge key={c} variant="secondary" className="text-xs bg-teal-50 text-teal-700 border-0">
                  {c.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Intelligence */}
      {(insights.ingredientsToSeek.length > 0 || insights.ingredientsToAvoid.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-slate-800 text-sm">Ingredient Intelligence</h3>
          {insights.ingredientsToSeek.length > 0 && (
            <div>
              <p className="text-xs text-green-600 font-medium mb-1.5">✓ Look for these</p>
              <div className="flex flex-wrap gap-1.5">
                {insights.ingredientsToSeek.map(i => (
                  <Badge key={i} className="bg-green-50 text-green-700 border-0 text-xs">{i}</Badge>
                ))}
              </div>
            </div>
          )}
          {insights.ingredientsToAvoid.length > 0 && (
            <div>
              <p className="text-xs text-red-500 font-medium mb-1.5">✗ Avoid these</p>
              <div className="flex flex-wrap gap-1.5">
                {insights.ingredientsToAvoid.map(i => (
                  <Badge key={i} className="bg-red-50 text-red-600 border-0 text-xs">{i}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Biology Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <p className="font-semibold text-slate-700 text-sm">Internal Health Snapshot</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <InsightChip label="Stress Level" value={insights.stressLevel} color={stressColor[insights.stressLevel] ?? 'bg-slate-50 text-slate-700'} />
          <InsightChip label="Sleep Quality" value={insights.sleepQuality} color="bg-slate-50 text-slate-700" />
          <InsightChip label="Diet Quality" value={insights.dietQuality} color="bg-slate-50 text-slate-700" />
          <InsightChip label="Inflammation" value={insights.internalInflammation} color={insights.internalInflammation === 'high' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'} />
        </div>
      </div>

      {/* Hair Profile */}
      {insights.hairType !== 'unknown' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">💇</span>
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  {hairTypeLabel[insights.hairType]} Hair
                  {insights.curlPattern ? ` · ${insights.curlPattern.toUpperCase()}` : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <InsightChip label="Scalp Type" value={insights.scalpType} color="bg-slate-50 text-slate-700" />
            <InsightChip label="Porosity" value={insights.porosity} color="bg-slate-50 text-slate-700" />
            <InsightChip label="Damage Level" value={insights.damageLevel} color={
              insights.damageLevel === 'heavy' ? 'bg-red-50 text-red-700' :
              insights.damageLevel === 'moderate' ? 'bg-orange-50 text-orange-700' :
              'bg-slate-50 text-slate-700'
            } />
            {insights.primaryHairConcerns.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Top concerns</p>
                {insights.primaryHairConcerns.map(c => (
                  <p key={c} className="text-xs text-slate-700 capitalize">{c.replace(/_/g, ' ')}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Makeup Profile */}
      {insights.undertone !== 'unknown' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">💄</span>
              <p className="font-semibold text-slate-700 text-sm">Makeup Profile</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <InsightChip label="Undertone" value={insights.undertone} color="bg-slate-50 text-slate-700" />
            <InsightChip label="Coverage" value={insights.coveragePreference} color="bg-slate-50 text-slate-700" />
            <InsightChip label="Wears Makeup" value={insights.makeupFrequency} color="bg-slate-50 text-slate-700" />
            <InsightChip label="Budget" value={insights.makeupMonthlyBudget} color="bg-slate-50 text-slate-700" />
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 pb-4">
        <Button
          onClick={onBrowse}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 h-12 rounded-xl text-base font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Browse products matched for you
        </Button>
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake quiz
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SkinStory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutateAsync: saveSection } = useSaveSkinStorySection();

  const [view, setView] = useState<View>('landing');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AllAnswers>(() => {
    // Rehydrate from localStorage
    const local = loadLocalProgress();
    return Object.values(local).reduce((acc, a) => ({ ...acc, ...a }), {});
  });
  const [doneSections, setDoneSections] = useState<Set<SectionId>>(() => {
    const local = loadLocalProgress();
    return new Set(Object.keys(local) as SectionId[]);
  });
  const [insights, setInsights] = useState<QuizInsights | null>(null);
  const [previousResults, setPreviousResults] = useState<QuizInsights | null>(() => {
    try {
      const raw = localStorage.getItem('skinevora_skin_story_results');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [isSaving, setIsSaving] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const section = QUIZ_SECTIONS[currentSectionIndex];
  const visibleQs = section ? getVisibleQuestions(section, answers) : [];
  const currentQ = visibleQs[currentQuestionIndex];

  const totalAnswered = Object.keys(answers).length;
  const totalAcrossSections = QUIZ_SECTIONS.reduce(
    (sum, s) => sum + getVisibleQuestions(s, answers).length,
    0,
  );

  // Scroll to top of card on question change
  useEffect(() => {
    cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex, currentSectionIndex]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAnswer = useCallback((id: string, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < visibleQs.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      // End of section — save it
      handleSectionComplete();
    }
  }, [currentQuestionIndex, visibleQs.length]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
    } else {
      // Back to landing
      setView('landing');
    }
  }, [currentQuestionIndex]);

  const handleSectionComplete = async () => {
    const sectionId = section.id;

    // Collect answers for this section
    const sectionAnswers: Record<string, string | string[]> = {};
    visibleQs.forEach(q => {
      if (answers[q.id] !== undefined) sectionAnswers[q.id] = answers[q.id];
    });

    // Compute insights if all 4 sections done
    const newDone = new Set([...doneSections, sectionId]);
    const allDone = newDone.size === 4;
    const computed = allDone ? computeInsights(answers) : null;

    setIsSaving(true);
    try {
      await saveSection({
        section: sectionId,
        answers: sectionAnswers,
        ...(computed ? { insights: computed } : {}),
      });

      setDoneSections(newDone);
      if (computed) setInsights(computed);
      setView('section-done');
    } catch {
      toast({ title: 'Could not save progress', variant: 'destructive', description: 'Your answers are saved locally.' });
      setDoneSections(newDone);
      if (computed) setInsights(computed);
      setView('section-done');
    } finally {
      setIsSaving(false);
    }
  };

  const startSection = (idx: number) => {
    setCurrentSectionIndex(idx);
    setCurrentQuestionIndex(0);
    setView('section-intro');
  };

  const continueToQuiz = () => setView('quiz');

  const goToNext = () => {
    const nextIdx = currentSectionIndex + 1;
    if (nextIdx < QUIZ_SECTIONS.length) {
      startSection(nextIdx);
    } else {
      const computed = insights ?? computeInsights(answers);
      setInsights(computed);
      setPreviousResults(computed);
      try { localStorage.setItem('skinevora_skin_story_results', JSON.stringify(computed)); } catch { /* ignore */ }
      setView('results');
    }
  };

  const handleViewResults = () => {
    const computed = computeInsights(answers);
    setInsights(computed);
    setPreviousResults(computed);
    try { localStorage.setItem('skinevora_skin_story_results', JSON.stringify(computed)); } catch { /* ignore */ }
    setView('results');
  };

  const handleRetake = () => {
    // Preserve previous results so the user can still view them
    if (insights) {
      try {
        localStorage.setItem('skinevora_skin_story_results', JSON.stringify(insights));
      } catch { /* ignore */ }
    }
    setAnswers({});
    setDoneSections(new Set());
    setInsights(null);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setView('landing');
    localStorage.removeItem('skinevora_skin_story');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <SEO
        title="Skin Story — Personalised Deep Skin Analysis"
        description="Get a personalised deep analysis of your skin type, concerns, and biology. Receive ingredient recommendations and matched product dupes tailored to you."
        canonical="/skin-story"
        keywords="skin analysis, personalised skincare, skin type analysis, ingredient recommendations"
      />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── LANDING ────────────────────────────────────────────────── */}
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex-1 max-w-xl mx-auto w-full px-4 py-8"
              >
                {/* Hero */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-teal-200">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Your Skin Story
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                    A deep, personalised analysis of your skin, hair, and body. Takes 15–20 minutes.
                    Worth every second.
                  </p>
                  {!user && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      Sign in to save your results and earn points
                    </div>
                  )}
                </div>

                {/* Overall progress */}
                {doneSections.size > 0 && (
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-teal-700">Progress saved</p>
                      <p className="text-xs text-teal-500">{doneSections.size} of 4 sections complete</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-teal-300 text-teal-600 text-xs h-7"
                      onClick={handleViewResults}
                    >
                      View results
                    </Button>
                  </div>
                )}

                {/* Previous results available (after retake) */}
                {doneSections.size === 0 && previousResults && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-700">Previous results available</p>
                      <p className="text-xs text-slate-500">You can view your last Skin Story results anytime</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 text-xs h-7"
                      onClick={() => { setInsights(previousResults); setView('results'); }}
                    >
                      View results
                    </Button>
                  </div>
                )}

                {/* Section cards */}
                <div className="space-y-3">
                  {QUIZ_SECTIONS.map((s, idx) => (
                    <SectionCard
                      key={s.id}
                      section={s}
                      isDone={doneSections.has(s.id as SectionId)}
                      isActive={idx === currentSectionIndex}
                      questionCount={getVisibleQuestions(s, answers).length}
                      onClick={() => startSection(idx)}
                    />
                  ))}
                </div>

                {/* Start CTA */}
                {doneSections.size === 0 && (
                  <Button
                    onClick={() => startSection(0)}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl text-base font-medium gap-2"
                  >
                    Begin Your Skin Story
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            )}

            {/* ── SECTION INTRO ──────────────────────────────────────────── */}
            {view === 'section-intro' && section && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-12 text-center"
              >
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg',
                  `bg-gradient-to-br ${section.gradient}`,
                )}>
                  {section.emoji}
                </div>
                <div className="mb-2">
                  <Badge className="bg-teal-100 text-teal-700 border-0 text-xs mb-3">
                    Section {currentSectionIndex + 1} of {QUIZ_SECTIONS.length}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{section.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
                  {section.description}
                </p>
                <div className="flex gap-4 text-xs text-slate-400 mb-8">
                  <span>{visibleQs.length} questions</span>
                  <span>·</span>
                  <span>~{section.estimatedMinutes} minutes</span>
                </div>
                <Button
                  onClick={continueToQuiz}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-12 rounded-xl text-base font-medium gap-2"
                >
                  {doneSections.has(section.id as SectionId) ? 'Redo this section' : "Let's go"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => setView('landing')}
                  className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Back to sections
                </button>
              </motion.div>
            )}

            {/* ── QUIZ ───────────────────────────────────────────────────── */}
            {view === 'quiz' && section && currentQ && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <QuizProgressBar
                  sectionIndex={currentSectionIndex}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={visibleQs.length}
                  sectionTitle={section.title}
                  sectionEmoji={section.emoji}
                />

                <div
                  ref={cardRef}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="max-w-xl mx-auto px-4 py-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentSectionIndex}-${currentQuestionIndex}`}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.2 }}
                      >
                        <QuestionCard
                          question={currentQ}
                          answers={answers}
                          onAnswer={handleAnswer}
                          onNext={handleNext}
                          onPrev={handlePrev}
                          isFirst={currentQuestionIndex === 0}
                          isLast={currentQuestionIndex === visibleQs.length - 1}
                          questionIndex={currentQuestionIndex}
                          totalQuestions={visibleQs.length}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {isSaving && (
                      <div className="text-center mt-4">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                          <Save className="w-3 h-3 animate-pulse" />
                          Saving…
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SECTION DONE ───────────────────────────────────────────── */}
            {view === 'section-done' && section && (
              <motion.div
                key="section-done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

                  {/* ── Header ────────────────────────────────────────────── */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                      className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg',
                        `bg-gradient-to-br ${section.gradient}`,
                      )}
                    >
                      {section.emoji}
                    </motion.div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      <h2 className="text-xl font-bold text-slate-800">{section.title} — done!</h2>
                    </div>
                    <p className="text-sm text-slate-500">
                      {doneSections.size} of {QUIZ_SECTIONS.length} sections complete
                    </p>
                    {user && (
                      <Badge className="bg-teal-100 text-teal-700 border-0 mt-2">
                        +{doneSections.size === 4 ? 100 : 10} points earned
                      </Badge>
                    )}
                  </div>

                  {/* ── Section-specific result card ──────────────────────── */}
                  <SectionResultCard
                    sectionId={section.id}
                    answers={answers}
                  />

                  {/* ── Progress tracker ──────────────────────────────────── */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                      Your progress
                    </p>
                    <div className="flex gap-2">
                      {QUIZ_SECTIONS.map(s => (
                        <div key={s.id} className="flex-1 text-center">
                          <div className={cn(
                            'w-full aspect-square rounded-xl flex items-center justify-center text-xl mb-1',
                            doneSections.has(s.id as SectionId)
                              ? 'bg-teal-100'
                              : s.id === section.id
                              ? `bg-gradient-to-br ${s.gradient} opacity-60`
                              : 'bg-slate-100',
                          )}>
                            {doneSections.has(s.id as SectionId)
                              ? <CheckCircle2 className="w-5 h-5 text-teal-500" />
                              : s.emoji}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{s.title.replace('Your ', '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── CTAs ──────────────────────────────────────────────── */}
                  <div className="flex flex-col gap-3 pb-4">
                    {doneSections.size < 4 ? (
                      <>
                        <Button
                          onClick={goToNext}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl text-base font-medium gap-2"
                        >
                          Continue to {QUIZ_SECTIONS[currentSectionIndex + 1]?.title ?? 'next section'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setView('landing')}
                          className="w-full h-10 rounded-xl text-sm"
                        >
                          Take a break — progress saved
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleViewResults}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl text-base font-medium gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        See my complete Skin Story
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ────────────────────────────────────────────────── */}
            {view === 'results' && insights && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex-1"
              >
                <Results
                  insights={insights}
                  onRetake={handleRetake}
                  onBrowse={() => navigate(`/browse?mode=products&skin_type=${encodeURIComponent(insights!.skinType)}`)}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
}
