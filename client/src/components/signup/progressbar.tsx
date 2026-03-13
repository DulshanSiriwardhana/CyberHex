const ProgressBar=({step}: {step: number})=>{
    return(
        <div className="flex items-center justify-center">
            <div className={`w-6 h-6 border border-t-4 border-white rounded-full ${step >= 1 ? 'opacity-100 bg-green-500' : 'opacity-30 bg-red-500 animate-spin'}`}></div>
            <div className={`w-6 h-px bg-white ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}></div>
            <div className={`w-6 h-6 border border-t-4 border-white rounded-full ${step >= 2 ? 'opacity-100 bg-green-500' : 'opacity-30 bg-red-500 animate-spin'}`}></div>
            <div className={`w-6 h-px bg-white ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}></div>
            <div className={`w-6 h-6 border border-t-4 border-white rounded-full ${step >= 3 ? 'opacity-100 bg-green-500' : 'opacity-30 bg-red-500 animate-spin'}`}></div>
            <div className={`w-6 h-px bg-white ${step >= 4 ? 'opacity-100' : 'opacity-30'}`}></div>
            <div className={`w-6 h-6 border border-t-4 border-white rounded-full ${step >= 4 ? 'opacity-100 bg-green-500' : 'opacity-30 bg-red-500 animate-spin'}`}></div>
        </div>
    )
}

export default ProgressBar;