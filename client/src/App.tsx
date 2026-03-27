import './App.css';
import Layer from './Layer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import { PopupProvider } from './contexts/popups';
import { StoreProvider } from './contexts/store';
import CyberGames from './pages/CyberGames';
import TestPage from './pages/TestPage';

function App() {

  return (
    <div className='font-spectral'>
      <Router>
        <StoreProvider>
          <PopupProvider>
            <Layer>
                <Routes>
                  <Route path="/" element={<LandingPage/>} />
                  <Route path='/cyber-games' element={<CyberGames/>}/>
                  <Route path="/about" element={<div>About Page</div>} />
                  <Route path="/contact" element={<div>Contact Page</div>} />
                  <Route path="/test" element={<TestPage />} />
                </Routes>
            </Layer>
          </PopupProvider>
        </StoreProvider>
      </Router>
    </div>
  )
}

export default App
