import { useContext, useEffect } from "react";
import { PopupContext } from "../contexts/popups";
import Banner from "../components/opening/banner";

const LandingPage = () => {
    const { openPopup, closePopup } = useContext(PopupContext);

    useEffect(() => {
        openPopup(<Banner />);
        return () => {
            closePopup();
        }
    }, []);

    return (
        <div className="border w-full h-full flex items-center justify-center">
            This is the landing page. Welcome to CyberHex!
        </div>
    );
};

export default LandingPage;