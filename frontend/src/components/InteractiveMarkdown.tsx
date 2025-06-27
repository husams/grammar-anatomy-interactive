import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MarkdownProps {
  children?: React.ReactNode;
  [key: string]: any;
}

interface HeadingProps extends MarkdownProps {
  level: number;
}

interface ExampleTooltip {
  text: string;
  explanation: string;
  position: { x: number; y: number };
}

interface InteractiveMarkdownProps {
  content: string;
  className?: string;
}

const InteractiveMarkdown: React.FC<InteractiveMarkdownProps> = ({ 
  content, 
  className = '' 
}) => {
  const [activeTooltip, setActiveTooltip] = useState<ExampleTooltip | null>(null);

  // Handle grammar example clicks
  const handleExampleClick = useCallback((event: React.MouseEvent, text: string) => {
    event.preventDefault();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    
    // Generate explanation based on the example (this could be enhanced with an API call)
    const explanation = generateExplanation(text);
    
    setActiveTooltip({
      text,
      explanation,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  }, []);

  // Close tooltip
  const closeTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  // Enhanced markdown components with interactive features
  const components = {
    // Enhanced paragraph rendering with grammar detection
    p: ({ children, ...props }: MarkdownProps) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processText(child, handleExampleClick);
        }
        return child;
      });
      
      return (
        <p {...props} className="lesson-text mb-6">
          {processedChildren}
        </p>
      );
    },

    // Enhanced heading styles
    h1: ({ children, level: _level, ...props }: HeadingProps) => (
      <h1 {...props} className="section-heading text-3xl font-bold mb-6 mt-8 first:mt-0">
        {children}
      </h1>
    ),
    
    h2: ({ children, level: _level, ...props }: HeadingProps) => (
      <h2 {...props} className="section-heading text-2xl font-bold mb-4 mt-6">
        {children}
      </h2>
    ),
    
    h3: ({ children, level: _level, ...props }: HeadingProps) => (
      <h3 {...props} className="subsection-heading text-xl font-semibold mb-3 mt-5">
        {children}
      </h3>
    ),

    // Enhanced list styling
    ul: ({ children, ...props }: MarkdownProps) => (
      <ul {...props} className="enhanced-list list-disc list-inside mb-6 space-y-3">
        {children}
      </ul>
    ),

    ol: ({ children, ...props }: MarkdownProps) => (
      <ol {...props} className="enhanced-list list-decimal list-inside mb-6 space-y-3">
        {children}
      </ol>
    ),

    li: ({ children, ...props }: MarkdownProps) => (
      <li {...props} className="lesson-text-secondary ml-4 interactive-element">
        {children}
      </li>
    ),

    // Enhanced code and emphasis
    code: ({ children, ...props }: MarkdownProps) => (
      <code 
        {...props} 
        className="grammar-term px-3 py-1 rounded-lg text-sm font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {children}
      </code>
    ),

    strong: ({ children, ...props }: MarkdownProps) => (
      <strong {...props} className="grammar-important font-bold text-blue-600 dark:text-blue-400">
        {children}
      </strong>
    ),

    em: ({ children, ...props }: MarkdownProps) => (
      <em {...props} className="grammar-term italic text-purple-600 dark:text-purple-400">
        {children}
      </em>
    ),

    // Enhanced blockquote for examples
    blockquote: ({ children, ...props }: MarkdownProps) => (
      <blockquote 
        {...props} 
        className="content-section examples"
      >
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <span>Example</span>
        </div>
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={`interactive-markdown ${className}`} onClick={closeTooltip}>
      <ReactMarkdown components={components as unknown as Partial<Components>}>
        {content}
      </ReactMarkdown>
      
      {/* Tooltip overlay */}
      {activeTooltip && (
        <ExplanationTooltip
          tooltip={activeTooltip}
          onClose={closeTooltip}
        />
      )}
    </div>
  );
};

// Component for explanation tooltips
const ExplanationTooltip: React.FC<{
  tooltip: ExampleTooltip;
  onClose: () => void;
}> = ({ tooltip, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-20"
        onClick={onClose}
      />
      
      {/* Enhanced Tooltip */}
      <div 
        className="fixed z-50 rounded-xl shadow-2xl border max-w-sm animate-in fade-in duration-200"
        style={{
          left: `${tooltip.position.x}px`,
          top: `${tooltip.position.y}px`,
          transform: 'translate(-50%, -100%)',
          background: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="grammar-example text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span>&quot;{tooltip.text}&quot;</span>
            </div>
            <button
              onClick={onClose}
              className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close explanation"
            >
              ✕
            </button>
          </div>
          
          <div className="lesson-text-secondary text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
            {tooltip.explanation}
          </div>
        </div>
        
        {/* Enhanced Arrow */}
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid var(--color-bg-primary)',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
          }}
        />
      </div>
    </>
  );
};

// Helper function to process text and identify grammar examples
const processText = (
  text: string, 
  onExampleClick: (event: React.MouseEvent, text: string) => void
): React.ReactNode => {
  // Enhanced patterns for sophisticated grammar detection with color coding
  const patterns = [
    // Sentences in quotes - interactive examples
    { regex: /"([^"]+)"/g, className: 'grammar-example', type: 'example' },
    
    // Specific grammar terms with intuitive color coding
    { regex: /\b(cat|dog|book|house|person|student|teacher|computer|table|door|window|car|phone|tree|flower|bird|fish|water|food|love|happiness|freedom|knowledge|time|space|music|art|science|history|math|english|language|grammar|sentence|word|letter|man|woman|child|family|friend|school|class|lesson|story|idea|thought|feeling|emotion|dream|goal|plan|project|task|job|work|business|company|office|home|room|kitchen|bedroom|bathroom|garden|park|city|country|world|earth|sun|moon|star|sky|cloud|rain|snow|wind|fire|light|dark|color|sound|voice|noise|music|song|dance|game|sport|ball|team|player|winner|loser|prize|gift|surprise|party|celebration|holiday|vacation|trip|journey|adventure|experience|memory|past|present|future|today|yesterday|tomorrow|morning|afternoon|evening|night|day|week|month|year|season|spring|summer|autumn|winter|weather|temperature|heat|cold|warm|cool)\b/gi, className: 'grammar-noun', type: 'noun' },
    
    { regex: /\b(is|are|was|were|be|being|been|run|runs|ran|running|walk|walks|walked|walking|eat|eats|ate|eating|sleep|sleeps|slept|sleeping|think|thinks|thought|thinking|love|loves|loved|loving|create|creates|created|creating|become|becomes|became|becoming|have|has|had|having|do|does|did|doing|say|says|said|saying|go|goes|went|going|come|comes|came|coming|see|sees|saw|seeing|know|knows|knew|knowing|get|gets|got|getting|give|gives|gave|giving|take|takes|took|taking|make|makes|made|making|find|finds|found|finding|work|works|worked|working|help|helps|helped|helping|learn|learns|learned|learning|teach|teaches|taught|teaching|study|studies|studied|studying|read|reads|reading|write|writes|wrote|writing|speak|speaks|spoke|speaking|listen|listens|listened|listening|play|plays|played|playing|sing|sings|sang|singing|dance|dances|danced|dancing|cook|cooks|cooked|cooking|clean|cleans|cleaned|cleaning|build|builds|built|building|buy|buys|bought|buying|sell|sells|sold|selling|drive|drives|drove|driving|fly|flies|flew|flying|swim|swims|swam|swimming|climb|climbs|climbed|climbing|jump|jumps|jumped|jumping|sit|sits|sat|sitting|stand|stands|stood|standing|lie|lies|lay|lying|fall|falls|fell|falling|rise|rises|rose|rising|open|opens|opened|opening|close|closes|closed|closing|start|starts|started|starting|stop|stops|stopped|stopping|continue|continues|continued|continuing|finish|finishes|finished|finishing|begin|begins|began|beginning|end|ends|ended|ending)\b/gi, className: 'grammar-verb', type: 'verb' },
    
    { regex: /\b(beautiful|ugly|big|small|large|tiny|huge|enormous|tall|short|long|brief|fast|slow|quick|rapid|hot|cold|warm|cool|freezing|boiling|happy|sad|angry|excited|calm|nervous|tired|energetic|hungry|full|thirsty|empty|clean|dirty|neat|messy|new|old|modern|ancient|young|elderly|smart|clever|intelligent|stupid|funny|serious|silly|wise|foolish|kind|mean|nice|cruel|gentle|rough|soft|hard|smooth|bumpy|heavy|light|strong|weak|powerful|delicate|bright|dark|colorful|plain|loud|quiet|noisy|silent|expensive|cheap|valuable|worthless|important|trivial|useful|useless|helpful|harmful|dangerous|safe|easy|difficult|hard|simple|complex|complicated|interesting|boring|exciting|dull|amazing|ordinary|special|normal|strange|weird|familiar|foreign|local|distant|near|far|close|open|closed|free|busy|available|occupied|ready|prepared|finished|complete|incomplete|perfect|imperfect|correct|wrong|right|false|true|real|fake|genuine|artificial|natural|synthetic|healthy|sick|ill|well|fine|terrible|awful|wonderful|excellent|good|bad|better|worse|best|worst|fresh|stale|ripe|rotten|sweet|sour|bitter|salty|spicy|mild|sharp|dull|shiny|matte|transparent|opaque|solid|liquid|gaseous)\b/gi, className: 'grammar-adjective', type: 'adjective' },
    
    { regex: /\b(I|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their|mine|yours|ours|theirs|myself|yourself|himself|herself|itself|ourselves|yourselves|themselves|this|that|these|those|who|whom|whose|which|what|when|where|why|how|someone|somebody|something|anyone|anybody|anything|everyone|everybody|everything|no one|nobody|nothing|one|some|any|all|each|every|both|either|neither|many|few|several|most|more|less|much|little|enough|too|very|quite|rather|fairly|pretty|really|truly|actually|certainly|definitely|probably|possibly|maybe|perhaps|surely|clearly|obviously|apparently|fortunately|unfortunately|hopefully|surprisingly|interestingly|importantly|finally|firstly|secondly|lastly|however|therefore|moreover|furthermore|nevertheless|nonetheless|meanwhile|otherwise|instead|besides|additionally|consequently|accordingly|thus|hence|indeed|naturally|obviously|certainly|definitely|absolutely|completely|entirely|fully|partly|partially|almost|nearly|hardly|barely|scarcely|rarely|seldom|never|always|usually|often|frequently|sometimes|occasionally|once|twice|again|still|yet|already|soon|early|late|now|then|today|tomorrow|yesterday|here|there|everywhere|somewhere|anywhere|nowhere|inside|outside|above|below|under|over|through|across|around|between|among|beside|behind|front|back|left|right|up|down|forward|backward|together|apart|alone|away|home|abroad)\b/gi, className: 'grammar-pronoun', type: 'pronoun' },
    
    // Words in bold or italics (markdown emphasis)
    { regex: /\*\*([^*]+)\*\*/g, className: 'grammar-important', type: 'important' },
    { regex: /\*([^*]+)\*/g, className: 'grammar-term', type: 'term' },
    
    // General grammar terminology
    { regex: /\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|subject|object|predicate|clause|phrase|sentence|paragraph|grammar|syntax|semantics|morphology|phonology|tense|aspect|mood|voice|case|gender|number|person|article|determiner|quantifier|auxiliary|modal|participle|gerund|infinitive|imperative|declarative|interrogative|exclamatory|past|present|future|singular|plural|first|second|third|active|passive|subjunctive|indicative|conditional|perfect|progressive|simple|compound|complex|subordinate|coordinate|independent|dependent|relative|demonstrative|possessive|reflexive|intensive|indefinite|definite|count|noncount|abstract|concrete|proper|common|collective|transitive|intransitive|linking|helping|main|regular|irregular|comparative|superlative|positive|negative|affirmative)\b/gi, className: 'grammar-term', type: 'term' },
  ];

  let processedText: React.ReactNode[] = [text];

  patterns.forEach(({ regex, className, type }) => {
    processedText = processedText.flatMap((segment) => {
      if (typeof segment !== 'string') return [segment];

      const parts = segment.split(regex);
      const result: React.ReactNode[] = [];

      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          if (parts[i]) result.push(parts[i]);
        } else {
          // Matched pattern
          const matchedText = parts[i];
          if (type === 'example') {
            result.push(
              <span
                key={`${type}-${i}`}
                className={className}
                onClick={(e) => onExampleClick(e, matchedText)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onExampleClick(e as any, matchedText);
                  }
                }}
              >
                &quot;{matchedText}&quot;
              </span>
            );
          } else if (['noun', 'verb', 'adjective', 'pronoun'].includes(type)) {
            // Interactive grammar elements with hover explanations
            result.push(
              <span
                key={`${type}-${i}`}
                className={`${className} interactive-element`}
                onClick={(e) => onExampleClick(e, `${matchedText} (${type})`)}
                role="button"
                tabIndex={0}
                title={`Click to learn more about this ${type}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onExampleClick(e as any, `${matchedText} (${type})`);
                  }
                }}
              >
                {matchedText}
              </span>
            );
          } else {
            result.push(
              <span key={`${type}-${i}`} className={className}>
                {matchedText}
              </span>
            );
          }
        }
      }

      return result;
    });
  });

  return processedText;
};

// Helper function to generate explanations for grammar examples
const generateExplanation = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Check if this is a grammar term with type indicator
  if (text.includes('(noun)')) {
    const word = text.replace(' (noun)', '');
    return `"${word}" is a NOUN - a word that names a person, place, thing, or idea. Nouns can be the subject or object of a sentence and can be singular or plural. Examples: "The ${word} is important" or "I see many ${word}s."`;
  }
  
  if (text.includes('(verb)')) {
    const word = text.replace(' (verb)', '');
    return `"${word}" is a VERB - a word that expresses an action, occurrence, or state of being. Verbs change form to show tense (past, present, future). Examples: "I ${word}" (present), "I ${word}ed" (past), "I will ${word}" (future).`;
  }
  
  if (text.includes('(adjective)')) {
    const word = text.replace(' (adjective)', '');
    return `"${word}" is an ADJECTIVE - a word that describes or modifies a noun. Adjectives tell us more about the qualities, characteristics, or properties of nouns. Examples: "The ${word} house" or "Something very ${word}."`;
  }
  
  if (text.includes('(pronoun)')) {
    const word = text.replace(' (pronoun)', '');
    return `"${word}" is a PRONOUN - a word that takes the place of a noun to avoid repetition. Pronouns can be personal (I, you, he), possessive (my, your, his), or demonstrative (this, that). Example: "${word}" instead of repeating a specific noun.`;
  }
  
  // Sentence examples
  if (lowerText.includes('cat') && lowerText.includes('chased')) {
    return 'This sentence demonstrates the basic subject-verb-object structure. "Cat" is the subject (noun), "chased" is the action verb, and "mouse" is the direct object receiving the action.';
  }
  
  if (lowerText.includes('sarah') && lowerText.includes('loves')) {
    return 'This shows a simple sentence with a proper noun subject "Sarah" and an action verb "loves" expressing emotion or preference.';
  }
  
  if (lowerText.includes('happiness') && lowerText.includes('is')) {
    return 'This sentence uses a linking verb "is" to connect the abstract noun "happiness" with a descriptive word, showing a state of being rather than an action.';
  }
  
  if (lowerText.includes('beautiful') && lowerText.includes('flower')) {
    return 'This example shows how adjectives modify nouns. "Beautiful" (adjective) describes the quality of "flower" (noun), creating a more vivid and specific image.';
  }
  
  // General grammar term explanations
  if (lowerText.includes('subject')) {
    return 'The SUBJECT is who or what the sentence is about. It usually comes before the verb and answers "who?" or "what?" is doing the action.';
  }
  
  if (lowerText.includes('predicate')) {
    return 'The PREDICATE tells us what the subject does or is. It includes the verb and all the words that complete the thought about the subject.';
  }
  
  if (lowerText.includes('clause')) {
    return 'A CLAUSE is a group of words containing a subject and a predicate. Independent clauses can stand alone as sentences, while dependent clauses need to be attached to independent clauses.';
  }
  
  // Default explanation
  return 'This example demonstrates key grammatical concepts. Grammar helps us understand how words work together to create meaning. Click on individual colored words to learn more about their specific grammatical roles and functions.';
};

export default InteractiveMarkdown;