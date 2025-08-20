import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BookOpen, AlertTriangle, CheckCircle, X, Copy, MapPin } from 'lucide-react';
import { SpellingError, GrammarSpellingResult } from '@/services/grammarSpellingService';
import InteractiveErrorHighlight from './InteractiveErrorHighlight';

interface SpellCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: GrammarSpellingResult;
  pageName?: string;
}

const SpellCheckModal: React.FC<SpellCheckModalProps> = ({
  isOpen,
  onClose,
  results,
  pageName = 'Current Page'
}) => {
  const [selectedError, setSelectedError] = useState<SpellingError | null>(null);
  const [showInteractiveView, setShowInteractiveView] = useState(false);

  const handleErrorClick = (error: SpellingError) => {
    setSelectedError(error);
    // Auto-scroll to error details
    setTimeout(() => {
      const errorElement = document.querySelector(`[data-error-id="${error.word}-${error.position.start}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const copyErrorToClipboard = (error: SpellingError) => {
    const errorInfo = `Error: "${error.word}"\nType: ${error.type}\nContext: ${error.context}\nSuggestions: ${error.suggestions.join(', ')}`;
    navigator.clipboard?.writeText(errorInfo);
  };
  const getErrorTypeIcon = (type: 'spelling' | 'grammar') => {
    return type === 'spelling' ? (
      <BookOpen className="w-4 h-4 text-blue-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-orange-500" />
    );
  };

  const getErrorTypeBadge = (type: 'spelling' | 'grammar') => {
    return type === 'spelling' ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        Spelling
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
        Grammar
      </Badge>
    );
  };

  const ErrorItem: React.FC<{ error: SpellingError; index: number }> = ({ error, index }) => (
    <div 
      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      data-error-id={`${error.word}-${error.position.start}`}
      onClick={() => handleErrorClick(error)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getErrorTypeIcon(error.type)}
          <span className="font-medium text-red-600 dark:text-red-400">
            "{error.word}"
          </span>
          {getErrorTypeBadge(error.type)}
          <Badge variant="outline" className="text-xs">
            #{index + 1}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyErrorToClipboard(error);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleErrorClick(error);
            }}
          >
            <MapPin className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-300">
        <div className="font-medium mb-1">Context:</div>
        <div className="bg-white dark:bg-gray-900 p-2 rounded border">
          <code className="text-xs">{error.context}</code>
        </div>
      </div>

      {error.suggestions.length > 0 && (
        <div className="text-sm">
          <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">
            Suggestions:
          </div>
          <div className="flex flex-wrap gap-2">
            {error.suggestions.map((suggestion, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(suggestion);
                }}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 italic">
        Click to highlight in context • Position: {error.position.start}-{error.position.end}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Grammar & Spelling Report - {pageName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{results.totalWords}</div>
              <div className="text-sm text-blue-600">Total Words</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{results.spellingErrors.length}</div>
              <div className="text-sm text-red-600">Spelling Errors</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{results.grammarErrors.length}</div>
              <div className="text-sm text-orange-600">Grammar Issues</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{results.score}</div>
              <div className="text-sm text-green-600">Overall Score</div>
            </div>
          </div>

          {/* Readability Stats */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Readability Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Reading Level</div>
                <div className="text-gray-600 dark:text-gray-300">{results.statistics.readingLevel}</div>
              </div>
              <div>
                <div className="font-medium">Avg Words/Sentence</div>
                <div className="text-gray-600 dark:text-gray-300">{Math.round(results.statistics.avgWordsPerSentence)}</div>
              </div>
              <div>
                <div className="font-medium">Complex Words</div>
                <div className="text-gray-600 dark:text-gray-300">{results.statistics.complexWords}</div>
              </div>
              <div>
                <div className="font-medium">Flesch Score</div>
                <div className="text-gray-600 dark:text-gray-300">{Math.round(results.readabilityScore)}/100</div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {results.suggestions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                💡 Improvement Suggestions
              </h3>
              <ul className="space-y-2">
                {results.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive View Toggle */}
          {(results.spellingErrors.length > 0 || results.grammarErrors.length > 0) && (
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Detected Issues ({results.spellingErrors.length + results.grammarErrors.length} total)
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInteractiveView(!showInteractiveView)}
              >
                {showInteractiveView ? 'List View' : 'Interactive View'}
              </Button>
            </div>
          )}

          {/* Errors List or Interactive View */}
          {(results.spellingErrors.length > 0 || results.grammarErrors.length > 0) ? (
            showInteractiveView ? (
              <InteractiveErrorHighlight
                text={`Sample content with errors. ${[...results.spellingErrors, ...results.grammarErrors].map(e => e.context).join(' ')}`}
                errors={[...results.spellingErrors, ...results.grammarErrors]}
                onErrorClick={handleErrorClick}
              />
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-4 pr-4">
                  {[...results.spellingErrors, ...results.grammarErrors].map((error, idx) => (
                    <ErrorItem key={idx} error={error} index={idx} />
                  ))}
                </div>
              </ScrollArea>
            )
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 p-8 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                Excellent Writing Quality!
              </h3>
              <p className="text-green-600 dark:text-green-400">
                No spelling or grammar issues detected. Your content is well-written and clear.
              </p>
            </div>
          )}
        </div>

        <Separator />
        
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellCheckModal; 