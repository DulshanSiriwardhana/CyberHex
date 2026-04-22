import { useEffect, useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";
import { calcLeftPercent, calcTopPercent } from "../../utils/functions";
import DataPoint from "./DataPoint";

const LineChart=({info}:{info:LineChartType})=>{
    const {data, domain, range} = info;
    const chartRef = useRef(null);
    const leftPercent = calcLeftPercent(domain);
    const topPercent = calcTopPercent(range);
    const [points, setPoints] = useState(data);

    useEffect(()=>{
        setPoints(data);
    }, [info]);

    return(
        <div ref={chartRef} className="border w-full h-full min-h-[720px] max-w-[90%] mx-auto flex flex-col items-center justify-center">
            <div className="relative flex-1 w-[calc(100%-20px)] h-[calc(100%-20px)]">
                <div className="absolute flex w-full items-center justify-between" style={{ top: `${topPercent}%`}}>
                    {
                        Array.from({length: domain.end - domain.start + 1}, (_, i)=> i).map((i)=>(
                            <div className="h-full mt-1 font-bold text-sm">{domain.start + i}</div>
                        ))
                    }
                </div>
                <div className="absolute flex w-full items-center justify-between" style={{ top: `${topPercent}%`}}>
                    {
                        Array.from({length: domain.end - domain.start + 1}, (_, i)=> i).map((i)=>(
                            <div className="h-full mt-1 font-bold text-sm">{domain.start + i}</div>
                        ))
                    }
                </div>
                {
                    <>
                        <div className="absolute w-full h-full inset-0">
                            <div className="relative h-full w-full">
                            {
                                points.map((point)=>(
                                    <DataPoint point={point}/>
                                ))
                            }
                            </div>
                        </div>
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