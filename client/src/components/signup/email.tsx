const Email =({email, setEmail}: {email: string, setEmail: (email: string) => void})=>{
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <div className="flex items-start justify-center flex-col gap-1 w-full">
                <div>Email</div>
                <input placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
            </div>
        </div>
    )
}

export default Email;