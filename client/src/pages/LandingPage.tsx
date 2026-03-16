import { useContext, useEffect } from "react";
import { PopupContext } from "../contexts/popups";
import Banner from "../components/opening/banner";
import { StoreContext } from "../contexts/store";
import Hero from "../components/landingpage/hero";

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
        <div className="w-full h-full flex items-center justify-center py-2 gap-4 flex-col">
            <Hero/>
        </div>
    );
};

export default LandingPage;