const Beam=()=>{
    const randR = Math.floor(Math.random() * 256);
    const randG = Math.floor(Math.random() * 256);
    const randB = Math.floor(Math.random() * 256);
    const moveR = Math.floor(Math.random() * 256);
    const moveG = Math.floor(Math.random() * 256);
    const moveB = Math.floor(Math.random() * 256);
    const speed = Math.random() * 2 + 1;

    return(
        <div className="bg-black w-full max-h-full flex">
            <div className="w-[10vw] h-0.5 max-w-20 relative rounded-4xl flex items-center justify-center" style={{ backgroundColor: `rgb(${randR}, ${randG}, ${randB})`, boxShadow: `0 0 10px rgba(${moveR}, ${moveG}, ${moveB}, 1)` }}>
                <div className="absolute w-[1vw] h-[1vw] rounded-full" style={{ backgroundColor: `rgb(${moveR}, ${moveG}, ${moveB})` }}>
                </div>
            </div>
        </div>
    )
}

const BG=()=>{
    return(
        <div className="w-full h-full border overflow-hidden flex">
            <Beam />
        </div>
    )
}

export default BG;