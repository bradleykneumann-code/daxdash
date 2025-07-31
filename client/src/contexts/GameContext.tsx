import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProgress } from './ProgressContext';

interface GameState {
  currentGame: string | null;
  isPlaying: boolean;
  score: number;
  timeRemaining: number;
  difficulty: 'easy' | 'medium' | 'hard';
  currentLevel: number;
  hintsUsed: number;
  mistakes: number;
}

interface GameData {
  reading: ReadingGameData;
  writing: WritingGameData;
  sightWords: SightWordsGameData;
  comprehension: ComprehensionGameData;
}

interface ReadingGameData {
  stories: Story[];
  currentStory: Story | null;
  completedStories: string[];
  vocabulary: VocabularyWord[];
}

interface Story {
  id: string;
  title: string;
  content: string;
  blanks: Blank[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
}

interface Blank {
  id: string;
  word: string;
  position: number;
  hints: string[];
}

interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  difficulty: number;
}

interface WritingGameData {
  letters: Letter[];
  currentLetter: Letter | null;
  practiceHistory: PracticeAttempt[];
}

interface Letter {
  id: string;
  letter: string;
  formation: string[];
  difficulty: number;
  category: 'uppercase' | 'lowercase' | 'cursive';
}

interface PracticeAttempt {
  letterId: string;
  score: number;
  strokes: Stroke[];
  timestamp: Date;
  feedback: string;
}

interface Stroke {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

interface SightWordsGameData {
  words: SightWord[];
  currentWord: SightWord | null;
  masteredWords: string[];
  gameMode: 'flashcards' | 'matching' | 'beat-the-clock';
}

interface SightWord {
  id: string;
  word: string;
  difficulty: number;
  category: string;
  example: string;
  mastered: boolean;
}

interface ComprehensionGameData {
  passages: ComprehensionPassage[];
  currentPassage: ComprehensionPassage | null;
  completedPassages: string[];
}

interface ComprehensionPassage {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'multiple-choice' | 'drag-drop' | 'true-false';
}

interface GameContextType {
  gameState: GameState;
  gameData: GameData;
  startGame: (gameType: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  updateTime: (time: number) => void;
  useHint: () => void;
  recordMistake: () => void;
  loadGameData: (gameType: string) => Promise<void>;
  saveGameResult: (gameType: string, result: any) => Promise<void>;
  getCurrentGameData: () => any;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { addPoints, updateGameProgress } = useProgress();
  const [gameState, setGameState] = useState<GameState>({
    currentGame: null,
    isPlaying: false,
    score: 0,
    timeRemaining: 0,
    difficulty: 'easy',
    currentLevel: 1,
    hintsUsed: 0,
    mistakes: 0,
  });

  const [gameData, setGameData] = useState<GameData>({
    reading: {
      stories: [],
      currentStory: null,
      completedStories: [],
      vocabulary: [],
    },
    writing: {
      letters: [],
      currentLetter: null,
      practiceHistory: [],
    },
    sightWords: {
      words: [],
      currentWord: null,
      masteredWords: [],
      gameMode: 'flashcards',
    },
    comprehension: {
      passages: [],
      currentPassage: null,
      completedPassages: [],
    },
  });

  const startGame = (gameType: string, difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
    setGameState(prev => ({
      ...prev,
      currentGame: gameType,
      isPlaying: true,
      score: 0,
      timeRemaining: 300, // 5 minutes default
      difficulty,
      currentLevel: 1,
      hintsUsed: 0,
      mistakes: 0,
    }));
  };

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      currentGame: null,
      isPlaying: false,
      score: 0,
      timeRemaining: 0,
      hintsUsed: 0,
      mistakes: 0,
    }));
  };

  const updateScore = (points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  };

  const updateTime = (time: number) => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: time,
    }));
  };

  const useHint = () => {
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
  };

  const recordMistake = () => {
    setGameState(prev => ({
      ...prev,
      mistakes: prev.mistakes + 1,
    }));
  };

  const loadGameData = async (gameType: string) => {
    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch(`/api/games/${gameType}/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGameData(prev => ({
          ...prev,
          [gameType]: data,
        }));
      }
    } catch (error) {
      console.error(`Error loading ${gameType} game data:`, error);
    }
  };

  const saveGameResult = async (gameType: string, result: any) => {
    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch(`/api/games/${gameType}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        const { points, achievements } = await response.json();
        
        // Add points and unlock achievements
        if (points > 0) {
          await addPoints(points, `${gameType} game completion`);
        }
        
        if (achievements && achievements.length > 0) {
          for (const achievementId of achievements) {
            // Achievement unlocking would be handled by ProgressContext
          }
        }

        // Update game progress
        await updateGameProgress(gameType as any, {
          completed: 1,
          bestScore: Math.max(result.score, gameData[gameType as keyof GameData]?.bestScore || 0),
          lastPlayed: new Date(),
        });
      }
    } catch (error) {
      console.error(`Error saving ${gameType} game result:`, error);
    }
  };

  const getCurrentGameData = () => {
    if (!gameState.currentGame) return null;
    return gameData[gameState.currentGame as keyof GameData];
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isPlaying && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.isPlaying, gameState.timeRemaining]);

  // Auto-end game when time runs out
  useEffect(() => {
    if (gameState.timeRemaining <= 0 && gameState.isPlaying) {
      endGame();
    }
  }, [gameState.timeRemaining, gameState.isPlaying]);

  const value: GameContextType = {
    gameState,
    gameData,
    startGame,
    endGame,
    updateScore,
    updateTime,
    useHint,
    recordMistake,
    loadGameData,
    saveGameResult,
    getCurrentGameData,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};