const theme = {
  colors: {
    background: '#F7F6F3',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EEE9',
    border: '#E5E2DB',
    borderStrong: '#C9C6BF',

    textPrimary: '#1A1916',
    textSecondary: '#6B6860',
    textMuted: '#9B9890',

    accent: '#5C6AC4',
    accentLight: '#EEF0FD',
    accentHover: '#4A56A6',

    success: '#2D9E6B',
    successLight: '#E6F7F1',

    warning: '#D97706',
    warningLight: '#FEF3C7',

    danger: '#DC2626',
    dangerLight: '#FEE2E2',

    highlight: '#F5A623',
    highlightLight: '#FFF8EC',
  },

  typography: {
    fontSans: "'Inter', 'system-ui', sans-serif",
    fontDisplay: "'Outfit', 'Inter', sans-serif",

    sizeXs: '0.75rem',
    sizeSm: '0.875rem',
    sizeBase: '1rem',
    sizeMd: '1.125rem',
    sizeLg: '1.25rem',
    sizeXl: '1.5rem',
    size2xl: '2rem',
    size3xl: '2.75rem',
    size4xl: '3.5rem',

    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,

    lineHeightTight: '1.2',
    lineHeightSnug: '1.4',
    lineHeightNormal: '1.6',
    lineHeightRelaxed: '1.75',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    lg: '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
    xl: '0 24px 64px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)',
    accent: '0 8px 24px rgba(92,106,196,0.25)',
  },

  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}

export default theme
