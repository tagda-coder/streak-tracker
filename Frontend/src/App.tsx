import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ReminderEngine from './components/ReminderEngine';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CalendarPage from './pages/CalendarPage';
import DailyView from './pages/DailyView';
import Categories from './pages/Categories';
import AddCategory from './pages/AddCategory';
import AddEntry from './pages/AddEntry';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Reminders from './pages/Reminders';
import BackupRestore from './pages/BackupRestore';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReminderEngine />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/day/:date" element={<ProtectedRoute><DailyView /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/categories/new" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
          <Route path="/add-entry" element={<ProtectedRoute><AddEntry /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/backup-restore" element={<ProtectedRoute><BackupRestore /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
