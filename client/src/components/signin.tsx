import { useState } from "react";

const SignIn =()=>{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [randomString, setRandomString] = useState('Hello World');

    const handleSignIn = () => {
        console.log('Signing in with:', { username, password, otp });
    };

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-[320px] text-white">
            <div className="flex items-center justify-center flex-col gap-4 w-full p-4">
                <div className="flex items-start justify-center flex-col gap-2 w-full">
                    <div>Username</div>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-1 rounded-md text-black bg-white" />
                </div>
                <div className="flex items-start justify-center flex-col gap-2 w-full">
                    <div>Password</div>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-1 rounded-md text-black bg-white" />
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                    <input className="w-full p-1 rounded-md text-black bg-white"/>
                    <div className="flex items-center justify-center text-center text-nowrap">{randomString}</div>
                </div>
                <button onClick={handleSignIn} className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer">Sign In</button>
            </div>
        </div>
    )
}

export default SignIn;