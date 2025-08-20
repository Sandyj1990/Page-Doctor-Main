/**
 * Grammar and Spelling Check Service
 * Provides real-time grammar and spelling analysis for website content
 */

export interface SpellingError {
  word: string;
  position: { start: number; end: number };
  suggestions: string[];
  type: 'spelling' | 'grammar';
  context: string;
}

export interface GrammarSpellingResult {
  totalWords: number;
  spellingErrors: SpellingError[];
  grammarErrors: SpellingError[];
  score: number; // 0-100
  readabilityScore: number;
  suggestions: string[];
  statistics: {
    avgWordsPerSentence: number;
    complexWords: number;
    totalSentences: number;
    readingLevel: string;
  };
}

export class GrammarSpellingService {
  private static readonly COMMON_MISSPELLINGS = new Map([
    ['teh', 'the'],
    ['recieve', 'receive'],
    ['seperate', 'separate'],
    ['definately', 'definitely'],
    ['occured', 'occurred'],
    ['neccessary', 'necessary'],
    ['accomodate', 'accommodate'],
    ['existance', 'existence'],
    ['maintainance', 'maintenance'],
    ['independant', 'independent'],
    ['calender', 'calendar'],
    ['millionaire', 'millionaire'],
    ['lisence', 'license'],
    ['excercise', 'exercise'],
    ['embarass', 'embarrass']
  ]);

  private static readonly GRAMMAR_PATTERNS = [
    {
      pattern: /\b(your|you're)\s+(supposed|going)\s+to\b/gi,
      correct: "you're $2 to",
      description: "Use 'you're' instead of 'your' before verbs"
    },
    {
      pattern: /\b(its|it's)\s+(important|been|going)\b/gi,
      correct: "it's $2", 
      description: "Use 'it's' (it is) instead of 'its' (possessive)"
    },
    {
      pattern: /\b(there|their|they're)\s+(going|are)\b/gi,
      correct: "they're $2",
      description: "Use 'they're' (they are) in this context"
    },
    {
      pattern: /\bto\s+(good|bad|easy|hard)\b/gi,
      correct: "too $1",
      description: "Use 'too' (meaning 'very') instead of 'to'"
    },
    {
      pattern: /\b(could|should|would)\s+of\b/gi,
      correct: "$1 have",
      description: "Use 'have' instead of 'of' after modal verbs"
    }
  ];

  private static readonly READABILITY_FORMULAS = {
    // Flesch Reading Ease
    calculateFleschScore(avgWordsPerSentence: number, avgSyllablesPerWord: number): number {
      return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    },

    getReadingLevel(score: number): string {
      if (score >= 90) return 'Very Easy (5th grade)';
      if (score >= 80) return 'Easy (6th grade)';
      if (score >= 70) return 'Fairly Easy (7th grade)';
      if (score >= 60) return 'Standard (8th-9th grade)';
      if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
      if (score >= 30) return 'Difficult (College level)';
      return 'Very Difficult (Graduate level)';
    }
  };

  /**
   * Analyze text content for grammar and spelling errors
   */
  static analyzeContent(content: string): GrammarSpellingResult {
    if (!content || content.trim().length === 0) {
      return this.getEmptyResult();
    }

    const cleanContent = this.cleanText(content);
    const words = this.extractWords(cleanContent);
    const sentences = this.extractSentences(cleanContent);

    // Check spelling
    const spellingErrors = this.checkSpelling(words, cleanContent);
    
    // Check grammar
    const grammarErrors = this.checkGrammar(cleanContent);
    
    // Calculate readability
    const readabilityStats = this.calculateReadability(words, sentences, cleanContent);
    
    // Calculate overall score
    const score = this.calculateScore(words.length, spellingErrors.length, grammarErrors.length, readabilityStats.fleschScore);

    return {
      totalWords: words.length,
      spellingErrors,
      grammarErrors,
      score,
      readabilityScore: readabilityStats.fleschScore,
      suggestions: this.generateSuggestions(spellingErrors, grammarErrors, readabilityStats),
      statistics: {
        avgWordsPerSentence: readabilityStats.avgWordsPerSentence,
        complexWords: readabilityStats.complexWords,
        totalSentences: sentences.length,
        readingLevel: readabilityStats.readingLevel
      }
    };
  }

  /**
   * Clean text by removing HTML tags and extra whitespace
   */
  private static cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract words from text
   */
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .match(/\b[a-z]+\b/g) || [];
  }

  /**
   * Extract sentences from text
   */
  private static extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
  }

  /**
   * Check spelling using built-in word list and common misspellings
   */
  private static checkSpelling(words: string[], fullText: string): SpellingError[] {
    const errors: SpellingError[] = [];

    words.forEach((word, index) => {
      // Check against common misspellings
      if (this.COMMON_MISSPELLINGS.has(word)) {
        const correct = this.COMMON_MISSPELLINGS.get(word)!;
        const position = this.findWordPosition(word, fullText, index);
        
        errors.push({
          word,
          position,
          suggestions: [correct],
          type: 'spelling',
          context: this.getWordContext(fullText, position)
        });
      }
      // Check for obvious patterns (repeated letters, etc.)
      else if (this.isLikelyMisspelled(word)) {
        const position = this.findWordPosition(word, fullText, index);
        
        errors.push({
          word,
          position,
          suggestions: this.generateSpellingSuggestions(word),
          type: 'spelling',
          context: this.getWordContext(fullText, position)
        });
      }
    });

    return errors;
  }

  /**
   * Check grammar using pattern matching
   */
  private static checkGrammar(text: string): SpellingError[] {
    const errors: SpellingError[] = [];

    this.GRAMMAR_PATTERNS.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          word: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          suggestions: [pattern.correct.replace(/\$(\d+)/g, (_, num) => match[parseInt(num)] || '')],
          type: 'grammar',
          context: this.getWordContext(text, { start: match.index, end: match.index + match[0].length })
        });
      }
    });

    return errors;
  }

  /**
   * Calculate readability statistics
   */
  private static calculateReadability(words: string[], sentences: string[], fullText: string) {
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = this.calculateAverageSyllables(words);
    const complexWords = words.filter(word => this.countSyllables(word) >= 3).length;
    const fleschScore = this.READABILITY_FORMULAS.calculateFleschScore(avgWordsPerSentence, avgSyllablesPerWord);
    const readingLevel = this.READABILITY_FORMULAS.getReadingLevel(fleschScore);

    return {
      avgWordsPerSentence,
      avgSyllablesPerWord,
      complexWords,
      fleschScore: Math.max(0, Math.min(100, fleschScore)), // Clamp to 0-100
      readingLevel
    };
  }

  /**
   * Count syllables in a word (simple approximation)
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    // Simple vowel counting method
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    return Math.max(1, count);
  }

  /**
   * Calculate average syllables per word
   */
  private static calculateAverageSyllables(words: string[]): number {
    if (words.length === 0) return 1;
    
    const totalSyllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
    return totalSyllables / words.length;
  }

  /**
   * Check if a word is likely misspelled based on patterns
   */
  private static isLikelyMisspelled(word: string): boolean {
    // Check for repeated letters (more than 2 in a row, except for common cases)
    if (/(.)\1{2,}/.test(word) && !['aaa', 'eee', 'ooo', 'lll', 'mmm', 'nnn', 'rrr', 'sss', 'ttt'].some(pattern => word.includes(pattern))) {
      return true;
    }
    
    // Check for unlikely letter combinations
    const unlikelyPatterns = [/qq(?!u)/, /bq/, /fq/, /gq/, /jq/, /kq/, /pq/, /vq/, /wq/, /xq/, /yq/, /zq/];
    return unlikelyPatterns.some(pattern => pattern.test(word));
  }

  /**
   * Generate spelling suggestions for a word
   */
  private static generateSpellingSuggestions(word: string): string[] {
    const suggestions: string[] = [];
    
    // Remove repeated letters
    const deduplicated = word.replace(/(.)\1+/g, '$1');
    if (deduplicated !== word) {
      suggestions.push(deduplicated);
    }
    
    // Try common letter substitutions
    const substitutions = [
      [/ck/g, 'k'], [/ph/g, 'f'], [/gh/g, ''], 
      [/ie/g, 'ei'], [/ei/g, 'ie']
    ];
    
    substitutions.forEach(([from, to]) => {
      const variant = word.replace(from, to as string);
      if (variant !== word && suggestions.length < 3) {
        suggestions.push(variant);
      }
    });
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Find word position in text
   */
  private static findWordPosition(word: string, text: string, wordIndex: number): { start: number; end: number } {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    let currentIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      if (currentIndex === wordIndex) {
        return { start: match.index, end: match.index + word.length };
      }
      currentIndex++;
    }
    
    return { start: 0, end: word.length };
  }

  /**
   * Get surrounding context for a word
   */
  private static getWordContext(text: string, position: { start: number; end: number }): string {
    const contextLength = 40;
    const start = Math.max(0, position.start - contextLength);
    const end = Math.min(text.length, position.end + contextLength);
    
    return text.substring(start, end).trim();
  }

  /**
   * Calculate overall score
   */
  private static calculateScore(
    totalWords: number, 
    spellingErrors: number, 
    grammarErrors: number,
    readabilityScore: number
  ): number {
    if (totalWords === 0) return 0;
    
    // Weight factors
    const spellingPenalty = (spellingErrors / totalWords) * 30; // Max 30 points penalty
    const grammarPenalty = (grammarErrors / totalWords) * 40; // Max 40 points penalty  
    const readabilityBonus = Math.max(0, (readabilityScore - 30) / 70) * 30; // 0-30 bonus for good readability
    
    const score = 100 - spellingPenalty - grammarPenalty + readabilityBonus;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(
    spellingErrors: SpellingError[], 
    grammarErrors: SpellingError[], 
    readabilityStats: any
  ): string[] {
    const suggestions: string[] = [];

    if (spellingErrors.length > 0) {
      suggestions.push(`Fix ${spellingErrors.length} spelling error${spellingErrors.length === 1 ? '' : 's'}`);
    }

    if (grammarErrors.length > 0) {
      suggestions.push(`Correct ${grammarErrors.length} grammar issue${grammarErrors.length === 1 ? '' : 's'}`);
    }

    if (readabilityStats.fleschScore < 30) {
      suggestions.push('Simplify sentence structure for better readability');
    } else if (readabilityStats.fleschScore > 90) {
      suggestions.push('Consider adding more detailed explanations');
    }

    if (readabilityStats.avgWordsPerSentence > 20) {
      suggestions.push('Break up long sentences for better readability');
    }

    if (suggestions.length === 0) {
      suggestions.push('Content quality looks good!');
    }

    return suggestions;
  }

  /**
   * Get empty result for invalid input
   */
  private static getEmptyResult(): GrammarSpellingResult {
    return {
      totalWords: 0,
      spellingErrors: [],
      grammarErrors: [],
      score: 0,
      readabilityScore: 0,
      suggestions: ['No content to analyze'],
      statistics: {
        avgWordsPerSentence: 0,
        complexWords: 0,
        totalSentences: 0,
        readingLevel: 'Unknown'
      }
    };
  }

  /**
   * Analyze specific page elements (title, headings, body text)
   */
  static analyzePageContent(doc: Document): {
    title: GrammarSpellingResult;
    headings: GrammarSpellingResult;
    body: GrammarSpellingResult;
    overall: GrammarSpellingResult;
  } {
    const title = doc.title || '';
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => h.textContent || '').join(' ');
    const bodyText = doc.body?.textContent || '';
    const allContent = `${title} ${headings} ${bodyText}`;

    return {
      title: this.analyzeContent(title),
      headings: this.analyzeContent(headings),
      body: this.analyzeContent(bodyText),
      overall: this.analyzeContent(allContent)
    };
  }
} 