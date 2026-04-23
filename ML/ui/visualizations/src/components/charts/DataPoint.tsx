import { useEffect, useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";
import { calcPosition, getLine } from "../../utils/functions";

const DataPoint=({domain, range, point, next}:{domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y:number}, next?: {x: number, y:number}})=>{
    const current_point_ref = useRef<HTMLDivElement | null>(null);
    const next_point_ref = useRef<HTMLDivElement | null>(null);

    const [current_point, setCurrentPoint] = useState<{x: number | undefined, y:number | undefined}>();
    const [next_point, setNextPoint] = useState<{x: number | undefined, y:number | undefined}>();

    useEffect(()=>{
        setCurrentPoint({x: current_point_ref.current?.offsetLeft, y: current_point_ref.current?.offsetTop});
        setNextPoint({x: next_point_ref.current?.offsetLeft, y: next_point_ref.current?.offsetTop});
    }, []);

    return(
        <div className="absolute w-full h-full">
            <div className="absolute" style={{left:`${calcPosition(domain, range, point)[0]}%`, top: `${calcPosition(domain, range, point)[1]}%`}}>
                <div ref={current_point_ref} className="h-2 w-2 rounded-full bg-black flex items-start justify-start ml-[-4px] mt-[-4px]">
                    
                </div>
            </div>

            { next &&
                <div className="absolute invisible bg-green-500" style={{left:`${calcPosition(domain, range, next)[0]}%`, top: `${calcPosition(domain, range, next)[1]}%`}}>
                    <div ref={next_point_ref} className="h-2 w-2 rounded-full bg-black flex items-start justify-start ml-[-4px] mt-[-4px]">
                        
                    </div>
                </div>
            }

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