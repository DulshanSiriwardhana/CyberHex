import NavBar from "./components/navbar";

const Layer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={`p-4 bg-white rounded shadow ${className}`}>
        <div className="w-full">
            <NavBar />
        </div>
        {children}
    </div>
  );
};

export default Layer;