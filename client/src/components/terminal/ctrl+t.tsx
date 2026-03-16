const Terminal=()=>{
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full bg-black text-green-500 p-4 rounded-lg border-2 border-green-500">
                <p>Welcome to the CyberHex Terminal!</p>
                <p>Type your commands below:</p>
                <input type="text" className="w-full bg-transparent border-none outline-none text-green-500" placeholder="Enter command..." />
            </div>
        </div>
    )
}

export default Terminal;