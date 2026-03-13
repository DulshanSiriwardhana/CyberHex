import { useContext, useState } from "react";
import SignIn from "../signin";
import { PopupContext } from "../../contexts/popups";
import ProgressBar from "./progressbar";
import UserName from "./username";
import Email from "./email";
import Password from "./password";
import OTP from "./otp";

const SignUp =()=>{
    const { openPopup } = useContext(PopupContext);
    const [ fullname, setFullName ] = useState('');
    const [ username, setUsername ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ otp, setOtp ] = useState('');
    const [ step, _setStep ] = useState(1);

    return (
        <div className="w-full max-w-md h-fit flex items-center justify-center flex-col bg-black min-w-[320px] text-white">
            <div className="pt-4">
                <ProgressBar step={step}/>
            </div>
            <div className="flex items-center justify-center flex-col gap-4 w-full px-4 pb-4">
                {
                    (()=>{
                        if(step === 1) {
                            return (<UserName fullname={fullname} username={username} setFullname={setFullName} setUsername={setUsername}/>);
                        } else if(step === 2) {
                            return (<Email email={email} setEmail={setEmail}/>);
                        } else if(step === 3) {
                            return (<Password password={password} setPassword={setPassword}/>);
                        } else if(step === 4) {
                            return (<OTP otp={otp} setOtp={setOtp}/>);
                        }
                        else {
                            return (<div className="text-sm pt-4">Account Created Successfully!</div>);
                        }
                    })()
                }
                <button onClick={() => _setStep(step + 1)} className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer mt-4">{step === 4 ? 'Finish' : 'Next'}</button>
                <div>Already have an account? <button onClick={()=>openPopup(<SignIn />)} className="text-red-700 hover:underline cursor-pointer">Sign In</button></div>
            </div>
        </div>
    )
}

export default SignUp;