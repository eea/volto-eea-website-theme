import { createContext } from 'react';

// Volto 18 has no Grid block context, `razzle.extend.js` points the Volto 19
// import here so the Grid block view shadow builds on both versions.
export const GridContext = createContext(1);
