import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SkinTypeSuitabilityData {
  dry: number;
  oily: number;
  sensitive: number;
  combination: number;
  normal: number;
}

interface SkinTypeSuitabilityMatrixProps {
  suitability: SkinTypeSuitabilityData;
  recommendedFor?: string[];
  title?: string;
}

const getSuitabilityColor = (score: number) => {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getSuitabilityLabel = (score: number) => {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Okay';
  return 'Poor';
};

export const SkinTypeSuitabilityMatrix: React.FC<SkinTypeSuitabilityMatrixProps> = ({
  suitability,
  recommendedFor = [],
  title = 'Skin Type Suitability',
}) => {
  const skinTypes = [
    { key: 'dry', label: 'Dry' },
    { key: 'oily', label: 'Oily' },
    { key: 'sensitive', label: 'Sensitive' },
    { key: 'combination', label: 'Combo' },
    { key: 'normal', label: 'Normal' },
  ] as const;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Title and recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {recommendedFor.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                Recommended for:
              </span>
              {recommendedFor.map((st) => (
                <Badge key={st} variant="secondary" className="capitalize">
                  {st}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Horizontal bar chart */}
        <div className="space-y-4">
          {skinTypes.map(({ key, label }) => {
            const score = suitability[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{label}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-12 text-right">
                      {score}
                    </span>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {getSuitabilityLabel(score)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className={`${getSuitabilityColor(score)} h-full transition-all`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-muted-foreground">75+ Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-muted-foreground">50-74 Okay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-muted-foreground">&lt;50 Poor</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
