import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX,
  Bot,
  Sparkles,
  Lightbulb,
  Heart,
  Star,
  ArrowUp,
  Settings,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const DaxBot: React.FC = () => {
  const { chatMessages, sendMessage, sendVoiceMessage, isConnected, clearChat } = useSocket();
  const { user } = useAuth();
  const { progress } = useProgress();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Speech recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleVoiceMessage = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now!');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const speakMessage = (message: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const getDaxBotContext = () => {
    if (!progress) return '';
    
    const context = [];
    if (progress.gameProgress.reading.completed > 0) {
      context.push(`Reading: ${progress.gameProgress.reading.completed} games completed`);
    }
    if (progress.gameProgress.writing.completed > 0) {
      context.push(`Writing: ${progress.gameProgress.writing.completed} letters practiced`);
    }
    if (progress.gameProgress.sightWords.completed > 0) {
      context.push(`Sight Words: ${progress.gameProgress.sightWords.completed} words mastered`);
    }
    if (progress.gameProgress.comprehension.completed > 0) {
      context.push(`Comprehension: ${progress.gameProgress.comprehension.completed} passages completed`);
    }
    
    return context.join(', ');
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'hint':
        return <Lightbulb size={16} className="text-yellow-500" />;
      case 'encouragement':
        return <Heart size={16} className="text-red-500" />;
      case 'voice':
        return <Volume2 size={16} className="text-blue-500" />;
      default:
        return <Bot size={16} className="text-primary-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'hint':
        return 'bg-yellow-50 border-yellow-200';
      case 'encouragement':
        return 'bg-red-50 border-red-200';
      case 'voice':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Bot size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-fun text-primary-700">DaxBot</h1>
            <p className="text-lg text-gray-600 font-comic">Your AI Learning Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-comic">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          {getDaxBotContext() && (
            <>
              <span>•</span>
              <span>{getDaxBotContext()}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card h-96 flex flex-col"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {chatMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-4 rounded-2xl border-2 ${
                    message.sender === 'user'
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : getMessageTypeColor(message.type)
                  }`}
                >
                  {message.sender === 'daxbot' && (
                    <div className="flex items-center space-x-2 mb-2">
                      {getMessageTypeIcon(message.type)}
                      <span className="text-xs font-comic text-gray-500">DaxBot</span>
                    </div>
                  )}
                  <p className="font-comic text-sm leading-relaxed">{message.message}</p>
                  <div className="text-xs text-gray-500 mt-2 font-comic">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {/* Voice Button */}
            <button
              onClick={handleVoiceMessage}
              disabled={!isConnected || isListening}
              className={`p-3 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-error-500 text-white animate-pulse'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
              title={isListening ? 'Stop listening' : 'Voice message'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or ask for help..."
                className="input-field pr-12"
                disabled={!isConnected}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!isConnected || !inputMessage.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
              title="Clear chat"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Voice Controls */}
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-2 mt-3 p-2 bg-blue-50 rounded-lg"
            >
              <Volume2 size={16} className="text-blue-600 animate-pulse" />
              <span className="text-sm font-comic text-blue-600">DaxBot is speaking...</span>
              <button
                onClick={stopSpeaking}
                className="p-1 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
              >
                <VolumeX size={14} />
              </button>
            </motion.div>
          )}

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-fun text-gray-800 mb-3">Voice Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={voiceEnabled}
                      onChange={(e) => setVoiceEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-comic text-sm">Enable voice recognition</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-comic text-sm">Auto-speak DaxBot responses</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-xl font-fun text-primary-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { text: "Help me with reading", icon: Sparkles },
            { text: "Show me writing tips", icon: Star },
            { text: "Practice sight words", icon: Lightbulb },
            { text: "Give me a hint", icon: ArrowUp }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                onClick={() => handleSendMessage(action.text)}
                disabled={!isConnected}
                className="card hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} className="text-primary-500" />
                  <span className="font-comic text-sm">{action.text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 card bg-gradient-to-r from-success-50 to-primary-50 border-success-200"
      >
        <h3 className="font-fun text-success-700 mb-3 flex items-center">
          <Lightbulb size={20} className="mr-2" />
          Tips for talking with DaxBot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-comic text-gray-700">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>"Help me with the letter A"</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>"I want to practice reading"</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>"What sight words should I learn?"</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>"Give me a comprehension question"</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 animate-float pointer-events-none">
        <div className="w-3 h-3 bg-yellow-400 rounded-full sparkle"></div>
      </div>
      <div className="fixed top-40 right-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
        <div className="w-2 h-2 bg-pink-400 rounded-full sparkle"></div>
      </div>
      <div className="fixed bottom-20 left-1/4 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        <div className="w-4 h-4 bg-blue-400 rounded-full sparkle"></div>
      </div>
    </div>
  );
};

export default DaxBot;