import './App.css';
import Layer from './Layer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <div className='min-h-screen bg-gray-100'>
      <Router>
        <Layer>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/about" element={<div>About Page</div>} />
            <Route path="/contact" element={<div>Contact Page</div>} />
          </Routes>
        </Layer>
      </Router>
    </div>
  )
}

export default App
