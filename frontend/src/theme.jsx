export const getDesignTokens = (mode, role) => {
  const primaryColor = mode === 'dark' ? "#7DD3FC" : "#12343B"; 
  const secondaryColor = "#00A896";

  return {
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
      background: {
        default: mode === 'light' ? "#F6FBFA" : "#101418",
        paper: mode === 'light' ? "#FFFFFF" : "#1C2529",
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16, 
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24, 
            boxShadow: '0 18px 50px -28px rgb(18 52 59 / 0.6)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
             borderRadius: 24,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16, 
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  };
};