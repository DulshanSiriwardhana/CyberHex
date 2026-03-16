import { items } from "../const/data";

const Sidebar = () => {
    return (
        <div className="bg-gray-800 text-white p-4 rounded-xl border-2 border-black max-w-boundary mx-auto mt-4">
            <h2 className="text-lg font-bold mb-4">Sidebar</h2>
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

export default Sidebar;