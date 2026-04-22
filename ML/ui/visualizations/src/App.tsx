import './App.css'
import LineChart from './components/charts/LineChart'
import { linechartdata } from './const/Charts'

function App() {
  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
      <div className='w-[95%] h-full py-4 mx-8 bg-white border border-white'>
         <LineChart info={linechartdata}/>
      </div>
    </div>
  )
}

export default App
