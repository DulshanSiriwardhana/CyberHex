import './App.css';
import Layer from '@/Layer';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const CyberGames = lazy(() => import('@/pages/CyberGames'));
const TestPage = lazy(() => import('@/pages/TestPage'));
import { PopupProvider } from '@/contexts/popups';
import { StoreProvider } from '@/contexts/store';
import { AuthProvider } from '@/contexts/auth';
import { items } from '@/const/data';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {

  return (
    <div className='font-spectral'>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <PopupProvider>
              <Layer>
                  <ErrorBoundary>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        <Route path={items[0].path} element={<LandingPage/>} />
                        <Route path={items[2].path} element={<ProtectedRoute><CyberGames/></ProtectedRoute>}/>
                        <Route path={items[1].path} element={<div>About Page</div>} />
                        <Route path={items[3].path} element={<div>Contact Page</div>} />
                        <Route path="/test" element={<TestPage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
              </Layer>
            </PopupProvider>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App
