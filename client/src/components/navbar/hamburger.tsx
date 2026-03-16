
const Hamburger = ({ onClick, isOpen }:{ onClick: () => void; isOpen: boolean }) => {
  return (
    <div className="flex flex-col gap-1 py-3 md:hidden cursor-pointer" onClick={onClick}>
        <div className={`w-8 h-1 bg-white rounded-2xl ${isOpen ? 'invisible' : 'visible'}`}></div>
        <div className={`w-8 h-1 bg-white rounded-2xl transition-transform-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
        <div className={`w-8 h-1 bg-white rounded-2xl transition-transform-all duration-300 ${isOpen ? 'rotate-135 -translate-y-1' : ''}`}></div>
        <div className={`w-8 h-1 bg-white rounded-2xl ${isOpen ? 'invisible' : 'visible'}`}></div>
    </div>
  );
};

export default Hamburger;