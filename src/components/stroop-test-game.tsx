"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface ColorOption {
  name: string;
  value: string; // Hex color value
}

const COLORS_CONFIG: ColorOption[] = [
  { name: "RED", value: "#EF4444" },    // tailwind red-500
  { name: "GREEN", value: "#22C55E" },  // tailwind green-500
  { name: "BLUE", value: "#3B82F6" },   // tailwind blue-500
  { name: "YELLOW", value: "#EAB308" }, // tailwind yellow-500
  { name: "PURPLE", value: "#A855F7" }, // tailwind purple-500
  { name: "ORANGE", value: "#F97316" }, // tailwind orange-500
];

// Utility function to get a contrasting text color (black or white) for a given background hex color
function getContrastingTextColor(hexColor: string): string {
  if (!hexColor.startsWith("#") || hexColor.length !== 7) {
    return 'white'; // Default for invalid hex
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // Formula for perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#000000' : '#FFFFFF'; // Adjusted threshold for better contrast
}

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


export default function StroopTestGame() {
  const [currentWordText, setCurrentWordText] = useState<string>("");
  const [currentDisplayColor, setCurrentDisplayColor] = useState<string>(""); // This is the actual color value (hex)
  const [correctColorName, setCorrectColorName] = useState<string>(""); // Name of the correct color

  const [score, setScore] = useState<number>(0);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [totalResponseTime, setTotalResponseTime] = useState<number>(0);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);

  const [currentTrialStartTime, setCurrentTrialStartTime] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);

  const [buttonColors, setButtonColors] = useState<ColorOption[]>([]);

  const nextTrial = useCallback(() => {
    setFeedbackVisible(false);
    setFeedbackMessage("");

    let wordIndex = Math.floor(Math.random() * COLORS_CONFIG.length);
    let colorIndex = Math.floor(Math.random() * COLORS_CONFIG.length);

    // Ensure word and color are different
    while (wordIndex === colorIndex) {
      colorIndex = Math.floor(Math.random() * COLORS_CONFIG.length);
    }

    setCurrentWordText(COLORS_CONFIG[wordIndex].name);
    setCurrentDisplayColor(COLORS_CONFIG[colorIndex].value);
    setCorrectColorName(COLORS_CONFIG[colorIndex].name);
    
    // Shuffle button colors for each trial to increase difficulty slightly
    setButtonColors(shuffleArray(COLORS_CONFIG));

    setCurrentTrialStartTime(Date.now());
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTrialCount(0);
    setTotalResponseTime(0);
    setAverageResponseTime(0);
    setIsGameStarted(true);
    setFeedbackVisible(false);
    setFeedbackMessage("");
    nextTrial();
  }, [nextTrial]);

  useEffect(() => {
    if (trialCount > 0) {
      setAverageResponseTime(totalResponseTime / trialCount / 1000); // in seconds
    } else {
      setAverageResponseTime(0);
    }
  }, [totalResponseTime, trialCount]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (feedbackVisible) {
      timer = setTimeout(() => {
        nextTrial();
      }, 1500); // Show feedback for 1.5 seconds then move to next trial
    }
    return () => clearTimeout(timer);
  }, [feedbackVisible, nextTrial]);

  const handleColorSelection = (selectedColorName: string) => {
    if (currentTrialStartTime === null || feedbackVisible) return;

    const responseTime = Date.now() - currentTrialStartTime;
    setTotalResponseTime(prev => prev + responseTime);
    setTrialCount(prev => prev + 1);
    setFeedbackVisible(true);

    if (selectedColorName === correctColorName) {
      setScore(prev => prev + 1);
      setFeedbackMessage("Correct!");
      setFeedbackType('correct');
    } else {
      setFeedbackMessage(`Incorrect! The color was ${correctColorName}.`);
      setFeedbackType('incorrect');
    }
  };

  if (!isGameStarted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">StroopTest Challenge</h1>
        <p className="text-lg text-center max-w-md text-muted-foreground">
          Test your cognitive flexibility! Click the button that matches the FONT COLOR of the word, not the word itself.
        </p>
        <Button onClick={startGame} size="lg" className="px-8 py-6 text-xl">
          Start Game
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-extrabold text-primary tracking-tight">StroopTest</CardTitle>
          <Button variant="ghost" size="icon" onClick={startGame} aria-label="Reset Game">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription className="text-center pt-2 !text-base">
          Select the FONT COLOR of the word below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-8 py-8">
        <div
          className="text-7xl font-bold p-4 rounded-lg min-h-[100px] flex items-center justify-center"
          style={{ color: currentDisplayColor }}
          aria-live="polite"
          data-ai-hint="abstract pattern"
        >
          {currentWordText}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full px-4">
          {buttonColors.map((colorOpt) => (
            <Button
              key={colorOpt.name}
              onClick={() => handleColorSelection(colorOpt.name)}
              className="text-base sm:text-lg h-14 sm:h-16 font-medium shadow-md hover:shadow-lg transition-shadow duration-200"
              style={{ 
                backgroundColor: colorOpt.value, 
                color: getContrastingTextColor(colorOpt.value),
                borderColor: getContrastingTextColor(colorOpt.value) === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
                borderWidth: '1px' 
              }}
              aria-label={`Select color ${colorOpt.name}`}
              disabled={feedbackVisible}
            >
              {colorOpt.name}
            </Button>
          ))}
        </div>
        
        {feedbackVisible && (
          <div className={`
            text-xl font-semibold p-3 rounded-md min-h-[60px] flex items-center justify-center text-center
            transition-opacity duration-300 ease-in-out
            ${feedbackVisible ? 'opacity-100' : 'opacity-0'}
            ${feedbackType === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}
            aria-live="assertive">
            {feedbackMessage}
          </div>
        )}
        {!feedbackVisible && <div className="min-h-[60px]"></div>}


      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-around text-base pt-4 pb-6 bg-muted/50 rounded-b-xl">
        <p className="font-medium mb-2 sm:mb-0">Score: <span className="font-bold text-primary">{score}</span></p>
        <p className="font-medium mb-2 sm:mb-0">Trials: <span className="font-bold">{trialCount}</span></p>
        <p className="font-medium">Avg Time: <span className="font-bold text-accent">{averageResponseTime.toFixed(2)}s</span></p>
      </CardFooter>
    </Card>
  );
}
