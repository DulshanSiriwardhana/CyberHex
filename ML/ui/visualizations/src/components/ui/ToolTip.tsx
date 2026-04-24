const ToolTip=({x, y, label}: {x: number, y: number, label: string})=>{

    return(
        <div className="absolute min-w-20 max-w-32 min-h-14 bg-gray-600 text-white z-50 w-full flex items-center justify-center rounded-sm shadow-md">
            {label}
        </div>
    )
}

export default ToolTip;