import { useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";

const LineChart=({info}:{info:LineChartType})=>{
    const {data, domain, range} = info;
    const [chartWidth, setChartWidth] = useState();
    const [chartHeight, setChartHeight] = useState();
    const chartRef = useRef(null);
    const topPercent = (-range.start * 100) / (-range.start - range.end);
    const leftPercent = (-domain.start * 100) / (-domain.start + domain.end);

    return(
        <div ref={chartRef} className="relative border w-full h-full min-h-[720px] max-w-[90%] mx-auto">
            {
                Array.from({length: domain.end - domain.start}, (_, i)=> i).map((i)=>(
                    <div>{i}</div>
                ))
            }
            {
                <>
                    <div style={{ top: `${topPercent}%`}} className="absolute w-full left-0 h-0.5 bg-black">

                    </div>
                    <div style={{ left: `${leftPercent}%` }} className="absolute w-0.5 h-full top-0 bg-black">

                    </div>
                </>
            }
        </div>
    )
}

export default LineChart;