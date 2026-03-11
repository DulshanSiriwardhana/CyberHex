import './App.css';
import Layer from './Layer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import { PopupContext } from './contexts/popups';

function App() {

  return (
    <div className=''>
      <Router>
          <Layer>
              <PopupContext>
                <Routes>
                  <Route path="/" element={<LandingPage/>} />
                  <Route path="/about" element={<div>About Page</div>} />
                  <Route path="/contact" element={<div>Contact Page</div>} />
                </Routes>
            </PopupContext>
          </Layer>
      </Router>
    </div>
  )
}

export default App
