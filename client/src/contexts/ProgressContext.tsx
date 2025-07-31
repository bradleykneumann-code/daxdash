import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Progress {
  userId: string;
  points: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  streaks: {
    current: number;
    longest: number;
    lastActivity: Date;
  };
  gameProgress: {
    reading: GameProgress;
    writing: GameProgress;
    sightWords: GameProgress;
    comprehension: GameProgress;
  };
  weeklyStats: WeeklyStats[];
}

interface GameProgress {
  completed: number;
  total: number;
  bestScore: number;
  averageScore: number;
  lastPlayed: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'writing' | 'sight-words' | 'comprehension' | 'general';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlockedAt: Date;
  category: string;
}

interface WeeklyStats {
  week: string;
  points: number;
  gamesPlayed: number;
  timeSpent: number;
  accuracy: number;
}

interface ProgressContextType {
  progress: Progress | null;
  loading: boolean;
  addPoints: (points: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateGameProgress: (gameType: keyof Progress['gameProgress'], data: Partial<GameProgress>) => Promise<void>;
  getWeeklyStats: () => WeeklyStats[];
  getLevelInfo: () => { current: number; next: number; progress: number };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setProgress(null);
      setLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const progressData = await response.json();
        setProgress(progressData);
      } else {
        // Create new progress if none exists
        await createNewProgress();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      await createNewProgress();
    } finally {
      setLoading(false);
    }
  };

  const createNewProgress = async () => {
    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          points: 0,
          level: 1,
          badges: [],
          achievements: [],
          streaks: {
            current: 0,
            longest: 0,
            lastActivity: new Date(),
          },
          gameProgress: {
            reading: { completed: 0, total: 0, bestScore: 0, averageScore: 0, lastPlayed: new Date() },
            writing: { completed: 0, total: 0, bestScore: 0, averageScore: 0, lastPlayed: new Date() },
            sightWords: { completed: 0, total: 0, bestScore: 0, averageScore: 0, lastPlayed: new Date() },
            comprehension: { completed: 0, total: 0, bestScore: 0, averageScore: 0, lastPlayed: new Date() },
          },
          weeklyStats: [],
        }),
      });

      if (response.ok) {
        const newProgress = await response.json();
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Error creating progress:', error);
    }
  };

  const addPoints = async (points: number, reason: string) => {
    if (!progress) return;

    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ points, reason }),
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
        
        // Show points earned notification
        toast.success(`+${points} points! ${reason} 🎉`);
        
        // Check for level up
        const oldLevel = progress.level;
        const newLevel = updatedProgress.level;
        if (newLevel > oldLevel) {
          toast.success(`Level Up! You're now level ${newLevel}! 🌟`);
        }
      }
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (!progress) return;

    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeId }),
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
        
        const badge = updatedProgress.badges.find((b: Badge) => b.id === badgeId);
        if (badge) {
          toast.success(`Badge unlocked: ${badge.name}! 🏆`);
        }
      }
    } catch (error) {
      console.error('Error unlocking badge:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!progress) return;

    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ achievementId }),
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
        
        const achievement = updatedProgress.achievements.find((a: Achievement) => a.id === achievementId);
        if (achievement) {
          toast.success(`Achievement unlocked: ${achievement.name}! 🎯`);
        }
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const updateGameProgress = async (gameType: keyof Progress['gameProgress'], data: Partial<GameProgress>) => {
    if (!progress) return;

    try {
      const token = localStorage.getItem('dax_token');
      const response = await fetch('/api/progress/game', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gameType, data }),
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error updating game progress:', error);
    }
  };

  const getWeeklyStats = (): WeeklyStats[] => {
    return progress?.weeklyStats || [];
  };

  const getLevelInfo = () => {
    if (!progress) return { current: 1, next: 2, progress: 0 };
    
    const currentLevel = progress.level;
    const nextLevel = currentLevel + 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const progress = ((progress.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    
    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(100, Math.max(0, progress)),
    };
  };

  const value: ProgressContextType = {
    progress,
    loading,
    addPoints,
    unlockBadge,
    unlockAchievement,
    updateGameProgress,
    getWeeklyStats,
    getLevelInfo,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};