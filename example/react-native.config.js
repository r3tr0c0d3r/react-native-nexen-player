const path = require('path');

module.exports = {
    dependencies: {
      'react-native-nexen-player': {
        root: path.join(__dirname, '..'),
      },
    },
    project: {
      ios: {},
      android: {},
    },
    assets: ['./assets/fonts/'],
  };