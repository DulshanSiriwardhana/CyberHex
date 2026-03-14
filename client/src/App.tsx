import './App.css';
import Layer from './Layer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import { PopupProvider } from './contexts/popups';
import { StoreProvider } from './contexts/store';

function App() {

  return (
    <div className='font-spectral'>
      <Router>
        <StoreProvider>
          <PopupProvider>
            <Layer>
                <Routes>
                  <Route path="/" element={<LandingPage/>} />
                  <Route path="/about" element={<div>About Page</div>} />
                  <Route path="/contact" element={<div>Contact Page</div>} />
                </Routes>
            </Layer>
          </PopupProvider>
        </StoreProvider>
      </Router>
    </div>
  )
}

export default App
