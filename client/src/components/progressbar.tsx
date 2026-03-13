const ProgressBar=()=>{
    return(
        <div className="flex items-center justify-center">
             <div className="w-6 h-6 border border-t-4 border-white rounded-full animate-spin bg-red-500"></div>
             <div className="w-6 h-px bg-white"></div>
             <div className="w-6 h-6 border border-t-4 border-white rounded-full animate-spin bg-red-500"></div>
             <div className="w-6 h-px bg-white"></div>
             <div className="w-6 h-6 border border-t-4 border-white rounded-full animate-spin bg-red-500"></div>
             <div className="w-6 h-px bg-white"></div>
             <div className="w-6 h-6 border border-t-4 border-white rounded-full animate-spin bg-red-500"></div>
        </div>
    )
}

export default ProgressBar;