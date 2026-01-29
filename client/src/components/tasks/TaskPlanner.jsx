// src/components/TaskPlanner.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TaskPlanner() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');
  if (!email) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    // Redtrect to active by default
    navigate('/planner/active');
  }, []);

  return null; // This is now just a wrapper; actual content in sub-routes
}