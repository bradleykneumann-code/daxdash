import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReadingGame {
  id: string;
  type: 'fill-blank' | 'word-match';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
}

interface FillBlankStory {
  id: string;
  title: string;
  story: string;
  blanks: Array<{
    id: string;
    word: string;
    options: string[];
    position: number;
  }>;
  image?: string;
}

interface WordMatchGame {
  id: string;
  title: string;
  words: Array<{
    id: string;
    word: string;
    definition: string;
    image?: string;
  }>;
  pairs: Array<{
    id: string;
    word1: string;
    word2: string;
    relationship: string;
  }>;
}

const ReadingGames: React.FC = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { startGame, endGame, updateScore, gameState } = useGame();
  
  const [selectedGame, setSelectedGame] = useState<ReadingGame | null>(null);
  const [currentStory, setCurrentStory] = useState<FillBlankStory | null>(null);
  const [currentWordMatch, setCurrentWordMatch] = useState<WordMatchGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Fill-in-the-blank game state
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);

  // Word matching game state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wordMatches, setWordMatches] = useState(0);

  const readingGames: ReadingGame[] = [
    {
      id: '1',
      type: 'fill-blank',
      title: 'The Magic Garden',
      description: 'Fill in the missing words to complete the story about a magical garden.',
      difficulty: 'easy',
      timeLimit: 300, // 5 minutes
      points: 50
    },
    {
      id: '2',
      type: 'fill-blank',
      title: 'The Brave Little Mouse',
      description: 'Help the little mouse find his way home by completing the story.',
      difficulty: 'medium',
      timeLimit: 240, // 4 minutes
      points: 75
    },
    {
      id: '3',
      type: 'word-match',
      title: 'Animal Friends',
      description: 'Match animals with their homes and characteristics.',
      difficulty: 'easy',
      timeLimit: 180, // 3 minutes
      points: 40
    },
    {
      id: '4',
      type: 'word-match',
      title: 'Colorful World',
      description: 'Match colors with objects and learn new vocabulary.',
      difficulty: 'medium',
      timeLimit: 150, // 2.5 minutes
      points: 60
    }
  ];

  const fillBlankStories: FillBlankStory[] = [
    {
      id: '1',
      title: 'The Magic Garden',
      story: 'Once upon a time, there was a ___ garden behind the old house. Every morning, the ___ would sing beautiful songs. The flowers were so ___ that they seemed to dance in the breeze. A little girl named Emma loved to ___ in the garden and watch the butterflies. One day, she found a ___ key that opened a tiny door in the garden wall.',
      blanks: [
        {
          id: '1',
          word: 'magical',
          options: ['magical', 'big', 'small', 'green'],
          position: 1
        },
        {
          id: '2',
          word: 'birds',
          options: ['birds', 'cats', 'dogs', 'fish'],
          position: 2
        },
        {
          id: '3',
          word: 'colorful',
          options: ['colorful', 'tall', 'short', 'old'],
          position: 3
        },
        {
          id: '4',
          word: 'play',
          options: ['play', 'sleep', 'eat', 'run'],
          position: 4
        },
        {
          id: '5',
          word: 'golden',
          options: ['golden', 'silver', 'bronze', 'wooden'],
          position: 5
        }
      ]
    },
    {
      id: '2',
      title: 'The Brave Little Mouse',
      story: 'A tiny mouse named Max lived in a ___ hole under the kitchen floor. He was very ___ because he had never been outside. One day, Max decided to be ___ and explore the big world. He packed a small ___ with cheese and bread. As he walked through the tall ___, he met many new friends.',
      blanks: [
        {
          id: '1',
          word: 'warm',
          options: ['warm', 'cold', 'wet', 'dry'],
          position: 1
        },
        {
          id: '2',
          word: 'scared',
          options: ['scared', 'happy', 'angry', 'excited'],
          position: 2
        },
        {
          id: '3',
          word: 'brave',
          options: ['brave', 'silly', 'smart', 'funny'],
          position: 3
        },
        {
          id: '4',
          word: 'bag',
          options: ['bag', 'box', 'basket', 'jar'],
          position: 4
        },
        {
          id: '5',
          word: 'grass',
          options: ['grass', 'trees', 'flowers', 'rocks'],
          position: 5
        }
      ]
    }
  ];

  const wordMatchGames: WordMatchGame[] = [
    {
      id: '1',
      title: 'Animal Friends',
      words: [
        { id: '1', word: 'dog', definition: 'A friendly pet that barks' },
        { id: '2', word: 'cat', definition: 'A furry pet that purrs' },
        { id: '3', word: 'bird', definition: 'A flying animal with feathers' },
        { id: '4', word: 'fish', definition: 'A swimming animal with scales' },
        { id: '5', word: 'rabbit', definition: 'A hopping animal with long ears' },
        { id: '6', word: 'horse', definition: 'A large animal you can ride' }
      ],
      pairs: [
        { id: '1', word1: 'dog', word2: 'kennel', relationship: 'lives in' },
        { id: '2', word1: 'cat', word2: 'basket', relationship: 'sleeps in' },
        { id: '3', word1: 'bird', word2: 'nest', relationship: 'builds' },
        { id: '4', word1: 'fish', word2: 'bowl', relationship: 'swims in' },
        { id: '5', word1: 'rabbit', word2: 'carrot', relationship: 'eats' },
        { id: '6', word1: 'horse', word2: 'stable', relationship: 'lives in' }
      ]
    },
    {
      id: '2',
      title: 'Colorful World',
      words: [
        { id: '1', word: 'red', definition: 'The color of apples and fire trucks' },
        { id: '2', word: 'blue', definition: 'The color of the sky and ocean' },
        { id: '3', word: 'green', definition: 'The color of grass and trees' },
        { id: '4', word: 'yellow', definition: 'The color of the sun and bananas' },
        { id: '5', word: 'purple', definition: 'The color of grapes and flowers' },
        { id: '6', word: 'orange', definition: 'The color of pumpkins and carrots' }
      ],
      pairs: [
        { id: '1', word1: 'red', word2: 'apple', relationship: 'color of' },
        { id: '2', word1: 'blue', word2: 'sky', relationship: 'color of' },
        { id: '3', word1: 'green', word2: 'grass', relationship: 'color of' },
        { id: '4', word1: 'yellow', word2: 'sun', relationship: 'color of' },
        { id: '5', word1: 'purple', word2: 'grape', relationship: 'color of' },
        { id: '6', word1: 'orange', word2: 'pumpkin', relationship: 'color of' }
      ]
    }
  ];

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

  const handleGameSelect = (game: ReadingGame) => {
    setSelectedGame(game);
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setFilledBlanks({});
    setCorrectAnswers(0);
    setCurrentBlankIndex(0);
    setSelectedWords([]);
    setMatchedPairs([]);
    setWordMatches(0);
    setShowResults(false);

    if (game.type === 'fill-blank') {
      const story = fillBlankStories.find(s => s.id === game.id);
      setCurrentStory(story || null);
      setCurrentWordMatch(null);
    } else {
      const wordMatch = wordMatchGames.find(w => w.id === game.id);
      setCurrentWordMatch(wordMatch || null);
      setCurrentStory(null);
    }
  };

  const startSelectedGame = () => {
    if (!selectedGame) return;
    
    setGameStarted(true);
    setTimeLeft(selectedGame.timeLimit);
    startGame('reading', selectedGame.title);
    
    toast.success(`Starting ${selectedGame.title}! Good luck!`);
  };

  const handleFillBlankAnswer = (blankId: string, answer: string) => {
    if (!currentStory) return;

    const blank = currentStory.blanks.find(b => b.id === blankId);
    if (!blank) return;

    const isCorrect = answer === blank.word;
    setFilledBlanks(prev => ({ ...prev, [blankId]: answer }));

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      toast.success('Correct! Well done! 🎉');
      
      if (soundEnabled) {
        // Play success sound
        const audio = new Audio('/sounds/correct.mp3');
        audio.play().catch(() => {}); // Ignore errors if sound fails
      }
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 2));
      toast.error('Try again! 💪');
      
      if (soundEnabled) {
        // Play error sound
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.play().catch(() => {});
      }
    }

    // Move to next blank
    setCurrentBlankIndex(prev => prev + 1);

    // Check if game is complete
    if (Object.keys(filledBlanks).length + 1 >= currentStory.blanks.length) {
      setTimeout(() => {
        endGame();
        setGameCompleted(true);
        setShowResults(true);
      }, 1000);
    }
  };

  const handleWordMatch = (word: string) => {
    if (selectedWords.length === 0) {
      setSelectedWords([word]);
    } else if (selectedWords.length === 1) {
      const firstWord = selectedWords[0];
      const currentWordMatch = wordMatchGames.find(w => w.id === selectedGame?.id);
      
      if (currentWordMatch) {
        const pair = currentWordMatch.pairs.find(p => 
          (p.word1 === firstWord && p.word2 === word) || 
          (p.word1 === word && p.word2 === firstWord)
        );

        if (pair) {
          setMatchedPairs(prev => [...prev, pair.id]);
          setWordMatches(prev => prev + 1);
          setScore(prev => prev + 15);
          toast.success('Great match! 🎯');
          
          if (soundEnabled) {
            const audio = new Audio('/sounds/correct.mp3');
            audio.play().catch(() => {});
          }
        } else {
          setMistakes(prev => prev + 1);
          setScore(prev => Math.max(0, prev - 3));
          toast.error('Not a match, try again! 💪');
          
          if (soundEnabled) {
            const audio = new Audio('/sounds/incorrect.mp3');
            audio.play().catch(() => {});
          }
        }
      }
      
      setSelectedWords([]);
    }
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      toast.error('No more hints available!');
      return;
    }

    setHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 5));
    toast('💡 Hint: Look carefully at the context!', { icon: '💡' });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(selectedGame?.timeLimit || 0);
    setMistakes(0);
    setHintsUsed(0);
    setFilledBlanks({});
    setCorrectAnswers(0);
    setCurrentBlankIndex(0);
    setSelectedWords([]);
    setMatchedPairs([]);
    setWordMatches(0);
    setShowResults(false);
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

  const renderFillBlankGame = () => {
    if (!currentStory) return null;

    const currentBlank = currentStory.blanks[currentBlankIndex];
    const storyParts = currentStory.story.split('___');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary-600">
            {currentStory.title}
          </h2>
          
          <div className="mb-8">
            <div className="text-lg leading-relaxed mb-6 bg-gray-50 p-6 rounded-lg">
              {storyParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < storyParts.length - 1 && (
                    <span className="inline-block mx-2">
                      <select
                        className="border-2 border-primary-300 rounded px-3 py-1 bg-white font-medium text-primary-700 min-w-[120px]"
                        onChange={(e) => handleFillBlankAnswer(currentStory.blanks[index].id, e.target.value)}
                        value={filledBlanks[currentStory.blanks[index].id] || ''}
                      >
                        <option value="">Choose...</option>
                        {currentStory.blanks[index].options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={useHint}
              disabled={hintsUsed >= 3}
              className="btn-secondary flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Hint ({3 - hintsUsed} left)</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWordMatchGame = () => {
    if (!currentWordMatch) return null;

    const unmatchedWords = currentWordMatch.words.filter(word => 
      !matchedPairs.some(pairId => {
        const pair = currentWordMatch.pairs.find(p => p.id === pairId);
        return pair && (pair.word1 === word.word || pair.word2 === word.word);
      })
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary-600">
            {currentWordMatch.title}
          </h2>
          
          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              Match the words with their related items!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {unmatchedWords.map(word => (
              <motion.button
                key={word.id}
                onClick={() => handleWordMatch(word.word)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedWords.includes(word.word)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="font-bold text-lg text-primary-700 mb-2">
                    {word.word}
                  </div>
                  <div className="text-sm text-gray-600">
                    {word.definition}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {matchedPairs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-success-600">
                Matched Pairs:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {matchedPairs.map(pairId => {
                  const pair = currentWordMatch.pairs.find(p => p.id === pairId);
                  return pair ? (
                    <div key={pairId} className="bg-success-50 border border-success-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-success-700">
                        {pair.word1} - {pair.word2}
                      </div>
                      <div className="text-xs text-success-600">
                        {pair.relationship}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={useHint}
              disabled={hintsUsed >= 3}
              className="btn-secondary flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Hint ({3 - hintsUsed} left)</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGameResults = () => {
    if (!selectedGame || !showResults) return null;

    const accuracy = selectedGame.type === 'fill-blank' 
      ? (correctAnswers / (currentStory?.blanks.length || 1)) * 100
      : (wordMatches / (currentWordMatch?.pairs.length || 1)) * 100;

    const finalScore = Math.max(0, score - (mistakes * 2) - (hintsUsed * 5));
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
                <div className="font-semibold text-gray-700">Mistakes</div>
                <div className="text-2xl font-bold text-red-600">{mistakes}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Reading Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practice reading with fun stories and word matching games! 
            Fill in the blanks and match words to improve your reading skills.
          </p>
        </motion.div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {readingGames.map((game, index) => (
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
                    <BookOpen className="w-8 h-8 text-primary-600" />
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
                {selectedGame.type === 'fill-blank' ? renderFillBlankGame() : renderWordMatchGame()}
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

export default ReadingGames;