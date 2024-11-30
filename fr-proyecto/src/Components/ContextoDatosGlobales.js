import React, { createContext, useState, useEffect } from 'react';

// Crea el contexto
export const DatosGlobalesContexto = createContext();

export const DatosGlobalesProvider = ({ children }) => {
  //inicializa el estado con los datos de localStorage si existen
  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : null;
  });

  //guarda los datos en localStorage cada vez que cambian
  useEffect(() => {
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data));
    }
  }, [data]);

  return (
    <DatosGlobalesContexto.Provider value={{ data, setData }}>
      {children}
    </DatosGlobalesContexto.Provider>
  );
};
