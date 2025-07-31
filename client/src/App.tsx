import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReadingGames from './pages/ReadingGames';
import WritingGames from './pages/WritingGames';
import SightWords from './pages/SightWords';
import Comprehension from './pages/Comprehension';
import DaxBot from './pages/DaxBot';
import Profile from './pages/Profile';
import ParentDashboard from './pages/ParentDashboard';
import WorksheetBuilder from './pages/WorksheetBuilder';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <GameProvider>
          <SocketProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reading"
                  element={
                    <ProtectedRoute>
                      <ReadingGames />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/writing"
                  element={
                    <ProtectedRoute>
                      <WritingGames />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sight-words"
                  element={
                    <ProtectedRoute>
                      <SightWords />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/comprehension"
                  element={
                    <ProtectedRoute>
                      <Comprehension />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daxbot"
                  element={
                    <ProtectedRoute>
                      <DaxBot />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/parent-dashboard"
                  element={
                    <ProtectedRoute>
                      <ParentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worksheet-builder"
                  element={
                    <ProtectedRoute>
                      <WorksheetBuilder />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </SocketProvider>
        </GameProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;