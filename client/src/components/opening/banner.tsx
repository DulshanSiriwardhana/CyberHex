import banner from '../../assets/videos/banner.mp4';

const Banner=()=>{
    return (
        <div className="w-120 h-80 flex p-4 bg-black items-center justify-center flex-col gap-4">
            <div className="text-2xl font-bold text-red-600">Welcome to CyberHex</div>
            <video autoPlay loop muted className='max-w-[90%] rounded-lg'>
                <source src={banner} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}

export default Banner;