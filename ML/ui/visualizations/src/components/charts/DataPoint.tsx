import { useEffect, useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";
import { calcPosition, getLine } from "../../utils/functions";

const DataPoint=({domain, range, point, next}:{domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y:number}, next?: {x: number, y:number}})=>{
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [x1_precentage, y1_precentage] = calcPosition(domain, range, point);
    const [x2_precentage, y2_precentage] = next ? calcPosition(domain, range, next) : [0, 0];
    const [size, setSize] = useState({width: 0, height: 0});

    useEffect(() => {
        if(!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const {width, height} = entry.contentRect;
            setSize({width, height});
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return(
        <div className="absolute w-full h-full">
            <div className="absolute" style={{left:`${calcPosition(domain, range, point)[0]}%`, top: `${calcPosition(domain, range, point)[1]}%`}}>
                <div ref={containerRef} className="h-2 w-2 rounded-full bg-black flex items-start justify-start ml-[-4px] mt-[-4px]">
                    
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