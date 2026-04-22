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

export const getLine=(point: {x: number, y: number}, next: {x: number, y: number}, domain: LineChartType["domain"], range: LineChartType["range"])=>{
    var ratio = Math.pow((domain.end - domain.start)/(range.end - range.start),2);
    return [100*(Math.sqrt(Math.pow(next.x-point.x, 2)+ ratio * Math.pow(next.y-point.y, 2)))/(domain.end - domain.start), (-180/Math.PI)*Math.atan(((next.y-point.y)* (range.end - range.start))/((next.x-point.x)*(range.end - range.start)))]
}