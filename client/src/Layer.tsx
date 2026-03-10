import { useEffect, useRef, useState } from "react";
import NavBar from "./components/navbar";

const Layer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(900);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);
  
  return (
    <div className={`p-2 bg-white min-h-screen h-full`}>
        <div ref={navRef} className="w-full h-fit sticky top-2 z-50">
            <div className="">
              <NavBar />
            </div>
        </div>
        <div
          style={{ minHeight: `calc(100vh - ${navHeight+16}px)` }}
          className="w-full flex items-center justify-center"
          >
          {children}
        </div>
    </div>
  );
};

export default Layer;