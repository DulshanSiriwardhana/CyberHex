import { useContext } from "react";
import SignIn from "./signin";
import { PopupContext } from "../contexts/popups";

const SignUp =()=>{
    const { openPopup } = useContext(PopupContext);

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-[320px] text-white">
            <div className="flex items-center justify-center flex-col gap-4 w-full p-4">
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Email</div>
                    <input className="w-full p-1 rounded-md text-black bg-white" />
                </div>
                <div className="flex items-start justify-center flex-col gap-1 w-full">
                    <div>Password</div>
                    <input className="w-full p-1 rounded-md text-black bg-white" />
                </div>
                <button className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer">Sign Up</button>
                <div>Already have an account? <button onClick={()=>openPopup(<SignIn />)} className="text-red-700 hover:underline cursor-pointer">Sign In</button></div>
            </div>
        </div>
    )
}

export default SignUp;