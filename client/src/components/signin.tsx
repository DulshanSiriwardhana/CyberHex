import { useContext, useState } from "react";
import { PopupContext } from "../contexts/popups";
import SignUp from "./signup/signup";

const SignIn =()=>{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [randomString, setRandomString] = useState('Hello World');
    const { openPopup } = useContext(PopupContext);

    const handleSignIn = () => {
        console.log('Signing in with:', { email, password, otp });
    };

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-75 text-white">
            <div className="flex items-center justify-center flex-col gap-4 w-full p-4">
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Email</div>
                    <input placeholder="cyberhex@wizard.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2" />
                </div>
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Password</div>
                    <input placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2" />
                </div>
                <div className="flex items-center justify-between gap-2 w-full mt-4">
                    <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2"/>
                    <div className="flex items-center justify-center text-center text-nowrap">{randomString}</div>
                </div>
                <button onClick={handleSignIn} className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer mt-4">Sign In</button>
                <div>Don't have an account? <button onClick={() => openPopup(<SignUp />)} className="text-red-700 hover:underline cursor-pointer">Sign Up</button></div>
            </div>
        </div>
    )
}

export default SignIn;