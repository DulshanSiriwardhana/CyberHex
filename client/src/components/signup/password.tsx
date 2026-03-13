const Password =({password, setPassword}: {password: string, setPassword: (pass: string) => void})=>{
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <div className="flex items-start justify-center flex-col gap-1 w-full">
                <div>Password</div>
                <input placeholder="********" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
            </div>
        </div>
    )
}

export default Password;