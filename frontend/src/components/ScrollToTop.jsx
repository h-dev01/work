import React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Zoom from '@mui/material/Zoom';
import Box from '@mui/material/Box';

function ScrollTop(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    } else {
        // Fallback if no anchor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
    // Simplified version without anchor need for just "top of page"
    const scrollToTop = () => {
         const anchor = document.querySelector('#back-to-top-anchor');
         if (anchor) {
           anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
         } else {
           window.scrollTo({ top: 0, behavior: 'smooth' });
           document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
           document.body.scrollTo({ top: 0, behavior: 'smooth' });
         }
    };


  return (
    <Zoom in={trigger}>
      <Box
        onClick={scrollToTop}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

export default function ScrollToTop(props) {
  return (
    <ScrollTop {...props}>
      <Fab color="primary" size="small" aria-label="scroll back to top">
        <KeyboardArrowUpIcon />
      </Fab>
    </ScrollTop>
  );
}
