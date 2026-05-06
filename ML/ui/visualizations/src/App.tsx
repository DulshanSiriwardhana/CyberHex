import './App.css'
import LineChart from './components/charts/LineChart'
import { useEffect, useState } from 'react'
import type { LineChartType } from './types/charts'
import { linechartdata } from './const/Charts'

function App() {
  const [chartData, setChartData] = useState<LineChartType>(linechartdata)

  useEffect(() => {
    const loadCSV = async () => {
      const response = await fetch('/epoch_losses.csv')
      const text = await response.text()

      const lines = text.split('\n').filter(Boolean)

      const data = lines
        .slice(1)
        .map(line => {
          const [epoch, loss] = line.split(',')
          return {
            x: Number(epoch),
            y: Number(loss)
          }
        })
        .filter(d => !isNaN(d.x) && !isNaN(d.y))

      const formatted: LineChartType = {
        data,
        domain: {
          start: 0,
          end: data.length
        },
        range: {
          start: Math.min(...data.map(d => d.y)),
          end: Math.max(...data.map(d => d.y))
        }
      }

      setChartData(formatted)
    }

    loadCSV()
  }, [])

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
      <div className='w-[95%] h-full py-4 mx-8 bg-white border border-white'>
        <LineChart factor={1} info={chartData} />
      </div>
    </div>
  )
}

export default App