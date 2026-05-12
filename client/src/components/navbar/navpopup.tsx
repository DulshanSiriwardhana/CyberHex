import { useEffect, useState } from "react";
import { items } from "../../const/data";

const NavPopup = () => {
    const [delayed, setDelayed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDelayed(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xs -z-10">
            <div className={`text-white p-4 rounded-xl border-2 border-black max-w-boundary mt-2 fixed top-16 left-0 right-0 z-50 mx-2 bg-black ${delayed ? "transform translate-y-0" : "transform -translate-y-full"} transition-transform-all duration-300`}>
                <ul className="space-y-2">
                    {
                        items.map((item) => (
                            <li key={item.name} className="cursor-pointer hover:bg-red-700 p-2 rounded">
                                {item.name}
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
};

export default NavPopup;