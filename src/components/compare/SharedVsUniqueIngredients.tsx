import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SharedVsUniqueIngredientsProps {
  shared: Array<{ name: string; effects: string[] }>;
  uniqueToProduct1: Array<{ name: string; effects: string[] }>;
  uniqueToProduct2: Array<{ name: string; effects: string[] }>;
  product1Name: string;
  product2Name: string;
}

export const SharedVsUniqueIngredients: React.FC<SharedVsUniqueIngredientsProps> = ({
  shared,
  uniqueToProduct1,
  uniqueToProduct2,
  product1Name,
  product2Name,
}) => {
  return (
    <div className="space-y-4">
      {/* Shared Ingredients */}
      {shared.length > 0 && (
        <Card className="p-4 border-green-200 bg-green-50/30">
          <h4 className="font-semibold text-green-900 mb-3">
            ✓ Shared Ingredients ({shared.length})
          </h4>
          <div className="space-y-2">
            {shared.map((ing) => (
              <div key={ing.name}>
                <p className="text-sm font-medium capitalize">
                  {ing.name.replace(/-/g, ' ')}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ing.effects.map((effect) => (
                    <Badge
                      key={effect}
                      variant="secondary"
                      className="text-xs capitalize bg-green-100"
                    >
                      {effect.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unique Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product 1 Unique */}
        {uniqueToProduct1.length > 0 && (
          <Card className="p-4 border-blue-200 bg-blue-50/30">
            <h4 className="font-semibold text-blue-900 mb-3">
              {product1Name} Only ({uniqueToProduct1.length})
            </h4>
            <div className="space-y-2">
              {uniqueToProduct1.map((ing) => (
                <div key={ing.name}>
                  <p className="text-sm font-medium capitalize">
                    {ing.name.replace(/-/g, ' ')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ing.effects.map((effect) => (
                      <Badge
                        key={effect}
                        variant="secondary"
                        className="text-xs capitalize bg-blue-100"
                      >
                        {effect.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Product 2 Unique */}
        {uniqueToProduct2.length > 0 && (
          <Card className="p-4 border-orange-200 bg-orange-50/30">
            <h4 className="font-semibold text-orange-900 mb-3">
              {product2Name} Only ({uniqueToProduct2.length})
            </h4>
            <div className="space-y-2">
              {uniqueToProduct2.map((ing) => (
                <div key={ing.name}>
                  <p className="text-sm font-medium capitalize">
                    {ing.name.replace(/-/g, ' ')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ing.effects.map((effect) => (
                      <Badge
                        key={effect}
                        variant="secondary"
                        className="text-xs capitalize bg-orange-100"
                      >
                        {effect.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* No ingredients */}
      {shared.length === 0 && uniqueToProduct1.length === 0 && uniqueToProduct2.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground">
          No ingredient data available for comparison
        </Card>
      )}
    </div>
  );
};
