const Line=({x, y, length, angle}: {x: number, y: number, length: number, angle: number})=>{
    return(
        <div className="absolute bg-black h-[2px] origin-left" style={{left: x, top: y, width: length, transform: `translateY(-50%) rotate(${angle}deg)`}}></div>
    )
}

export default Line;