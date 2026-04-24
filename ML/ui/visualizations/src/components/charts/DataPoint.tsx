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
        <div ref={containerRef} className="absolute w-full h-full">
            <div className="absolute" style={{left: x1_precentage}}></div>
        </div>
    )
}

export default DataPoint;