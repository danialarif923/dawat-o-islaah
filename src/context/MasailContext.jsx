import { createContext, useContext, useState } from "react";

const MasailContext = createContext();

export const MasailProvider = ({ children }) => {
  const [masail, setMasail] = useState([]);

  return (
    <MasailContext.Provider value={{ masail, setMasail }}>
      {children}
    </MasailContext.Provider>
  );
};

export const useMasailContext = () => {
  return useContext(MasailContext);
};
