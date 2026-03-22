import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from 'lucide-react';

interface SkinTypeSuitabilityComparisonProps {
  product1: {
    name: string;
    scoreForSkinType: number;
  };
  product2: {
    name: string;
    scoreForSkinType: number;
  };
  skinType: string;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreLabel = (score: number) => {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Okay';
  return 'Poor';
};

export const SkinTypeSuitabilityComparison: React.FC<
  SkinTypeSuitabilityComparisonProps
> = ({ product1, product2, skinType }) => {
  const isBetter1 = product1.scoreForSkinType > product2.scoreForSkinType;
  const isBetter2 = product2.scoreForSkinType > product1.scoreForSkinType;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 capitalize">
        Suitability for {skinType} Skin
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product 1 */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{product1.name}</p>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(product1.scoreForSkinType)}>
                {product1.scoreForSkinType}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            {isBetter1 && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Better Match
              </Badge>
            )}
          </div>
          <p className={`text-sm font-medium ${getScoreColor(product1.scoreForSkinType)}`}>
            {getScoreLabel(product1.scoreForSkinType)}
          </p>
        </div>

        {/* Product 2 */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{product2.name}</p>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(product2.scoreForSkinType)}>
                {product2.scoreForSkinType}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            {isBetter2 && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Better Match
              </Badge>
            )}
          </div>
          <p className={`text-sm font-medium ${getScoreColor(product2.scoreForSkinType)}`}>
            {getScoreLabel(product2.scoreForSkinType)}
          </p>
        </div>
      </div>

      {/* Visual Comparison */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Compatibility Overview</p>
        <div className="flex gap-2 h-6">
          <div className="flex-1 bg-secondary rounded-lg overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${product1.scoreForSkinType}%` }}
            />
          </div>
          <div className="flex-1 bg-secondary rounded-lg overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${product2.scoreForSkinType}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

interface PricePerUnitComparisonProps {
  product1: {
    name: string;
    price: number;
    currency: string;
    pricePerUnit?: number;
  };
  product2: {
    name: string;
    price: number;
    currency: string;
    pricePerUnit?: number;
  };
}

export const PricePerUnitComparison: React.FC<PricePerUnitComparisonProps> = ({
  product1,
  product2,
}) => {
  const isCheaper1 = product1.price < product2.price;
  const savings = isCheaper1
    ? ((product2.price - product1.price) / product2.price) * 100
    : ((product1.price - product2.price) / product1.price) * 100;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Price Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product 1 */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{product1.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{product1.currency}</span>
            <span className="text-3xl font-bold">{product1.price.toFixed(0)}</span>
          </div>
          {product1.pricePerUnit && (
            <p className="text-xs text-muted-foreground">
              {product1.currency} {product1.pricePerUnit.toFixed(2)} per unit
            </p>
          )}
          {isCheaper1 && (
            <Badge className="bg-green-100 text-green-800 w-fit">
              Save {savings.toFixed(0)}%
            </Badge>
          )}
        </div>

        {/* Product 2 */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{product2.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{product2.currency}</span>
            <span className="text-3xl font-bold">{product2.price.toFixed(0)}</span>
          </div>
          {product2.pricePerUnit && (
            <p className="text-xs text-muted-foreground">
              {product2.currency} {product2.pricePerUnit.toFixed(2)} per unit
            </p>
          )}
          {!isCheaper1 && (
            <Badge className="bg-green-100 text-green-800 w-fit">
              Save {savings.toFixed(0)}%
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
