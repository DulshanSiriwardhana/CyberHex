import './App.css'
import LineChart from './components/charts/LineChart'
import { linechartdata } from './const/Charts'

function App() {
  return (
    <div className="w-full h-full min-h-screen flex items-center justify-between">
      <LineChart info={linechartdata}/>
    </div>
  )
}

export default App
