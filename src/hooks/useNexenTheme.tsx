import React from 'react'
import type { NexenTheme } from '../utils/Theme';


type ThemeContext = {
    nexenTheme?: NexenTheme;
    setNexenTheme?: (theme: NexenTheme) => void;
}

type ThemeProvider = {
  children: React.ReactNode;
  initTheme: NexenTheme;
}

export const NexenThemeContext = React.createContext<ThemeContext>({});

export const NexenThemeProvider = ({children, initTheme}: ThemeProvider) => {
  const [nexenTheme, setNexenTheme] = React.useState<NexenTheme>(initTheme);

    return (
        <NexenThemeContext.Provider value={{nexenTheme, setNexenTheme}} >
          {children}
        </NexenThemeContext.Provider>
    )
}

const useNexenTheme = (): ThemeContext => {
  const {nexenTheme, setNexenTheme} = React.useContext(NexenThemeContext);
  return {nexenTheme, setNexenTheme}
}

export { useNexenTheme }