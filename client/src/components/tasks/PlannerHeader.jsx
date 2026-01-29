// src/components/PlannerHeader.jsx
import { useNavigate } from 'react-router-dom';

export default function PlannerHeader({ currentPageTitle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('email');
    navigate('/');
  };

  return (
    <header className="mb-8 pb-6 border-b border-indigo-800/40">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-300">
          {currentPageTitle || 'Task Planner'}
        </h1>

        <button
          onClick={handleLogout}
          className="
            px-6 py-3 bg-red-800/80 hover:bg-red-700 
            border border-red-600/60 rounded-xl 
            text-white font-medium transition-all 
            shadow-md shadow-red-900/40
            flex items-center gap-2
          "
        >
          Logout
          {/* Optional icon: <FaSignOutAlt className="text-lg" /> */}
        </button>
      </div>
    </header>
  );
}