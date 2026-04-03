import { useRef } from "react";
import type { LineChartType } from "../../types/charts";
import { calcLeftPercent, calcTopPercent } from "../../utils/functions";

const LineChart=({info}:{info:LineChartType})=>{
    const {data, domain, range} = info;
    const chartRef = useRef(null);
    const leftPercent = calcLeftPercent(domain);
    const topPercent = calcTopPercent(domain);

    return(
        <div ref={chartRef} className="border w-full h-full min-h-[720px] max-w-[90%] mx-auto flex flex-col items-center justify-center">
            <div className="relative flex-1 w-[calc(100%-20px)] h-[calc(100%-20px)]">
                {
                    Array.from({length: domain.end - domain.start}, (_, i)=> i).map((i)=>(
                        <div className="h-full">{i}</div>
                    ))
                }
                {
                    <>
                        <div style={{ top: `${topPercent}%`}} className="absolute w-full left-0 h-0.5 bg-black flex">
                            <div style={{ width: `${leftPercent}%` }} className="h-1 bg-red-500">

                            </div>
                            <div style={{ width: `${100-leftPercent}%` }} className="w-full h-1 bg-green-500">

                            </div>
                        </div>
                        <div style={{ left: `${leftPercent}%` }} className="absolute w-0.5 h-[calc(100%-20px)] top-[10px] bg-black">
                            <div style={{ height: `${leftPercent}%` }} className="w-1 bg-red-500">

                            </div>
                            <div style={{ height: `${100-leftPercent}%` }} className="w-1 bg-green-500">

                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default LineChart;