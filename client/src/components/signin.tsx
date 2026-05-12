import { useContext, useState } from "react";
import { PopupContext } from "../contexts/popups";
import { useAuth } from "../contexts/auth";
import SignUp from "./signup/signup";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { openPopup, closePopup } = useContext(PopupContext);
    const { login } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            closePopup();
        } catch (err: any) {
            setError(err.message || 'Sign in failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2" />
                </div>
                {error && <div className="text-red-400 text-sm w-full">{error}</div>}
                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full p-2 rounded-md bg-red-700 hover:bg-red-600 cursor-pointer mt-4 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <div>Don't have an account? <button onClick={() => openPopup(<SignUp />)} className="text-red-700 hover:underline cursor-pointer">Sign Up</button></div>
            </div>
        </div>
    );
};

export default SignIn;