/** @type {import('tailwindcss').Config} */
const pn = require('./constants/pn-palette.js');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'pn-navy': pn.navy,
        'pn-sky-top': pn.skyTop,
        'pn-sky-mid': pn.skyMid,
        'pn-sky-bottom': pn.skyBottom,
        'pn-sky-fade': pn.skyFade,
        'pn-slogan': pn.slogan,
        'pn-accent': pn.accent,
        'pn-slate': pn.slate,
        'pn-border': pn.border,
        'pn-white': pn.white,
        'pn-card': pn.card,
        'pn-card-cyan': pn.cardCyan,
        'pn-skyline': pn.skyline,
      },
    },
  },
  plugins: [],
};
