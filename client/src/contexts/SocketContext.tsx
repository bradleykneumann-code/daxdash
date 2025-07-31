import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  sender: 'user' | 'daxbot';
  message: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'hint' | 'encouragement';
}

interface DaxBotResponse {
  message: string;
  type: 'text' | 'voice' | 'hint' | 'encouragement';
  context?: {
    currentGame?: string;
    currentLesson?: string;
    difficulty?: string;
  };
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  chatMessages: ChatMessage[];
  sendMessage: (message: string, type?: 'text' | 'voice') => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  clearChat: () => void;
  getChatHistory: () => ChatMessage[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const initializeSocket = () => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('dax_token'),
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      // Send initial message from DaxBot
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'daxbot',
        message: "Hey champ, DaxBot here – ready to turn wobbly letters into perfect lines! What would you like to learn today?",
        timestamp: new Date(),
        type: 'text',
      };
      setChatMessages([welcomeMessage]);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('daxbot_response', (response: DaxBotResponse) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'daxbot',
        message: response.message,
        timestamp: new Date(),
        type: response.type,
      };
      
      setChatMessages(prev => [...prev, message]);
      
      // Speak the message if it's a voice response
      if (response.type === 'voice' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.message);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
      toast.error('Connection error. Please try again.');
    });

    newSocket.on('game_hint', (hint: string) => {
      const hintMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'daxbot',
        message: `💡 Hint: ${hint}`,
        timestamp: new Date(),
        type: 'hint',
      };
      setChatMessages(prev => [...prev, hintMessage]);
    });

    newSocket.on('encouragement', (message: string) => {
      const encouragementMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'daxbot',
        message,
        timestamp: new Date(),
        type: 'encouragement',
      };
      setChatMessages(prev => [...prev, encouragementMessage]);
    });

    setSocket(newSocket);
  };

  const sendMessage = async (message: string, type: 'text' | 'voice' = 'text') => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message,
      timestamp: new Date(),
      type,
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      socket.emit('chat_message', {
        message,
        type,
        userId: user?.id,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result as string;
        
        socket.emit('voice_message', {
          audio: base64Audio,
          userId: user?.id,
          timestamp: new Date(),
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const getChatHistory = (): ChatMessage[] => {
    return chatMessages;
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    chatMessages,
    sendMessage,
    sendVoiceMessage,
    clearChat,
    getChatHistory,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};