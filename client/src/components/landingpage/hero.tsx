import banner from '../../assets/images/banner.png';

const Hero=()=>{
    return(
        <div className="w-full flex flex-row items-center justify-between gap-4">
            <div className='w-full border'>
                hello world
            </div>
            <div>
                <img src={banner} alt="banner" className="h-auto w-full border-2 border-red-600 rounded-2xl"/>
            </div>
        </div>
    )
}

export default Hero;