
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../firebase/hosting/src/contexts/auth-context';
import { saveStroopSession, type RoundResultData } from '@/lib/firebase/firestore-service';
import { useToast } from "../../firebase/hosting/src/hooks/use-toast";


interface ColorOption {
  name: string;
  value: string; // Hex color value
}

const COLORS_CONFIG: ColorOption[] = [
  { name: "RED", value: "#EF4444" },
  { name: "GREEN", value: "#22C55E" },
  { name: "BLUE", value: "#3B82F6" },
  { name: "YELLOW", value: "#EAB308" },
  { name: "PURPLE", value: "#A855F7" },
  { name: "ORANGE", value: "#F97316" },
];

// Read round duration from environment variable, fallback to 120
const envRoundDuration = process.env.NEXT_PUBLIC_STROOP_ROUND_DURATION_SECONDS;
const parsedEnvRoundDuration = envRoundDuration ? parseInt(envRoundDuration, 10) : NaN;
const ROUND_DURATION = !isNaN(parsedEnvRoundDuration) && parsedEnvRoundDuration > 0 ? parsedEnvRoundDuration : 120;


interface RoundConfig {
  id: string;
  title: string;
  instruction: string;
  rule: 'word' | 'color';
}

const ROUNDS_CONFIG: RoundConfig[] = [
  {
    id: 'wordMatch',
    title: 'Round 1: Match Word Meaning',
    instruction: 'Click the button corresponding to the MEANING of the word displayed, ignoring the font color. For example, if you see the word "RED" written in blue font, click the "RED" button.',
    rule: 'word',
  },
  {
    id: 'colorMatch',
    title: 'Round 2: Match Font Color',
    instruction: 'Click the button corresponding to the FONT COLOR of the word, ignoring what the word says. For example, if you see the word "RED" written in blue font, click the "BLUE" button.',
    rule: 'color',
  },
];

// Utility function to get a contrasting text color
function getContrastingTextColor(hexColor: string): string {
  if (!hexColor.startsWith("#") || hexColor.length !== 7) {
    return 'white';
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#000000' : '#FFFFFF';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentWordText, setCurrentWordText] = useState<string>("");
  const [currentDisplayColor, setCurrentDisplayColor] = useState<string>("");
  const [correctColorName, setCorrectColorName] = useState<string>("");

  const [score, setScore] = useState<number>(0);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [totalResponseTime, setTotalResponseTime] = useState<number>(0);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);

  const [currentTrialStartTime, setCurrentTrialStartTime] = useState<number | null>(null);
  
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);

  const [buttonColors, setButtonColors] = useState<ColorOption[]>([]);

  const [gamePhase, setGamePhase] = useState<'initial' | 'instructions' | 'playing' | 'roundSummary'>('initial');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);

  const [completedRoundsData, setCompletedRoundsData] = useState<RoundResultData[]>([]);
  const [hasSavedCurrentSession, setHasSavedCurrentSession] = useState<boolean>(false);


  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timers on component unmount
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const endCurrentRound = useCallback(() => {
    const currentRoundConfig = ROUNDS_CONFIG[currentRoundIndex];
    const roundResult: RoundResultData = {
      roundId: currentRoundConfig.id,
      title: currentRoundConfig.title,
      score: score,
      trials: trialCount,
      averageResponseTimeSeconds: parseFloat(averageResponseTime.toFixed(2)),
    };
    setCompletedRoundsData(prev => [...prev, roundResult]);
    setGamePhase('roundSummary');
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackVisible(false);
  }, [currentRoundIndex, score, trialCount, averageResponseTime]);

  const nextTrial = useCallback(() => {
    if (gamePhase !== 'playing') {
      setFeedbackVisible(false);
      return;
    }

    setFeedbackVisible(false);
    setFeedbackMessage("");

    let wordIndex = Math.floor(Math.random() * COLORS_CONFIG.length);
    let colorIndex = Math.floor(Math.random() * COLORS_CONFIG.length);
    
    const currentRule = ROUNDS_CONFIG[currentRoundIndex].rule;
    if (currentRule === 'color') {
      // Ensure word meaning and font color are different for the 'colorMatch' round to increase difficulty
      while (wordIndex === colorIndex) { 
        colorIndex = Math.floor(Math.random() * COLORS_CONFIG.length);
      }
    }

    setCurrentWordText(COLORS_CONFIG[wordIndex].name);
    setCurrentDisplayColor(COLORS_CONFIG[colorIndex].value);
    
    const determinedCorrectColorName = (currentRule === 'word')
      ? COLORS_CONFIG[wordIndex].name
      : COLORS_CONFIG[colorIndex].name;
    setCorrectColorName(determinedCorrectColorName);

    setButtonColors(shuffleArray(COLORS_CONFIG));
    setCurrentTrialStartTime(Date.now());
  }, [gamePhase, currentRoundIndex]);


  const handleStartGame = useCallback(() => {
    setCurrentRoundIndex(0);
    setCompletedRoundsData([]);
    setHasSavedCurrentSession(false);
    setGamePhase('instructions');
  }, []);

  const handleBeginRound = useCallback(() => {
    setScore(0);
    setTrialCount(0);
    setTotalResponseTime(0);
    setAverageResponseTime(0);
    setFeedbackVisible(false);
    setFeedbackMessage("");
    
    setGamePhase('playing');
    setTimeLeft(ROUND_DURATION);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // clearInterval(gameTimerRef.current!); // Already cleared in endCurrentRound or unmount
          return 0; 
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const handleNextRound = useCallback(() => {
    setCurrentRoundIndex(prev => prev + 1);
    setGamePhase('instructions');
  }, []);

  const handleRestartGame = useCallback(() => {
    setGamePhase('initial');
    setCompletedRoundsData([]);
    setHasSavedCurrentSession(false);
  }, []);


  useEffect(() => {
    // This effect calls nextTrial only when gamePhase is 'playing' and it's effectively the start of the round for actual gameplay
    if (gamePhase === 'playing' && timeLeft === ROUND_DURATION && score === 0 && trialCount === 0) {
      nextTrial();
    }
  }, [gamePhase, timeLeft, score, trialCount, nextTrial]);

  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft <= 0) {
      endCurrentRound();
    }
  }, [timeLeft, gamePhase, endCurrentRound]);

  useEffect(() => {
    if (trialCount > 0) {
      setAverageResponseTime(totalResponseTime / trialCount / 1000);
    } else {
      setAverageResponseTime(0);
    }
  }, [totalResponseTime, trialCount]);

  useEffect(() => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (feedbackVisible && gamePhase === 'playing') {
      feedbackTimerRef.current = setTimeout(() => {
        if (gamePhase === 'playing') { // Ensure still playing before calling nextTrial
           nextTrial();
        } else {
           setFeedbackVisible(false); // Clear feedback if phase changed (e.g. round ended)
        }
      }, 1500); // Show feedback for 1.5 seconds
    }
    // Cleanup function for the timeout
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [feedbackVisible, gamePhase, nextTrial]);

  // Effect to save game session data
   useEffect(() => {
    if (
      gamePhase === 'roundSummary' &&
      currentRoundIndex === ROUNDS_CONFIG.length - 1 && // On summary of the last round
      user &&
      !hasSavedCurrentSession &&
      completedRoundsData.length === ROUNDS_CONFIG.length // Ensure all data is collected
    ) {
      const sessionDataToSave: any = {
        timestamp: new Date(), // Firestore will convert this to Timestamp
      };
      completedRoundsData.forEach((result, index) => {
        const roundNum = index + 1; // Assuming rounds are 1-indexed for keys
        sessionDataToSave[`round\${roundNum}Id`] = result.roundId;
        sessionDataToSave[`round\${roundNum}Title`] = result.title;
        sessionDataToSave[`round\${roundNum}Score`] = result.score;
        sessionDataToSave[`round\${roundNum}Trials`] = result.trials;
        sessionDataToSave[`round\${roundNum}AverageResponseTimeSeconds`] = result.averageResponseTimeSeconds;
      });

      saveStroopSession(user.uid, sessionDataToSave)
        .then(response => {
          if (response.success) {
            toast({ title: "Game Saved!", description: "Your results have been saved to your dashboard." });
            setHasSavedCurrentSession(true);
          } else {
            toast({ title: "Save Failed", description: "Could not save your game results. Please try again.", variant: "destructive" });
            console.error("Failed to save session:", response.error);
          }
        })
        .catch(error => {
          toast({ title: "Save Error", description: "An unexpected error occurred while saving.", variant: "destructive" });
          console.error("Error in saveStroopSession promise:", error);
        });
    }
  }, [gamePhase, currentRoundIndex, user, completedRoundsData, hasSavedCurrentSession, toast]);


  const handleColorSelection = (selectedColorName: string) => {
    if (gamePhase !== 'playing' || currentTrialStartTime === null || feedbackVisible) return;

    const responseTime = Date.now() - currentTrialStartTime;
    setTotalResponseTime(prev => prev + responseTime);
    setTrialCount(prev => prev + 1);
    setFeedbackVisible(true);

    if (selectedColorName === correctColorName) {
      setScore(prev => prev + 1);
      setFeedbackMessage("Correct!");
      setFeedbackType('correct');
    } else {
      setFeedbackMessage(`Incorrect! The answer was \${correctColorName}.`);
      setFeedbackType('incorrect');
    }
  };

  if (gamePhase === 'initial') {
    return (
      <div className="flex flex-col items-center space-y-6 p-4 text-center">
        <h1 className="text-4xl font-bold text-primary">Stroop Test Challenge</h1>
        <p className="text-lg max-w-md text-muted-foreground">
          This test measures your cognitive flexibility and processing speed.
          You will go through two rounds with different rules.
        </p>
        <Button onClick={handleStartGame} size="lg" className="px-8 py-6 text-xl shadow-lg hover:shadow-primary/50 transition-shadow">
          Start Game <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (gamePhase === 'instructions') {
    const roundConfig = ROUNDS_CONFIG[currentRoundIndex];
    return (
      <Card className="w-full max-w-lg shadow-2xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-primary tracking-tight text-center">{roundConfig.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 py-6">
          <p className="text-lg text-muted-foreground whitespace-pre-line">{roundConfig.instruction}</p>
          <p className="text-md font-semibold">You will have {ROUND_DURATION} seconds.</p>
        </CardContent>
        <CardFooter className="flex justify-center pt-4 pb-6">
          <Button onClick={handleBeginRound} size="lg" className="px-8 py-4 text-lg shadow-md hover:shadow-primary/40 transition-shadow">
            Begin Round <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (gamePhase === 'roundSummary') {
    // Find the data for the round that just finished.
    // currentRoundIndex is the index of the round that just ended.
    // completedRoundsData should now contain this round's data at the end.
    const justCompletedRoundData = completedRoundsData[currentRoundIndex]; 
    const roundConfig = ROUNDS_CONFIG[currentRoundIndex];
    const isLastRound = currentRoundIndex === ROUNDS_CONFIG.length - 1;
    
    if (!justCompletedRoundData) {
        // Should not happen if logic is correct, but a fallback
        return (
            <Card className="w-full max-w-lg shadow-2xl rounded-xl">
                <CardHeader><CardTitle>Loading Summary...</CardTitle></CardHeader>
                <CardContent><p>Preparing your results...</p></CardContent>
            </Card>
        );
    }

    return (
      <Card className="w-full max-w-lg shadow-2xl rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-extrabold text-primary tracking-tight text-center">
            {roundConfig.title} Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 py-8 text-center">
          <p className="text-xl">Your score for this round: <span className="font-bold text-primary text-2xl">{justCompletedRoundData.score}</span></p>
          <p className="text-lg">Total trials: <span className="font-bold">{justCompletedRoundData.trials}</span></p>
          <p className="text-lg">Average response time: <span className="font-bold text-accent">{justCompletedRoundData.averageResponseTimeSeconds.toFixed(2)}s</span></p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 pb-6 bg-muted/30 rounded-b-xl">
          {!isLastRound && (
            <Button onClick={handleNextRound} size="lg" className="px-8 py-4 text-lg shadow-md hover:shadow-primary/40 transition-shadow">
              Next Round <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
          <Button onClick={handleRestartGame} variant={isLastRound ? "default" : "outline"} size="lg" className="px-8 py-4 text-lg shadow-md hover:shadow-primary/40 transition-shadow">
            {isLastRound ? "Play Again" : "Restart Game"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // gamePhase === 'playing'
  const currentRoundConfig = ROUNDS_CONFIG[currentRoundIndex];
  return (
    <Card className="w-full max-w-lg shadow-2xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{currentRoundConfig.title}</CardTitle>
          <div className="text-right space-y-1">
             <p className="text-xl font-semibold text-accent">Time: {timeLeft}s</p>
             <Button variant="ghost" size="icon" onClick={handleRestartGame} aria-label="Restart Game" className="h-8 w-8">
                <RefreshCw className="h-5 w-5" />
             </Button>
          </div>
        </div>
        <CardDescription className="text-center pt-2 !text-base">
          {currentRoundConfig.rule === 'word' ? 'Select the MEANING of the word.' : 'Select the FONT COLOR of the word.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-8 py-8">
        <div
          className="text-6xl sm:text-7xl font-bold p-4 rounded-lg min-h-[100px] flex items-center justify-center select-none"
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
              aria-label={`Select color \${colorOpt.name}`}
              disabled={feedbackVisible}
            >
              {colorOpt.name}
            </Button>
          ))}
        </div>
        
        {feedbackVisible && (
          <div className={`
            text-lg sm:text-xl font-semibold p-3 rounded-md min-h-[60px] flex items-center justify-center text-center
            transition-opacity duration-300 ease-in-out
            \${feedbackVisible ? 'opacity-100' : 'opacity-0'}
            \${feedbackType === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}
            aria-live="assertive">
            {feedbackMessage}
          </div>
        )}
        {!feedbackVisible && <div className="min-h-[60px]"></div>} {/* Placeholder for layout stability */}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-around text-base pt-4 pb-6 bg-muted/30 rounded-b-xl">
        <p className="font-medium mb-2 sm:mb-0">Score: <span className="font-bold text-primary">{score}</span></p>
        <p className="font-medium mb-2 sm:mb-0">Trials: <span className="font-bold">{trialCount}</span></p>
        <p className="font-medium">Avg Time: <span className="font-bold text-accent">{averageResponseTime.toFixed(2)}s</span></p>
      </CardFooter>
    </Card>
  );
}

    
