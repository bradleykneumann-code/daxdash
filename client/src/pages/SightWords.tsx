import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  Clock, 
  Star, 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Volume2,
  VolumeX,
  Zap,
  Target,
  BookOpen,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SightWordGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  type: 'flashcards' | 'beat-clock' | 'matching';
  words: string[];
  definitions?: string[];
}

interface FlashCard {
  word: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SightWords: React.FC = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { startGame, endGame, updateScore, gameState } = useGame();
  
  const [selectedGame, setSelectedGame] = useState<SightWordGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  // Flashcard game state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  
  // Beat the clock game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [gameWords, setGameWords] = useState<string[]>([]);
  
  // Matching game state
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const sightWordGames: SightWordGame[] = [
    {
      id: '1',
      title: 'Flashcard Practice',
      description: 'Learn sight words with interactive flashcards and definitions.',
      difficulty: 'easy',
      timeLimit: 300, // 5 minutes
      points: 60,
      type: 'flashcards',
      words: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had']
    },
    {
      id: '2',
      title: 'Beat the Clock',
      description: 'Type sight words as fast as you can before time runs out!',
      difficulty: 'medium',
      timeLimit: 120, // 2 minutes
      points: 80,
      type: 'beat-clock',
      words: ['with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one']
    },
    {
      id: '3',
      title: 'Word Matching',
      description: 'Match sight words with their meanings in this memory game.',
      difficulty: 'medium',
      timeLimit: 180, // 3 minutes
      points: 70,
      type: 'matching',
      words: ['what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this', 'these']
    }
  ];

  const flashcardData: Record<string, FlashCard> = {
    'the': {
      word: 'the',
      definition: 'Used to refer to a specific person, thing, or group',
      example: 'The cat is sleeping.',
      difficulty: 'easy'
    },
    'and': {
      word: 'and',
      definition: 'Used to connect words, phrases, or clauses',
      example: 'I like apples and oranges.',
      difficulty: 'easy'
    },
    'for': {
      word: 'for',
      definition: 'Used to indicate purpose or duration',
      example: 'This gift is for you.',
      difficulty: 'easy'
    },
    'are': {
      word: 'are',
      definition: 'Present tense of "be" for plural subjects',
      example: 'We are happy.',
      difficulty: 'easy'
    },
    'but': {
      word: 'but',
      definition: 'Used to introduce a contrast or exception',
      example: 'I like ice cream, but I prefer cake.',
      difficulty: 'easy'
    },
    'not': {
      word: 'not',
      definition: 'Used to make a statement negative',
      example: 'I do not like spinach.',
      difficulty: 'easy'
    },
    'you': {
      word: 'you',
      definition: 'Used to refer to the person or people being addressed',
      example: 'You are my friend.',
      difficulty: 'easy'
    },
    'all': {
      word: 'all',
      definition: 'The whole amount or quantity',
      example: 'All the children are here.',
      difficulty: 'easy'
    },
    'can': {
      word: 'can',
      definition: 'To be able to do something',
      example: 'I can swim.',
      difficulty: 'easy'
    },
    'had': {
      word: 'had',
      definition: 'Past tense of "have"',
      example: 'I had a great time.',
      difficulty: 'easy'
    }
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            setGameCompleted(true);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft, endGame]);

  const handleGameSelect = (game: SightWordGame) => {
    setSelectedGame(game);
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentCardIndex(0);
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setWordsCorrect(0);
    setUserInput('');
    setSelectedCards([]);
    setMatchedPairs([]);
    setFlippedCards({});
    setShowResults(false);
    setShowDefinition(false);

    if (game.type === 'flashcards') {
      const gameFlashcards = game.words.map(word => flashcardData[word]).filter(Boolean);
      setFlashcards(gameFlashcards);
    } else if (game.type === 'beat-clock') {
      setGameWords([...game.words].sort(() => Math.random() - 0.5));
    } else if (game.type === 'matching') {
      const shuffled = [...game.words, ...game.words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  };

  const startSelectedGame = () => {
    if (!selectedGame) return;
    
    setGameStarted(true);
    setTimeLeft(selectedGame.timeLimit);
    startGame('sight-words', selectedGame.title);
    
    toast.success(`Starting ${selectedGame.title}! Good luck!`);
  };

  const handleFlashcardAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      toast.success('Correct! Well done! 🎉');
      
      if (soundEnabled) {
        const audio = new Audio('/sounds/correct.mp3');
        audio.play().catch(() => {});
      }
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 2));
      toast.error('Try again! 💪');
      
      if (soundEnabled) {
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.play().catch(() => {});
      }
    }

    // Move to next card
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowDefinition(false);
    } else {
      setTimeout(() => {
        endGame();
        setGameCompleted(true);
        setShowResults(true);
      }, 1000);
    }
  };

  const handleBeatClockInput = (input: string) => {
    setUserInput(input);
    
    if (input.toLowerCase().trim() === gameWords[currentWordIndex].toLowerCase()) {
      setWordsCorrect(prev => prev + 1);
      setScore(prev => prev + 15);
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      
      toast.success('Correct! Next word! 🎯');
      
      if (soundEnabled) {
        const audio = new Audio('/sounds/correct.mp3');
        audio.play().catch(() => {});
      }
      
      if (currentWordIndex >= gameWords.length - 1) {
        setTimeout(() => {
          endGame();
          setGameCompleted(true);
          setShowResults(true);
        }, 1000);
      }
    } else if (input.endsWith(' ')) {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 3));
      setUserInput('');
      
      toast.error('Try again! 💪');
      
      if (soundEnabled) {
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.play().catch(() => {});
      }
    }
  };

  const handleMatchingCard = (word: string, index: number) => {
    if (selectedCards.length === 0) {
      setSelectedCards([word]);
      setFlippedCards(prev => ({ ...prev, [index]: true }));
    } else if (selectedCards.length === 1) {
      const firstWord = selectedCards[0];
      const firstIndex = Object.keys(flippedCards).find(key => 
        shuffledWords[parseInt(key)] === firstWord
      );
      
      if (firstWord === word && firstIndex !== index.toString()) {
        // Match found
        setMatchedPairs(prev => [...prev, word]);
        setScore(prev => prev + 20);
        setFlippedCards(prev => ({ ...prev, [index]: true }));
        
        toast.success('Great match! 🎯');
        
        if (soundEnabled) {
          const audio = new Audio('/sounds/correct.mp3');
          audio.play().catch(() => {});
        }
        
        // Check if game is complete
        if (matchedPairs.length + 1 >= selectedGame!.words.length) {
          setTimeout(() => {
            endGame();
            setGameCompleted(true);
            setShowResults(true);
          }, 1000);
        }
      } else {
        // No match
        setMistakes(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 5));
        setFlippedCards(prev => ({ ...prev, [index]: true }));
        
        toast.error('Not a match! 💪');
        
        if (soundEnabled) {
          const audio = new Audio('/sounds/incorrect.mp3');
          audio.play().catch(() => {});
        }
        
        // Hide cards after a delay
        setTimeout(() => {
          setFlippedCards(prev => ({ ...prev, [index]: false }));
          if (firstIndex) {
            setFlippedCards(prev => ({ ...prev, [firstIndex]: false }));
          }
        }, 1000);
      }
      
      setSelectedCards([]);
    }
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      toast.error('No more hints available!');
      return;
    }

    setHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 5));
    
    if (selectedGame?.type === 'flashcards') {
      setShowDefinition(true);
    } else if (selectedGame?.type === 'beat-clock') {
      toast('💡 Hint: Look at the word carefully!', { icon: '💡' });
    } else if (selectedGame?.type === 'matching') {
      toast('💡 Hint: Remember the positions!', { icon: '💡' });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(selectedGame?.timeLimit || 0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentCardIndex(0);
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setWordsCorrect(0);
    setUserInput('');
    setSelectedCards([]);
    setMatchedPairs([]);
    setFlippedCards({});
    setShowResults(false);
    setShowDefinition(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFlashcardGame = () => {
    if (!flashcards.length || currentCardIndex >= flashcards.length) return null;

    const currentCard = flashcards[currentCardIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">
              Flashcard {currentCardIndex + 1} of {flashcards.length}
            </h2>
            <p className="text-gray-600">
              Read the word and test your knowledge!
            </p>
          </div>

          <motion.div
            key={currentCardIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-6"
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-primary-700 mb-4">
                {currentCard.word}
              </div>
              
              {showDefinition && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="text-lg text-gray-700 mb-2">
                    <strong>Definition:</strong> {currentCard.definition}
                  </div>
                  <div className="text-md text-gray-600">
                    <strong>Example:</strong> {currentCard.example}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFlashcardAnswer(false)}
              className="btn-secondary flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>I Don't Know</span>
            </button>
            
            <button
              onClick={() => handleFlashcardAnswer(true)}
              className="btn-success flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Know This!</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBeatClockGame = () => {
    if (!gameWords.length || currentWordIndex >= gameWords.length) return null;

    const currentWord = gameWords[currentWordIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">
              Beat the Clock!
            </h2>
            <p className="text-gray-600">
              Type the word as fast as you can!
            </p>
          </div>

          <motion.div
            key={currentWordIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 mb-6"
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-700 mb-4">
                {currentWord}
              </div>
              <div className="text-lg text-gray-600">
                Word {currentWordIndex + 1} of {gameWords.length}
              </div>
            </div>
          </motion.div>

          <div className="mb-6">
            <input
              type="text"
              value={userInput}
              onChange={(e) => handleBeatClockInput(e.target.value)}
              placeholder="Type the word here..."
              className="w-full p-4 text-2xl text-center border-2 border-primary-300 rounded-lg focus:border-primary-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            Press spacebar to submit your answer
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMatchingGame = () => {
    if (!shuffledWords.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">
              Word Matching
            </h2>
            <p className="text-gray-600">
              Find matching pairs of words!
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-6">
            {shuffledWords.map((word, index) => (
              <motion.button
                key={index}
                onClick={() => handleMatchingCard(word, index)}
                className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
                  flippedCards[index]
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-100 hover:border-primary-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center h-full text-lg font-bold text-primary-700">
                  {flippedCards[index] ? word : '?'}
                </div>
              </motion.button>
            ))}
          </div>

          {matchedPairs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-success-600">
                Matched Words:
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchedPairs.map((word, index) => (
                  <div key={index} className="bg-success-100 border border-success-200 rounded-lg px-3 py-1">
                    <span className="text-success-700 font-medium">{word}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGameResults = () => {
    if (!selectedGame || !showResults) return null;

    let accuracy = 0;
    let finalScore = score;

    if (selectedGame.type === 'flashcards') {
      accuracy = (correctAnswers / flashcards.length) * 100;
    } else if (selectedGame.type === 'beat-clock') {
      accuracy = (wordsCorrect / gameWords.length) * 100;
    } else if (selectedGame.type === 'matching') {
      accuracy = (matchedPairs.length / selectedGame.words.length) * 100;
    }

    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary-600">
              Game Complete!
            </h2>
            
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3].map(star => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {finalScore} pts
              </div>
              <div className="text-lg text-gray-600 mb-4">
                Accuracy: {accuracy.toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Correct</div>
                <div className="text-2xl font-bold text-green-600">
                  {selectedGame.type === 'flashcards' ? correctAnswers :
                   selectedGame.type === 'beat-clock' ? wordsCorrect :
                   matchedPairs.length}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Hints Used</div>
                <div className="text-2xl font-bold text-blue-600">{hintsUsed}</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={resetGame}
                className="btn-secondary flex-1"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedGame(null);
                }}
                className="btn-primary flex-1"
              >
                Choose Game
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Sight Words
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master sight words with flashcards, speed challenges, and matching games! 
            Build your reading vocabulary and improve recognition speed.
          </p>
        </motion.div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sightWordGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="game-card cursor-pointer"
                onClick={() => handleGameSelect(game)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 text-primary-600" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {game.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(game.timeLimit / 60)}m {game.timeLimit % 60}s</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{game.points} pts</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            {!gameStarted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center"
              >
                <h2 className="text-3xl font-bold mb-4 text-primary-600">
                  {selectedGame.title}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {selectedGame.description}
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Words to Practice:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedGame.words.slice(0, 6).map((word, index) => (
                      <div key={index} className="px-3 py-1 bg-primary-100 rounded-lg text-sm font-medium text-primary-700">
                        {word}
                      </div>
                    ))}
                    {selectedGame.words.length > 6 && (
                      <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                        +{selectedGame.words.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-700">Time Limit</div>
                    <div className="text-lg font-bold text-blue-800">
                      {Math.floor(selectedGame.timeLimit / 60)}m {selectedGame.timeLimit % 60}s
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-700">Max Points</div>
                    <div className="text-lg font-bold text-green-800">{selectedGame.points}</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-yellow-700">Difficulty</div>
                    <div className="text-lg font-bold text-yellow-800 capitalize">
                      {selectedGame.difficulty}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={startSelectedGame}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Game</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div>
                {/* Game Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-600">
                        {selectedGame.title}
                      </h2>
                      <p className="text-gray-600">
                        {selectedGame.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Score</div>
                        <div className="text-2xl font-bold text-primary-600">{score}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Time</div>
                        <div className={`text-2xl font-bold ${
                          timeLeft < 30 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-gray-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Game Content */}
                {selectedGame.type === 'flashcards' && renderFlashcardGame()}
                {selectedGame.type === 'beat-clock' && renderBeatClockGame()}
                {selectedGame.type === 'matching' && renderMatchingGame()}

                {/* Hint Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={useHint}
                    disabled={hintsUsed >= 3}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Hint ({3 - hintsUsed} left)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Results Modal */}
        <AnimatePresence>
          {renderGameResults()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SightWords;