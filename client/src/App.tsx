import './App.css';
import Layer from '@/Layer';
import { lazy } from 'react';
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const CyberGames = lazy(() => import('@/pages/CyberGames'));
const TestPage = lazy(() => import('@/pages/TestPage'));

function App() {

  return (
    <div className='font-spectral'>
      <Router>
        <StoreProvider>
          <PopupProvider>
            <Layer>
                <ErrorBoundary>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path={items[0].path} element={<LandingPage/>} />
                      <Route path={items[2].path} element={<CyberGames/>}/>
                      <Route path={items[1].path} element={<div>About Page</div>} />
                      <Route path={items[3].path} element={<div>Contact Page</div>} />
                      <Route path="/test" element={<TestPage />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
            </Layer>
          </PopupProvider>
        </StoreProvider>
      </Router>
    </div>
  )
}

export default App
