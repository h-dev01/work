import React from 'react';
import { Box } from '@mui/material';

/**
 * LazyImage Component
 * 
 * Helper component to ensure images are lazy loaded by default.
 * Provides a skeleton or blur effect placeholder if extended.
 * 
 * Props:
 * - src: Image source URL
 * - alt: Alt text (Required for A11y)
 * - width, height: Dimensions (Recommended for CLS prevention)
 * - sx: MUI styling props
 * - ...others: Standard img props
 */
const LazyImage = ({ src, alt, width, height, sx, ...props }) => {
  if (!alt) {
    console.warn(`LazyImage: Missing 'alt' text for image ${src}. Accessiblity requires alt text.`);
  }

  return (
    <Box 
      component="img"
      src={src}
      alt={alt || "image"}
      loading="lazy"
      width={width}
      height={height}
      sx={{
        maxWidth: '100%',
        height: 'auto',
        ...sx
      }}
      {...props}
    />
  );
};

export default LazyImage;
