import { useEffect, useRef, useState } from "react";
import type { LineChartType } from "../../types/charts";
import { calcPosition, getLine } from "../../utils/functions";

const DataPoint=({domain, range, point, next}:{domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y:number}, next?: {x: number, y:number}})=>{
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [x1_precentage, y1_precentage] = calcPosition(domain, range, point);
    const [x2_precentage, y2_precentage] = next ? calcPosition(domain, range, next) : [0, 0];
    const [size, setSize] = useState({width: 0, height: 0});
    const [{x1, y1, length, angle}, setLine] = useState(getLine(x1_precentage, y1_precentage, x2_precentage, y2_precentage, size.width, size.height));

    useEffect(() => {
        if(!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const {width, height} = entry.contentRect;
            setSize({width, height});
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(()=>{
        setLine(getLine(x1_precentage, y1_precentage, x2_precentage, y2_precentage, size.width, size.height))
    },[size]);

    return(
        <div ref={containerRef} className="absolute w-full h-full">
            <div className="absolute" style={{left: x1, top: y1, transform:"translate(-50%, -50%)"}}>
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            </div>
            {next && (
                <div
                className="absolute bg-black h-[2px] origin-left"
                style={{
                    left: x1,
                    top: y1,
                    width: length,
                    transform: `translateY(-50%) rotate(${angle}deg)`,
                }}
                />
            )}
        </div>
    )
}

export default DataPoint;