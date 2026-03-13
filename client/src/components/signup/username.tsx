const UserName =({fullname, username, setFullname, setUsername}: {fullname: string, username: string, setFullname: (name: string) => void, setUsername: (name: string) => void})=>{
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <div className="flex items-start justify-center flex-col gap-1 w-full">
                <div>Full Name</div>
                <input placeholder="John Doe" value={fullname} onChange={(e) => setFullname(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
            </div>
            <div className="flex items-start justify-center flex-col gap-1 w-full">
                <div>Username</div>
                <input placeholder="john_doe" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
            </div>
        </div>
    )
}

export default UserName;