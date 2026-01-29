import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState ,useRef } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import { App as CapApp } from "@capacitor/app";
import { Dialog } from '@capacitor/dialog';
import TaskPlanner from "./components/tasks/TaskPlanner";
import ActiveTasks from "./components/tasks/ActiveTasks";
import CompletedTasks from "./components/tasks/CompletedTasks";
import SubtaskPage from "./components/tasks/SubTaskPage";
import { StatusBar, Style } from '@capacitor/status-bar';

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current.push(location.pathname);
  }, [location]);

  useEffect(() => {
    const handler = CapApp.addListener("backButton", async () => {
      const currentPath = location.pathname;

      if (historyRef.current.length > 1) {
        historyRef.current.pop(); 
        const previousPath = historyRef.current[historyRef.current.length - 1];
        navigate(previousPath);
        return;
      }

      const { value } = await Dialog.confirm({
        title: "Exit App",
        message: "Are you sure you want to exit the app?",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
      });

      if (value) {
        CapApp.exitApp();
      }
    });

    return () => {
      handler.remove();
    };
  }, [navigate, location]);

  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (on app start / refresh)
    const storedEmail = sessionStorage.getItem('email') || localStorage.getItem('email');
    
    if (storedEmail) {
      setIsAuthenticated(true);
    }
    
    setCheckingAuth(false);
  }, []);
  
  useEffect(() => {
  const configureStatusBar = async () => {
    try {
      // Make status bar visible
      await StatusBar.show();

      // Set text color to light or dark depending on your theme
      await StatusBar.setStyle({ style: Style.Light }); // options: Light, Dark

      // Optional: make it not overlay your webview content
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      console.log('StatusBar error:', err);
    }
  };

  configureStatusBar();
}, []);


  // Show loading spinner while checking auth (prevents flash)
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-blue-400 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }





  return (
    <Router>
       <BackButtonHandler />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/planner" element={<TaskPlanner />} />
        <Route path="/planner/active" element={<ActiveTasks />} />
        <Route path="/planner/completed" element={<CompletedTasks />} />
        <Route path="/planner/task/:taskId/subtasks" element={<SubtaskPage />} />

        {/* Catch-all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;