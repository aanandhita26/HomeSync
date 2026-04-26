import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [activeHouseholdId, setActiveHouseholdId] = useState(null);

  const handleSetUser = (userData) => {
    setUser(userData);
    if (!userData) setActiveHouseholdId(null);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing setUser={handleSetUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={handleSetUser} activeHouseholdId={activeHouseholdId} setActiveHouseholdId={setActiveHouseholdId} /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
