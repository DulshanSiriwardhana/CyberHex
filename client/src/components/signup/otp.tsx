const OTP=({otp, setOtp}: {otp: string, setOtp: (otp: string) => void})=>{
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <div className="flex items-start justify-center flex-col gap-1 w-full">
                <div>OTP</div>
                <input placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-1 rounded-md text-black bg-white px-2 flex items-center justify-center" />
            </div>
        </div>
    )
}

export default OTP;