import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IngredientCategoriesProps {
  breakdown: {
    actives: string[];
    humectants: string[];
    emollients: string[];
    preservatives: string[];
    chelatingAgents: string[];
  };
}

interface CategorySection {
  title: string;
  key: keyof typeof breakdown;
  color: string;
  icon: string;
}

export const IngredientCategories: React.FC<IngredientCategoriesProps> = ({
  breakdown,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    actives: true,
    humectants: true,
    emollients: false,
    preservatives: false,
    chelatingAgents: false,
  });

  const categories: CategorySection[] = [
    {
      title: 'Actives',
      key: 'actives',
      color: 'bg-primary/10 border-primary/30',
      icon: '⚡',
    },
    {
      title: 'Humectants',
      key: 'humectants',
      color: 'bg-blue-100/50 border-blue-300/30',
      icon: '💧',
    },
    {
      title: 'Emollients',
      key: 'emollients',
      color: 'bg-amber-100/50 border-amber-300/30',
      icon: '🧴',
    },
    {
      title: 'Preservatives',
      key: 'preservatives',
      color: 'bg-slate-100/50 border-slate-300/30',
      icon: '🛡️',
    },
    {
      title: 'Chelating Agents',
      key: 'chelatingAgents',
      color: 'bg-purple-100/50 border-purple-300/30',
      icon: '🔗',
    },
  ];

  const toggleCategory = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Ingredient Breakdown
      </h3>

      {categories.map(({ title, key, color, icon }) => {
        const ingredients = breakdown[key];
        const isExpanded = expanded[key];

        return (
          <Card key={key} className={`border ${color} overflow-hidden`}>
            <button
              onClick={() => toggleCategory(key)}
              className="w-full p-4 flex items-center justify-between hover:bg-black/2 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">{icon}</span>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {ingredients.length} ingredient
                    {ingredients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="mr-2">
                {ingredients.length}
              </Badge>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExpanded && ingredients.length > 0 && (
              <div className="px-4 pb-4 space-y-2 border-t border-border/50 pt-3">
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant="secondary"
                      className="capitalize"
                    >
                      {ingredient.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isExpanded && ingredients.length === 0 && (
              <div className="px-4 pb-4 text-sm text-muted-foreground italic">
                No ingredients in this category
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
