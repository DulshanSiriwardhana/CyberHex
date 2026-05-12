import { useMemo } from 'react';

const Beam=()=>{
    const { randR, randG, randB, moveR, moveG, moveB, speed } = useMemo(() => ({
        randR: Math.floor(Math.random() * 256),
        randG: Math.floor(Math.random() * 256),
        randB: Math.floor(Math.random() * 256),
        moveR: Math.floor(Math.random() * 256),
        moveG: Math.floor(Math.random() * 256),
        moveB: Math.floor(Math.random() * 256),
        speed: (Math.random() + 0.001)%1
    }), []);

    return(
        <div className="bg-black w-full flex">
            <div className="w-[10vw] h-0.5 max-w-20 relative rounded-4xl flex items-center justify-center" style={{ transform: `translateX(${speed * 100}vw)`, transitionDuration: `${10000/speed}ms`, backgroundColor: `rgb(${randR}, ${randG}, ${randB})`, boxShadow: `0 0 10px rgba(${moveR}, ${moveG}, ${moveB}, 1)` }}>
                <div className="absolute w-[1vw] h-[1vw] rounded-full" style={{ backgroundColor: `rgb(${moveR}, ${moveG}, ${moveB})` }}>
                </div>
            </div>
        </div>
    )
}

const BG=()=>{
    return(
        <div className="w-full min-h-full overflow-hidden">
            <Beam />
        </div>
    )
}

export default BG;