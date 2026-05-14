const appJson = require('./app.json');

module.exports = () => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  return {
    expo: {
      ...appJson.expo,
      ios: {
        ...appJson.expo.ios,
        config: {
          ...(appJson.expo.ios?.config ?? {}),
          googleMapsApiKey: apiKey,
        },
      },
      android: {
        ...appJson.expo.android,
        config: {
          ...(appJson.expo.android?.config ?? {}),
          googleMaps: {
            apiKey: apiKey,
          },
        },
      },
      plugins: [
        ...(appJson.expo.plugins ?? []),
        'expo-secure-store',
      ],
    },
  };
};
