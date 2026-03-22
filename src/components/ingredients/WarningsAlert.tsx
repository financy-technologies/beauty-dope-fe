import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WarningsAlertProps {
  fungalAcneUnsafe?: boolean;
  pregnancyUnsafe?: boolean;
  irritants?: string[];
  highComedogenicity?: string[];
}

export const WarningsAlert: React.FC<WarningsAlertProps> = ({
  fungalAcneUnsafe = false,
  pregnancyUnsafe = false,
  irritants = [],
  highComedogenicity = [],
}) => {
  const hasWarnings =
    fungalAcneUnsafe || pregnancyUnsafe || irritants.length > 0 || highComedogenicity.length > 0;

  if (!hasWarnings) return null;

  return (
    <Alert className="bg-amber-50 border-amber-200 border-2">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 font-semibold">
        Warnings
      </AlertTitle>
      <AlertDescription className="text-amber-800 space-y-2 mt-2">
        {fungalAcneUnsafe && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Not safe for fungal acne.</strong> This formula may trigger
              fungal acne breakouts. Consider alternatives if prone.
            </span>
          </div>
        )}

        {pregnancyUnsafe && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Not recommended during pregnancy.</strong> Some ingredients
              have limited safety data for pregnancy. Consult your doctor before use.
            </span>
          </div>
        )}

        {highComedogenicity.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>High comedogenicity ingredients:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {highComedogenicity.map((ing) => (
                  <span
                    key={ing}
                    className="inline-block bg-amber-100 px-2 py-1 rounded text-xs capitalize"
                  >
                    {ing.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-1">
                May cause breakouts in acne-prone skin. Consider skipping if sensitive.
              </p>
            </div>
          </div>
        )}

        {irritants.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Potential irritants:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {irritants.map((ing) => (
                  <span
                    key={ing}
                    className="inline-block bg-amber-100 px-2 py-1 rounded text-xs capitalize"
                  >
                    {ing.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-1">
                These may cause irritation for sensitive skin. Patch test first.
              </p>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
