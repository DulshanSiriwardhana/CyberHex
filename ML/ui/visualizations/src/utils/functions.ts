import type { LineChartType } from "../types/charts";

export const calcLeftPercent=(domain: LineChartType["domain"])=>{
    if(domain.start<=0 && domain.end>=0){
        return 100*(-domain.start)/(domain.end-domain.start);
    }

    if(domain.start<=0 && domain.end<=0){
        return 100;
    }

    return 0;
}

export const calcTopPercent=(range: LineChartType["range"])=>{
    if(range.start<=0 && range.end>=0){
        return 100*(range.end)/(range.end-range.start);
    }

    if(range.start<=0 && range.end<=0){
        return 0;
    }

    return 100;
}

export const calcPosition=(domain: LineChartType["domain"], range: LineChartType["range"], point: {x: number, y: number})=>{
    return [(100*(point.x-domain.start)/(domain.end-domain.start)), (100*(point.y-range.end)/(range.start-range.end))];
}

export const getLine=(x1_percentage: number, y1_percentage: number, x2_percentage: number, y2_percentage: number, width: number, height: number)=>{
    const x1 = (x1_percentage/100) *width;
    const y1 = (y1_percentage/100)* height;

    const x2 = (x2_percentage/100) *width;
    const y2 = (y2_percentage/100)* height;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * (180/ Math.PI);

    return {x1: x1, y1: y1, length: length, angle: angle};
}