import { useEffect, useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";
import { calcPosition, getLine } from "../../utils/functions";

const DataPoint=({domain, range, point, next}:{domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y:number}, next?: {x: number, y:number}})=>{
    const current_point_ref = useRef<HTMLDivElement | null>(null);
    const next_point_ref = useRef<HTMLDivElement | null>(null);

    const [current_point, setCurrentPoint] = useState<{x: number | undefined, y:number | undefined}>();
    const [next_point, setNextPoint] = useState<{x: number | undefined, y:number | undefined}>();

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (current_point_ref.current) {
                const rect = current_point_ref.current.getBoundingClientRect();
                setCurrentPoint({ x: rect.left, y: rect.top });
            }

            if (next_point_ref.current) {
                const rect = next_point_ref.current.getBoundingClientRect();
                setNextPoint({ x: rect.left, y: rect.top });
            }
        });

        if (current_point_ref.current) observer.observe(current_point_ref.current);
        if (next_point_ref.current) observer.observe(next_point_ref.current);

        return () => observer.disconnect();
    }, [point, next]);

    useEffect(()=>{
        console.log(current_point);
        console.log(next_point);
    },[current_point, next_point]);

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