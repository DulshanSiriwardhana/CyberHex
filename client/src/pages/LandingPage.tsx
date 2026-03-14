import { useContext, useEffect } from "react";
import { PopupContext } from "../contexts/popups";
import Banner from "../components/opening/banner";
import { StoreContext } from "../contexts/store";

const LandingPage = () => {
    const { openPopup, closePopup } = useContext(PopupContext);
    const { createState, updateState, state } = useContext(StoreContext);

    useEffect(() => {
        console.log(state);
        if(state.welcome === undefined) {
            createState("welcome", 0);
            openPopup(<Banner />);
        } else {
        }
        return () => {
            updateState("welcome", state.welcome + 1);
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