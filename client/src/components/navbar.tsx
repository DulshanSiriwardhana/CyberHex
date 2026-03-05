const NavBar = () => {
  return (
    <nav className="bg-black text-white p-4">
      <div className="mx-auto flex justify-between items-between">
        <div className="text-lg font-bold">CyberHex</div>
        <div>
          <a href="/" className="px-3 py-2 hover:bg-gray-700 rounded">Home</a>
          <a href="/about" className="px-3 py-2 hover:bg-gray-700 rounded">About</a>
          <a href="/contact" className="px-3 py-2 hover:bg-gray-700 rounded">Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;