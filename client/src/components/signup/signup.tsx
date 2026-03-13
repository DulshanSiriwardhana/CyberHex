import { useContext } from "react";
import SignIn from "../signin";
import { PopupContext } from "../../contexts/popups";
import ProgressBar from "./progressbar";

const SignUp =()=>{
    const { openPopup } = useContext(PopupContext);

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-[320px] text-white">
            <div className="pt-4">
                <ProgressBar step={3}/>
            </div>
            <div className="flex items-center justify-center flex-col gap-4 w-full px-4 pb-4">
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Email</div>
                    <input placeholder="cyberhex@wazard.com" className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
                </div>
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Username</div>
                    <input placeholder="cyber hex" className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
                </div>
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>OTP</div>
                    <input placeholder="OTP" className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
                </div>
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Password</div>
                    <input placeholder="••••••••" className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
                </div>
                <button className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer">Sign Up</button>
                <div>Already have an account? <button onClick={()=>openPopup(<SignIn />)} className="text-red-700 hover:underline cursor-pointer">Sign In</button></div>
            </div>
        </div>
    )
}

export default SignUp;