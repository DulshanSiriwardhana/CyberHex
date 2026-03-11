import { useState } from "react";

const SignIn =()=>{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const handleSignIn = () => {
        console.log('Signing in with:', { username, password, otp });
    };

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-[320px] text-white">
            <div className="flex items-center justify-center flex-col gap-4 w-full p-4">
                <div className="flex items-start justify-center flex-col gap-2">
                    <div>Username</div>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-1 rounded-md text-black bg-white" />
                </div>
                <div className="flex items-start justify-center flex-col gap-2">
                    <div>Password</div>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-1 rounded-md text-black bg-white" />
                </div>
            </div>
        </div>
    )
}

export default SignIn;