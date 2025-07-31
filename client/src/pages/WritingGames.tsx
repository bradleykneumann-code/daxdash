import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  PenTool, 
  Clock, 
  Star, 
  Trophy, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Volume2,
  VolumeX,
  Undo2,
  Eraser,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WritingGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  points: number;
  letters: string[];
  instructions: string;
}

interface LetterTemplate {
  letter: string;
  strokes: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    width: number;
  }>;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

const WritingGames: React.FC = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { startGame, endGame, updateScore, gameState } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef<Array<{ points: Array<{ x: number; y: number }>; color: string; width: number }>>([]);
  
  const [selectedGame, setSelectedGame] = useState<WritingGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showTemplate, setShowTemplate] = useState(false);
  const [brushColor, setBrushColor] = useState('#3B82F6');
  const [brushWidth, setBrushWidth] = useState(3);
  const [isErasing, setIsErasing] = useState(false);
  const [attempts, setAttempts] = useState<Array<{ letter: string; strokes: any[]; score: number; timestamp: Date }>>([]);

  const writingGames: WritingGame[] = [
    {
      id: '1',
      title: 'Basic Letters',
      description: 'Practice writing basic letters A-Z with guided strokes.',
      difficulty: 'easy',
      timeLimit: 600, // 10 minutes
      points: 100,
      letters: ['A', 'B', 'C', 'D', 'E', 'F'],
      instructions: 'Follow the dotted lines to write each letter. Take your time and be careful!'
    },
    {
      id: '2',
      title: 'Lowercase Letters',
      description: 'Master lowercase letter formation with interactive guidance.',
      difficulty: 'medium',
      timeLimit: 480, // 8 minutes
      points: 150,
      letters: ['a', 'b', 'c', 'd', 'e', 'f'],
      instructions: 'Write lowercase letters following the stroke order. Pay attention to size and shape!'
    },
    {
      id: '3',
      title: 'Number Writing',
      description: 'Learn to write numbers 0-9 with proper formation.',
      difficulty: 'easy',
      timeLimit: 360, // 6 minutes
      points: 80,
      letters: ['0', '1', '2', '3', '4', '5'],
      instructions: 'Write numbers following the correct stroke order. Keep them neat and readable!'
    }
  ];

  const letterTemplates: Record<string, LetterTemplate> = {
    'A': {
      letter: 'A',
      strokes: [
        {
          points: [{ x: 50, y: 80 }, { x: 50, y: 20 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 50, y: 20 }, { x: 90, y: 80 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 30, y: 50 }, { x: 70, y: 50 }],
          color: '#3B82F6',
          width: 3
        }
      ],
      startPoint: { x: 50, y: 80 },
      endPoint: { x: 70, y: 50 }
    },
    'B': {
      letter: 'B',
      strokes: [
        {
          points: [{ x: 30, y: 20 }, { x: 30, y: 80 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 30, y: 20 }, { x: 70, y: 40 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 70, y: 40 }, { x: 30, y: 50 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 30, y: 50 }, { x: 70, y: 80 }],
          color: '#3B82F6',
          width: 3
        }
      ],
      startPoint: { x: 30, y: 20 },
      endPoint: { x: 70, y: 80 }
    },
    'a': {
      letter: 'a',
      strokes: [
        {
          points: [{ x: 60, y: 50 }, { x: 80, y: 50 }, { x: 80, y: 70 }, { x: 60, y: 70 }, { x: 60, y: 50 }],
          color: '#3B82F6',
          width: 3
        },
        {
          points: [{ x: 80, y: 50 }, { x: 80, y: 80 }],
          color: '#3B82F6',
          width: 3
        }
      ],
      startPoint: { x: 60, y: 50 },
      endPoint: { x: 80, y: 80 }
    },
    '0': {
      letter: '0',
      strokes: [
        {
          points: [{ x: 50, y: 30 }, { x: 70, y: 30 }, { x: 70, y: 70 }, { x: 50, y: 70 }, { x: 50, y: 30 }],
          color: '#3B82F6',
          width: 3
        }
      ],
      startPoint: { x: 50, y: 30 },
      endPoint: { x: 50, y: 30 }
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

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
        clearCanvas();
      }
    }
  }, [gameStarted]);

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      strokesRef.current = [];
      
      // Draw grid lines
      context.strokeStyle = '#E5E7EB';
      context.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += 20) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
      }
      for (let i = 0; i <= canvas.height; i += 20) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.stroke();
      }
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    isDrawingRef.current = true;
    strokesRef.current.push({
      points: [{ x, y }],
      color: isErasing ? '#FFFFFF' : brushColor,
      width: isErasing ? 10 : brushWidth
    });
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = isErasing ? '#FFFFFF' : brushColor;
    contextRef.current.lineWidth = isErasing ? 10 : brushWidth;
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !contextRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const currentStroke = strokesRef.current[strokesRef.current.length - 1];
    currentStroke.points.push({ x, y });
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const undoLastStroke = () => {
    if (strokesRef.current.length > 0) {
      strokesRef.current.pop();
      redrawCanvas();
    }
  };

  const redrawCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    clearCanvas();
    
    strokesRef.current.forEach(stroke => {
      if (stroke.points.length > 0) {
        contextRef.current!.beginPath();
        contextRef.current!.moveTo(stroke.points[0].x, stroke.points[0].y);
        contextRef.current!.strokeStyle = stroke.color;
        contextRef.current!.lineWidth = stroke.width;
        
        stroke.points.forEach(point => {
          contextRef.current!.lineTo(point.x, point.y);
        });
        
        contextRef.current!.stroke();
      }
    });
  };

  const evaluateLetter = (): number => {
    if (!selectedGame || strokesRef.current.length === 0) return 0;
    
    const currentLetter = selectedGame.letters[currentLetterIndex];
    const template = letterTemplates[currentLetter];
    
    if (!template) return 50; // Default score if no template
    
    // Simple evaluation based on stroke count and drawing area
    const strokeCount = strokesRef.current.length;
    const expectedStrokes = template.strokes.length;
    const strokeAccuracy = Math.max(0, 100 - Math.abs(strokeCount - expectedStrokes) * 10);
    
    // Check if drawing is in the correct area
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const drawingArea = strokesRef.current.some(stroke => 
        stroke.points.some(point => 
          point.x > centerX - 50 && point.x < centerX + 50 &&
          point.y > centerY - 50 && point.y < centerY + 50
        )
      );
      
      return drawingArea ? Math.min(100, strokeAccuracy + 20) : strokeAccuracy;
    }
    
    return strokeAccuracy;
  };

  const submitLetter = () => {
    if (!selectedGame) return;
    
    const letterScore = evaluateLetter();
    const currentLetter = selectedGame.letters[currentLetterIndex];
    
    // Save attempt
    setAttempts(prev => [...prev, {
      letter: currentLetter,
      strokes: [...strokesRef.current],
      score: letterScore,
      timestamp: new Date()
    }]);
    
    // Update score
    const pointsEarned = Math.floor(letterScore / 10);
    setScore(prev => prev + pointsEarned);
    
    if (letterScore >= 70) {
      toast.success(`Great job writing ${currentLetter}! 🎉`);
      if (soundEnabled) {
        const audio = new Audio('/sounds/correct.mp3');
        audio.play().catch(() => {});
      }
    } else {
      toast.error(`Keep practicing ${currentLetter}! 💪`);
      setMistakes(prev => prev + 1);
      if (soundEnabled) {
        const audio = new Audio('/sounds/incorrect.mp3');
        audio.play().catch(() => {});
      }
    }
    
    // Move to next letter or complete game
    if (currentLetterIndex < selectedGame.letters.length - 1) {
      setCurrentLetterIndex(prev => prev + 1);
      clearCanvas();
    } else {
      setTimeout(() => {
        endGame();
        setGameCompleted(true);
        setShowResults(true);
      }, 1000);
    }
  };

  const handleGameSelect = (game: WritingGame) => {
    setSelectedGame(game);
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentLetterIndex(0);
    setAttempts([]);
    setShowResults(false);
    clearCanvas();
  };

  const startSelectedGame = () => {
    if (!selectedGame) return;
    
    setGameStarted(true);
    setTimeLeft(selectedGame.timeLimit);
    startGame('writing', selectedGame.title);
    
    toast.success(`Starting ${selectedGame.title}! Good luck!`);
  };

  const useHint = () => {
    if (hintsUsed >= 3) {
      toast.error('No more hints available!');
      return;
    }

    setHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 5));
    setShowTemplate(true);
    
    setTimeout(() => setShowTemplate(false), 3000);
    
    toast('💡 Hint: Follow the template!', { icon: '💡' });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setTimeLeft(selectedGame?.timeLimit || 0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentLetterIndex(0);
    setAttempts([]);
    setShowResults(false);
    clearCanvas();
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

  const renderCanvas = () => {
    if (!selectedGame) return null;

    const currentLetter = selectedGame.letters[currentLetterIndex];
    const template = letterTemplates[currentLetter];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">
              Write: {currentLetter}
            </h2>
            <p className="text-gray-600">
              Letter {currentLetterIndex + 1} of {selectedGame.letters.length}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              
              {showTemplate && template && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-blue-100 bg-opacity-80 rounded-lg p-4">
                    <div className="text-4xl font-bold text-blue-600 text-center">
                      {template.letter}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={clearCanvas}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
            
            <button
              onClick={undoLastStroke}
              className="btn-secondary flex items-center space-x-2"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>
            
            <button
              onClick={() => setIsErasing(!isErasing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${
                isErasing 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </button>
            
            <button
              onClick={useHint}
              disabled={hintsUsed >= 3}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Show Template ({3 - hintsUsed} left)</span>
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={submitLetter}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Letter</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGameResults = () => {
    if (!selectedGame || !showResults) return null;

    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0;
    const stars = averageScore >= 80 ? 3 : averageScore >= 60 ? 2 : 1;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary-600">
              Writing Practice Complete!
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
                {score} pts
              </div>
              <div className="text-lg text-gray-600 mb-4">
                Average Score: {averageScore.toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Letters Written</div>
                <div className="text-2xl font-bold text-green-600">{attempts.length}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Hints Used</div>
                <div className="text-2xl font-bold text-blue-600">{hintsUsed}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Letter Scores:
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {attempts.map((attempt, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-bold text-lg">{attempt.letter}</div>
                    <div className={`text-sm font-medium ${
                      attempt.score >= 80 ? 'text-green-600' : 
                      attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {attempt.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={resetGame}
                className="btn-secondary flex-1"
              >
                Practice Again
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Writing Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practice letter formation with interactive drawing! 
            Follow the templates and improve your handwriting skills.
          </p>
        </motion.div>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {writingGames.map((game, index) => (
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
                    <PenTool className="w-8 h-8 text-primary-600" />
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
                  <h3 className="text-lg font-semibold mb-2">Letters to Practice:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedGame.letters.map((letter, index) => (
                      <div key={index} className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl font-bold text-primary-700">
                        {letter}
                      </div>
                    ))}
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
                    <span>Start Practice</span>
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

                {/* Canvas */}
                {renderCanvas()}
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

export default WritingGames;