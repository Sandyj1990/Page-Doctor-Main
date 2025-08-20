import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { AlertTriangle, BookOpen, MapPin, Lightbulb } from 'lucide-react';
import { SpellingError } from '@/services/grammarSpellingService';

interface InteractiveErrorHighlightProps {
  text: string;
  errors: SpellingError[];
  onErrorClick: (error: SpellingError) => void;
}

const InteractiveErrorHighlight: React.FC<InteractiveErrorHighlightProps> = ({
  text,
  errors,
  onErrorClick
}) => {
  const [selectedError, setSelectedError] = useState<SpellingError | null>(null);

  const getHighlightedText = () => {
    if (errors.length === 0) return text;

    // Sort errors by position to avoid overlap issues
    const sortedErrors = [...errors].sort((a, b) => a.position.start - b.position.start);
    
    let result = [];
    let lastIndex = 0;

    sortedErrors.forEach((error, index) => {
      // Add text before the error
      if (error.position.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, error.position.start)}
          </span>
        );
      }

      // Add the error with highlighting
      result.push(
        <TooltipProvider key={`error-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-block px-1 rounded cursor-pointer transition-all duration-200
                  ${error.type === 'spelling' 
                    ? 'bg-red-100 text-red-800 border-b-2 border-red-400 hover:bg-red-200' 
                    : 'bg-orange-100 text-orange-800 border-b-2 border-orange-400 hover:bg-orange-200'
                  }
                `}
                onClick={() => {
                  setSelectedError(error);
                  onErrorClick(error);
                }}
              >
                {error.word}
                <span className="ml-1 text-xs">
                  {error.type === 'spelling' ? '📝' : '⚠️'}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {error.type === 'spelling' ? (
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="font-semibold">
                    {error.type === 'spelling' ? 'Spelling Error' : 'Grammar Issue'}
                  </span>
                </div>
                
                <div className="text-sm">
                  <strong>Error:</strong> "{error.word}"
                </div>
                
                {error.suggestions.length > 0 && (
                  <div className="text-sm">
                    <strong>Suggestions:</strong> {error.suggestions.join(', ')}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Click for detailed view
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = error.position.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="space-y-4">
      {/* Error Summary */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="font-semibold">
            {errors.length} error{errors.length !== 1 ? 's' : ''} detected
          </span>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            {errors.filter(e => e.type === 'spelling').length} spelling
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {errors.filter(e => e.type === 'grammar').length} grammar
          </Badge>
        </div>
      </div>

      {/* Interactive Text */}
      <Card className="p-4">
        <div className="text-sm leading-relaxed">
          {getHighlightedText()}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-red-100 border-b-2 border-red-400 rounded"></span>
          <span>Spelling errors (click to fix)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-orange-100 border-b-2 border-orange-400 rounded"></span>
          <span>Grammar issues (click to fix)</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Jump to first error
            if (errors.length > 0) {
              setSelectedError(errors[0]);
              onErrorClick(errors[0]);
            }
          }}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Jump to First Error
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Show suggestions for all errors
            const allSuggestions = errors.flatMap(e => e.suggestions).slice(0, 10);
            alert(`Quick fixes: ${allSuggestions.join(', ')}`);
          }}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Show All Suggestions
        </Button>
      </div>

      {/* Selected Error Details */}
      {selectedError && (
        <Card className="p-4 border-l-4 border-red-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {selectedError.type === 'spelling' ? (
                <BookOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
              <h3 className="font-semibold">
                {selectedError.type === 'spelling' ? 'Spelling Error' : 'Grammar Issue'} Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Error:</div>
                <div className="text-red-600 font-mono">"{selectedError.word}"</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Position:</div>
                <div className="text-gray-600 text-sm">
                  Characters {selectedError.position.start}-{selectedError.position.end}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Context:</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                {selectedError.context}
              </div>
            </div>

            {selectedError.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Suggested Corrections:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedError.suggestions.map((suggestion, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => {
                        // Copy suggestion to clipboard
                        navigator.clipboard?.writeText(suggestion);
                        alert(`Copied "${suggestion}" to clipboard!`);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedError(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InteractiveErrorHighlight; 