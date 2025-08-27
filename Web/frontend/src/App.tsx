import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserSelection from './page/UserSelection';
import Dashboard from './page/Dashboard';
import TransactionDetails from './page/TransactionDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction/:id" element={<TransactionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;