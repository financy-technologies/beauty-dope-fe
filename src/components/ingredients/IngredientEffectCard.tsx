import React from 'react';
import {
  Droplet,
  Sparkles,
  Zap,
  Wind,
  Sun,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface IngredientData {
  name: string;
  effects: string[];
  comedogenicity: number;
  skinTypeScores?: {
    dry: number;
    oily: number;
    sensitive: number;
    combination: number;
    normal: number;
  };
  warnings?: string[];
}

const effectIconMap: Record<string, React.ReactNode> = {
  'hydrating': <Droplet className="w-4 h-4" />,
  'anti-aging': <Sparkles className="w-4 h-4" />,
  'exfoliating': <Zap className="w-4 h-4" />,
  'soothing': <Wind className="w-4 h-4" />,
  'brightening': <Sun className="w-4 h-4" />,
  'anti-inflammatory': <Wind className="w-4 h-4" />,
};

const getComedogenicityColor = (score: number) => {
  if (score === 0) return 'bg-green-100 text-green-800';
  if (score <= 2) return 'bg-yellow-100 text-yellow-800';
  if (score <= 3) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getComedogenicityLabel = (score: number) => {
  if (score === 0) return 'Non-comedogenic';
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Moderate';
  return 'High';
};

interface IngredientEffectCardProps {
  ingredient: IngredientData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const IngredientEffectCard: React.FC<IngredientEffectCardProps> = ({
  ingredient,
  isExpanded = false,
  onToggle,
}) => {
  return (
    <Card className="p-4 border border-primary/20 hover:border-primary/40 transition-colors">
      <div
        className="cursor-pointer flex items-start justify-between"
        onClick={onToggle}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-lg capitalize text-foreground">
            {ingredient.name}
          </h3>

          {/* Effects Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {ingredient.effects.map((effect) => (
              <Badge
                key={effect}
                variant="outline"
                className="bg-primary/10 border-primary/30 text-primary text-xs flex items-center gap-1"
              >
                {effectIconMap[effect] || null}
                <span>{effect.replace(/-/g, ' ')}</span>
              </Badge>
            ))}
          </div>

          {/* Comedogenicity */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Comedogenicity:
            </span>
            <Badge className={`${getComedogenicityColor(ingredient.comedogenicity)}`}>
              {ingredient.comedogenicity}/5
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getComedogenicityLabel(ingredient.comedogenicity)}
            </span>
          </div>
        </div>

        {onToggle && (
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {/* Skin Type Scores */}
          {ingredient.skinTypeScores && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                Skin Type Compatibility
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(ingredient.skinTypeScores).map(([type, score]) => (
                  <div key={type} className="text-center">
                    <div className="h-16 bg-secondary rounded-lg flex items-end justify-center overflow-hidden">
                      <div
                        className="w-full bg-primary transition-all"
                        style={{ height: `${score}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium capitalize mt-1">
                      {type}
                    </p>
                    <p className="text-xs text-muted-foreground">{score}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {ingredient.warnings && ingredient.warnings.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                {ingredient.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
};
