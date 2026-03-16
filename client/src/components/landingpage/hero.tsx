import banner from '../../assets/videos/banner.mp4';

const Hero=()=>{
    return(
        <div className="">
            <div>
                <video autoPlay loop muted>
                    <source src={banner} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}

export default Hero;