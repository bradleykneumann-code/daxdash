import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
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
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ComprehensionGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  type: 'multiple-choice' | 'drag-drop' | 'sequence';
  content: ComprehensionContent;
}

interface ComprehensionContent {
  story: string;
  questions: Question[];
  image?: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'drag-drop' | 'sequence';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

interface DragDropItem {
  id: string;
  text: string;
  category: string;
}

const Comprehension: React.FC = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { startGame, endGame, updateScore, gameState } = useGame();
  
  const [selectedGame, setSelectedGame] = useState<ComprehensionGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [dragDropItems, setDragDropItems] = useState<DragDropItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({});
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);

  const comprehensionGames: ComprehensionGame[] = [
    {
      id: '1',
      title: 'The Little Red Hen',
      description: 'Read the story and answer questions about what happened.',
      difficulty: 'easy',
      timeLimit: 300, // 5 minutes
      points: 80,
      type: 'multiple-choice',
      content: {
        story: `Once upon a time, there was a little red hen who lived on a farm. One day, she found some wheat seeds in the barn. "Who will help me plant these seeds?" she asked her friends.

The cat was sleeping in the sun. "Not I," said the cat.
The dog was playing in the yard. "Not I," said the dog.
The duck was swimming in the pond. "Not I," said the duck.

So the little red hen planted the seeds all by herself. When the wheat grew tall, she asked, "Who will help me cut the wheat?"

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the duck.

So the little red hen cut the wheat all by herself. She asked, "Who will help me take the wheat to the mill?"

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the duck.

So the little red hen took the wheat to the mill all by herself. When she came back with flour, she asked, "Who will help me bake bread?"

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the duck.

So the little red hen baked the bread all by herself. When the bread was ready, she asked, "Who will help me eat the bread?"

"I will!" said the cat.
"I will!" said the dog.
"I will!" said the duck.

But the little red hen said, "No, I will eat it all by myself!" And she did.`,
        questions: [
          {
            id: '1',
            type: 'multiple-choice',
            question: 'What did the little red hen find in the barn?',
            options: ['Corn seeds', 'Wheat seeds', 'Rice seeds', 'Bean seeds'],
            correctAnswer: 'Wheat seeds',
            explanation: 'The story says she found wheat seeds in the barn.',
            points: 10
          },
          {
            id: '2',
            type: 'multiple-choice',
            question: 'How many friends did the little red hen ask for help?',
            options: ['Two', 'Three', 'Four', 'Five'],
            correctAnswer: 'Three',
            explanation: 'She asked the cat, dog, and duck for help.',
            points: 10
          },
          {
            id: '3',
            type: 'multiple-choice',
            question: 'What did the little red hen do with the wheat?',
            options: ['She sold it', 'She took it to the mill', 'She gave it away', 'She stored it'],
            correctAnswer: 'She took it to the mill',
            explanation: 'The story says she took the wheat to the mill.',
            points: 10
          },
          {
            id: '4',
            type: 'multiple-choice',
            question: 'What lesson does this story teach?',
            options: ['Sharing is good', 'Hard work pays off', 'Friends are important', 'Bread is delicious'],
            correctAnswer: 'Hard work pays off',
            explanation: 'The hen worked hard and got to enjoy the bread herself.',
            points: 15
          }
        ]
      }
    },
    {
      id: '2',
      title: 'Animal Categories',
      description: 'Drag and drop animals into their correct categories.',
      difficulty: 'medium',
      timeLimit: 240, // 4 minutes
      points: 100,
      type: 'drag-drop',
      content: {
        story: 'Sort these animals into their correct categories: Farm Animals, Wild Animals, and Pets.',
        questions: [
          {
            id: '1',
            type: 'drag-drop',
            question: 'Sort the animals into their correct categories.',
            correctAnswer: ['Farm Animals: cow, pig, sheep', 'Wild Animals: lion, tiger, elephant', 'Pets: dog, cat, rabbit'],
            points: 30
          }
        ]
      }
    },
    {
      id: '3',
      title: 'Story Sequence',
      description: 'Put the story events in the correct order.',
      difficulty: 'medium',
      timeLimit: 180, // 3 minutes
      points: 90,
      type: 'sequence',
      content: {
        story: 'Read the story and put the events in the correct order.',
        questions: [
          {
            id: '1',
            type: 'sequence',
            question: 'Put these story events in the correct order:',
            correctAnswer: ['Hen finds wheat seeds', 'Hen plants the seeds', 'Wheat grows tall', 'Hen cuts the wheat', 'Hen takes wheat to mill', 'Hen bakes bread', 'Hen eats bread alone'],
            points: 40
          }
        ]
      }
    }
  ];

  const dragDropData = {
    'Farm Animals': ['cow', 'pig', 'sheep', 'horse', 'chicken'],
    'Wild Animals': ['lion', 'tiger', 'elephant', 'giraffe', 'zebra'],
    'Pets': ['dog', 'cat', 'rabbit', 'hamster', 'fish']
  };

  const sequenceData = [
    'Hen finds wheat seeds',
    'Hen plants the seeds',
    'Wheat grows tall',
    'Hen cuts the wheat',
    'Hen takes wheat to mill',
    'Hen bakes bread',
    'Hen eats bread alone'
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

  const handleGameSelect = (game: ComprehensionGame) => {
    setSelectedGame(game);
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedAnswer('');
    setDroppedItems({});
    setSequenceOrder([]);
    setShowResults(false);

    if (game.type === 'drag-drop') {
      const allItems: DragDropItem[] = [];
      Object.entries(dragDropData).forEach(([category, items]) => {
        items.forEach(item => {
          allItems.push({ id: item, text: item, category });
        });
      });
      setDragDropItems(allItems.sort(() => Math.random() - 0.5));
    } else if (game.type === 'sequence') {
      setSequenceOrder([...sequenceData].sort(() => Math.random() - 0.5));
    }
  };

  const startSelectedGame = () => {
    if (!selectedGame) return;
    
    setGameStarted(true);
    setTimeLeft(selectedGame.timeLimit);
    startGame('comprehension', selectedGame.title);
    
    toast.success(`Starting ${selectedGame.title}! Good luck!`);
  };

  const handleMultipleChoiceAnswer = (answer: string) => {
    if (!selectedGame) return;
    
    const currentQuestion = selectedGame.content.questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + currentQuestion.points);
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

    // Move to next question
    if (currentQuestionIndex < selectedGame.content.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      setTimeout(() => {
        endGame();
        setGameCompleted(true);
        setShowResults(true);
      }, 1000);
    }
  };

  const handleDragDrop = (itemId: string, category: string) => {
    setDroppedItems(prev => ({ ...prev, [itemId]: category }));
  };

  const handleSequenceReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...sequenceOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setSequenceOrder(newOrder);
  };

  const submitDragDrop = () => {
    if (!selectedGame) return;
    
    const currentQuestion = selectedGame.content.questions[0];
    const correctAnswers = currentQuestion.correctAnswer as string[];
    
    let correctCount = 0;
    Object.entries(droppedItems).forEach(([itemId, category]) => {
      const correctCategory = dragDropData[category as keyof typeof dragDropData]?.includes(itemId);
      if (correctCategory) correctCount++;
    });
    
    const accuracy = (correctCount / Object.keys(droppedItems).length) * 100;
    const pointsEarned = Math.floor((accuracy / 100) * currentQuestion.points);
    
    setScore(prev => prev + pointsEarned);
    setCorrectAnswers(prev => prev + 1);
    
    if (accuracy >= 70) {
      toast.success('Great job sorting! 🎉');
    } else {
      toast.error('Keep practicing! 💪');
      setMistakes(prev => prev + 1);
    }
    
    setTimeout(() => {
      endGame();
      setGameCompleted(true);
      setShowResults(true);
    }, 1000);
  };

  const submitSequence = () => {
    if (!selectedGame) return;
    
    const currentQuestion = selectedGame.content.questions[0];
    const correctSequence = currentQuestion.correctAnswer as string[];
    
    let correctCount = 0;
    sequenceOrder.forEach((item, index) => {
      if (item === correctSequence[index]) correctCount++;
    });
    
    const accuracy = (correctCount / correctSequence.length) * 100;
    const pointsEarned = Math.floor((accuracy / 100) * currentQuestion.points);
    
    setScore(prev => prev + pointsEarned);
    setCorrectAnswers(prev => prev + 1);
    
    if (accuracy >= 70) {
      toast.success('Great job ordering! 🎉');
    } else {
      toast.error('Keep practicing! 💪');
      setMistakes(prev => prev + 1);
    }
    
    setTimeout(() => {
      endGame();
      setGameCompleted(true);
      setShowResults(true);
    }, 1000);
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      toast.error('No more hints available!');
      return;
    }

    setHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 5));
    
    if (selectedGame?.type === 'multiple-choice') {
      const currentQuestion = selectedGame.content.questions[currentQuestionIndex];
      toast(`💡 Hint: ${currentQuestion.explanation || 'Think carefully about the story!'}`, { icon: '💡' });
    } else if (selectedGame?.type === 'drag-drop') {
      toast('💡 Hint: Think about where each animal lives!', { icon: '💡' });
    } else if (selectedGame?.type === 'sequence') {
      toast('💡 Hint: Remember the order of events in the story!', { icon: '💡' });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(selectedGame?.timeLimit || 0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedAnswer('');
    setDroppedItems({});
    setSequenceOrder([]);
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

  const renderMultipleChoiceGame = () => {
    if (!selectedGame) return null;

    const currentQuestion = selectedGame.content.questions[currentQuestionIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-600 mb-4">
              Question {currentQuestionIndex + 1} of {selectedGame.content.questions.length}
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Story:</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedGame.content.story}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Question:</h3>
              <p className="text-lg text-gray-800">{currentQuestion.question}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleMultipleChoiceAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {selectedAnswer === option && (
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDragDropGame = () => {
    if (!selectedGame) return null;

    const categories = Object.keys(dragDropData);
    const availableItems = dragDropItems.filter(item => !droppedItems[item.id]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">
              Animal Categories
            </h2>
            <p className="text-gray-600">
              Drag animals into their correct categories!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Items */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Available Animals:</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                <div className="flex flex-wrap gap-2">
                  {availableItems.map(item => (
                    <motion.div
                      key={item.id}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Simple click to add to first category
                        handleDragDrop(item.id, categories[0]);
                      }}
                    >
                      <span className="text-sm font-medium text-gray-700">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Categories:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                    <h4 className="font-semibold text-gray-700 mb-3">{category}:</h4>
                    <div className="space-y-2">
                      {Object.entries(droppedItems)
                        .filter(([_, cat]) => cat === category)
                        .map(([itemId, _]) => {
                          const item = dragDropItems.find(i => i.id === itemId);
                          return item ? (
                            <div key={itemId} className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">{item.text}</span>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={submitDragDrop}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Answers</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSequenceGame = () => {
    if (!selectedGame) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">
              Story Sequence
            </h2>
            <p className="text-gray-600">
              Put the story events in the correct order!
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Story:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-700 leading-relaxed">
                {selectedGame.content.story}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Events (drag to reorder):</h3>
            <div className="space-y-2">
              {sequenceOrder.map((event, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{event}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={submitSequence}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Order</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGameResults = () => {
    if (!selectedGame || !showResults) return null;

    const accuracy = (correctAnswers / selectedGame.content.questions.length) * 100;
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
              Comprehension Complete!
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
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
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
                Try Again
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Comprehension
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test your understanding with stories, multiple-choice questions, 
            and interactive puzzles! Build your reading comprehension skills.
          </p>
        </motion.div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {comprehensionGames.map((game, index) => (
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
                    <Brain className="w-8 h-8 text-primary-600" />
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
                {selectedGame.type === 'multiple-choice' && renderMultipleChoiceGame()}
                {selectedGame.type === 'drag-drop' && renderDragDropGame()}
                {selectedGame.type === 'sequence' && renderSequenceGame()}

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

export default Comprehension;