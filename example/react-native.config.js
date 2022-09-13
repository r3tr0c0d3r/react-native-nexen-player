const path = require('path');

module.exports = {
    dependencies: {
      'react-native-nexen-player': {
        root: path.join(__dirname, '..'),
      },
      'react-native-video': { 
        platforms: { android: { sourceDir: '../node_modules/react-native-video/android-exoplayer', }, }, 
    }, 
    },
    project: {
      ios: {},
      android: {},
    },
    assets: ['./assets/fonts/'],
  };