import type { LineChartType } from "../../types/charts";
import { calcPosition, getLine } from "../../utils/functions";

const DataPoint=({domain, range, point, next}:{domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y:number}, next?: {x: number, y:number}})=>{
    return(
        <div className="absolute w-full h-full">
            <div className="absolute" style={{left:`${calcPosition(domain, range, point)[0]}%`, top: `${calcPosition(domain, range, point)[1]}%`}}>
                <div className="h-2 w-2 rounded-full bg-black flex items-start justify-start ml-[-4px] mt-[-4px]">
                    
                </div>
            </div>
            <div className="absolute w-full h-full">
                {
                    next && (
                        <div className="absolute bg-black h-1" style={{left:`${calcPosition(domain, range, point)[0]}%`, top: `${calcPosition(domain, range, point)[1]}%`, width: `${getLine(point, next, domain, range)[0]}%`, rotate:`${getLine(point, next, domain, range)[1]}deg`}}></div>
                    )
                }
            </div>
        </div>
    )
}

export default DataPoint;