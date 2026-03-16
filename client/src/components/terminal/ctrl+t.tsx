import { useState } from "react";

const Terminal = () => {
    const [numberOfLines, setNumberOfLines] = useState(0);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full bg-black text-green-500 p-4 rounded-lg border-2 border-green-500">
                {numberOfLines > 0 && <span>cyberhex:~</span>}
                <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-green-500"
                    placeholder=""
                />
            </div>
        </div>
    );
};

export default Terminal;