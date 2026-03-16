import { items } from "../../const/data";

const NavPopup = () => {
    return (
        <div className="bg-gray-800 text-white p-4 rounded-xl border-2 border-black max-w-boundary mt-2 fixed top-16 left-0 right-0 z-50 mx-2">
            <ul className="space-y-2">
                {
                    items.map((item) => (
                        <li key={item.name} className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                            {item.name}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};

export default NavPopup;