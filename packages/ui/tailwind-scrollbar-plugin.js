const plugin = require('tailwindcss/plugin')

const scrollbarPlugin = plugin(function({ addUtilities }) {
  const scrollbarUtilities = {
    '.scrollbar-none': {
      /* Hide scrollbar for Chrome, Safari and Opera */
      '&::-webkit-scrollbar': {
        width: '0px',
        height: '0px',
        display: 'none',
      },
      '&::-webkit-scrollbar-track': {
        display: 'none',
      },
      '&::-webkit-scrollbar-thumb': {
        display: 'none',
      },
      '&::-webkit-scrollbar-corner': {
        display: 'none',
      },
      /* Hide scrollbar for IE, Edge and Firefox */
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      'scrollbar-color': 'transparent transparent',
    },
    '.scrollbar-thin': {
      /* Firefox */
      'scrollbar-width': 'thin',
      'scrollbar-color': 'hsl(var(--muted-foreground) / 0.3) transparent',
      /* Webkit browsers */
      '&::-webkit-scrollbar': {
        width: '4px',
        height: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
        borderRadius: '2px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'hsl(var(--muted-foreground) / 0.3)',
        borderRadius: '2px',
        transition: 'background-color 0.2s ease',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'hsl(var(--muted-foreground) / 0.6)',
      },
      '&::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
    },
    '.scrollbar-default': {
      /* Firefox */
      'scrollbar-width': 'thin',
      'scrollbar-color': 'hsl(var(--border)) transparent',
      /* Webkit browsers */
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'hsl(var(--border))',
        borderRadius: '3px',
        transition: 'background-color 0.2s ease',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'hsl(var(--muted-foreground) / 0.5)',
      },
      '&::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
    },
  }

  addUtilities(scrollbarUtilities)
})

module.exports = scrollbarPlugin
