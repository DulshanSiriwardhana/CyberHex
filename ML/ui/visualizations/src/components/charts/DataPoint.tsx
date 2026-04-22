const DataPoint=({point}:{point: {x: number, y:number}})=>{
    return(
        <div className="absolute">
            {point.x}
        </div>
    )
}

export default DataPoint;