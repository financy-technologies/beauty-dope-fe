import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface IngredientPreferencesPanelProps {
  includeIngredients: string[];
  excludeIngredients: string[];
  onIncludeChange: (ingredients: string[]) => void;
  onExcludeChange: (ingredients: string[]) => void;
  availableIngredients?: string[];
}

export const IngredientPreferencesPanel: React.FC<IngredientPreferencesPanelProps> = ({
  includeIngredients,
  excludeIngredients,
  onIncludeChange,
  onExcludeChange,
  availableIngredients = [],
}) => {
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [includeSuggestions, setIncludeSuggestions] = useState<string[]>([]);
  const [excludeSuggestions, setExcludeSuggestions] = useState<string[]>([]);

  const handleIncludeInputChange = (value: string) => {
    setIncludeInput(value);
    if (value.length >= 2) {
      const filtered = availableIngredients.filter(
        (ing) =>
          ing.toLowerCase().includes(value.toLowerCase()) &&
          !includeIngredients.includes(ing) &&
          !excludeIngredients.includes(ing)
      );
      setIncludeSuggestions(filtered.slice(0, 5));
    } else {
      setIncludeSuggestions([]);
    }
  };

  const handleExcludeInputChange = (value: string) => {
    setExcludeInput(value);
    if (value.length >= 2) {
      const filtered = availableIngredients.filter(
        (ing) =>
          ing.toLowerCase().includes(value.toLowerCase()) &&
          !includeIngredients.includes(ing) &&
          !excludeIngredients.includes(ing)
      );
      setExcludeSuggestions(filtered.slice(0, 5));
    } else {
      setExcludeSuggestions([]);
    }
  };

  const addIncludeIngredient = (ingredient?: string) => {
    const ing = ingredient || includeInput;
    if (ing && !includeIngredients.includes(ing)) {
      onIncludeChange([...includeIngredients, ing]);
      setIncludeInput('');
      setIncludeSuggestions([]);
    }
  };

  const addExcludeIngredient = (ingredient?: string) => {
    const ing = ingredient || excludeInput;
    if (ing && !excludeIngredients.includes(ing)) {
      onExcludeChange([...excludeIngredients, ing]);
      setExcludeInput('');
      setExcludeSuggestions([]);
    }
  };

  const removeInclude = (ingredient: string) => {
    onIncludeChange(includeIngredients.filter((i) => i !== ingredient));
  };

  const removeExclude = (ingredient: string) => {
    onExcludeChange(excludeIngredients.filter((i) => i !== ingredient));
  };

  return (
    <Card className="p-4 space-y-4">
      <p className="text-sm text-muted-foreground">
        💡 Dupes will be re-ranked to prioritize your ingredient preferences.
      </p>

      {/* Include Ingredients */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          ✓ Want to Include
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search ingredient..."
              value={includeInput}
              onChange={(e) => handleIncludeInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addIncludeIngredient();
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={() => addIncludeIngredient()}
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Include Suggestions */}
          {includeSuggestions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {includeSuggestions.map((ing) => (
                <button
                  key={ing}
                  onClick={() => addIncludeIngredient(ing)}
                  className="text-left p-2 rounded border border-primary/20 hover:bg-primary/5 transition-colors text-sm capitalize"
                >
                  {ing.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Include Chips */}
          {includeIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {includeIngredients.map((ing) => (
                <Badge
                  key={ing}
                  variant="outline"
                  className="bg-green-50 border-green-300 text-green-700 pl-3 pr-1 py-1"
                >
                  <span className="capitalize">{ing.replace(/-/g, ' ')}</span>
                  <button
                    onClick={() => removeInclude(ing)}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exclude Ingredients */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-sm font-semibold text-foreground">
          ✗ Want to Exclude
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search ingredient to avoid..."
              value={excludeInput}
              onChange={(e) => handleExcludeInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addExcludeIngredient();
              }}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={() => addExcludeIngredient()}
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Exclude Suggestions */}
          {excludeSuggestions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {excludeSuggestions.map((ing) => (
                <button
                  key={ing}
                  onClick={() => addExcludeIngredient(ing)}
                  className="text-left p-2 rounded border border-red-200 hover:bg-red-50 transition-colors text-sm capitalize"
                >
                  {ing.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Exclude Chips */}
          {excludeIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {excludeIngredients.map((ing) => (
                <Badge
                  key={ing}
                  variant="outline"
                  className="bg-red-50 border-red-300 text-red-700 pl-3 pr-1 py-1"
                >
                  <span className="capitalize">{ing.replace(/-/g, ' ')}</span>
                  <button
                    onClick={() => removeExclude(ing)}
                    className="ml-1 hover:text-red-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
