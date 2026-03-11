import './App.css';
import Layer from './Layer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import { PopupProvider } from './contexts/popups';

function App() {

  return (
    <div className=''>
      <Router>
        <PopupProvider>
          <Layer>
              <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/about" element={<div>About Page</div>} />
                <Route path="/contact" element={<div>Contact Page</div>} />
              </Routes>
          </Layer>
        </PopupProvider>
      </Router>
    </div>
  )
}

export default App
