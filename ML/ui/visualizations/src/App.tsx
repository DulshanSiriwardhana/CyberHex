import './App.css'
import LineChart from './components/charts/LineChart'
import { useEffect, useState } from 'react'
import type { LineChartType } from './types/charts'
import { linechartdata } from './const/Charts'

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

function App() {
  const [chartData, setChartData] = useState<LineChartType>(linechartdata)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const loadCSV = async () => {
      setLoadState('loading')
      try {
        const response = await fetch('/epoch_losses.csv')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const text = await response.text()

        const lines = text.split('\n').filter(Boolean)
        if (lines.length <= 1) {
          // Only header or empty — keep default data
          setLoadState('loaded')
          return
        }

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

        if (data.length === 0) {
          setLoadState('loaded')
          return
        }

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
        setLoadState('loaded')
      } catch (err) {
        console.error('Failed to load epoch losses CSV:', err)
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error loading data')
        setLoadState('error')
      }
    }

    loadCSV()
  }, [])

  if (loadState === 'loading') {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg animate-pulse">Loading training data...</div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-400 text-lg">Failed to load data</div>
        <div className="text-gray-400 text-sm">{errorMessage}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
      <div className='w-[95%] h-full py-4 mx-8 bg-white border border-white'>
        <LineChart factor={1} info={chartData} />
      </div>
    </div>
  )
}

export default App
