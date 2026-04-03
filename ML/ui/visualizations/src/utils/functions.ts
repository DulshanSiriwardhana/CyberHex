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