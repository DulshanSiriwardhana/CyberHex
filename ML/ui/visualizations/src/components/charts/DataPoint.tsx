import type { LineChartType } from "../../types/charts";
import { calcPosition } from "../../utils/functions";

const DataPoint=({domain, range, point}:{domain: LineChartType["domain"], range: LineChartType["range"],point: {x: number, y:number}})=>{
    return(
        <div className="absolute" style={{left:`${calcPosition(domain, range, point)[0]}%`, top: `${calcPosition(domain, range, point)[1]}%`}}>
            <div className="h-2 w-2 rounded-full bg-black flex items-start justify-start ml-[-4px] mt-[-4px]">
                .
            </div>
        </div>
    )
}

export default DataPoint;