import './App.css';
import Layer from '@/Layer';
import { Suspense } from 'react';
import LandingPage from '@/pages/LandingPage';
import { PopupProvider } from '@/contexts/popups';
import { StoreProvider } from '@/contexts/store';
import CyberGames from '@/pages/CyberGames';
import { items } from '@/const/data';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {

  return (
    <div className='font-spectral'>
      <Router>
        <StoreProvider>
          <PopupProvider>
            <Layer>
                <ErrorBoundary>
                  <Routes>
                    <Route path={items[0].path} element={<LandingPage/>} />
                    <Route path={items[2].path} element={<CyberGames/>}/>
                    <Route path={items[1].path} element={<div>About Page</div>} />
                    <Route path={items[3].path} element={<div>Contact Page</div>} />
                    <Route path="/test" element={<TestPage />} />
                  </Routes>
                </ErrorBoundary>
            </Layer>
          </PopupProvider>
        </StoreProvider>
      </Router>
    </div>
  )
}

export default App
