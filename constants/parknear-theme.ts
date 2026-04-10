const pn = require('./pn-palette.js') as {
  navy: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  skyFade: string;
  slogan: string;
  accent: string;
  slate: string;
  border: string;
  white: string;
  card: string;
  cardCyan: string;
  skyline: string;
};

export const ParkNearColors = {
  navy: pn.navy,
  skyTop: pn.skyTop,
  skyMid: pn.skyMid,
  skyBottom: pn.skyBottom,
  skyFade: pn.skyFade,
  slogan: pn.slogan,
  lightAccent: pn.accent,
  buttonSlate: pn.slate,
  inputBorder: pn.border,
  inputBg: pn.white,
  cardWhite: pn.card,
  cardCyan: pn.cardCyan,
  skyline: pn.skyline,
  white: pn.white,
} as const;

export const ParkNearGradients = {
  background: [pn.skyTop, pn.skyMid, pn.skyBottom, pn.skyFade] as const,
};
