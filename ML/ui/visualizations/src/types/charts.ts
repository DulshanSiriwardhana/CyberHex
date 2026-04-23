export interface LineChartType {
    domain: {
        start: number,
        end: number
    };
    range: {
        start: number,
        end: number
    };
    data:
        {
            x: number,
            y: number
        }[];
    
}