import React, { ReactElement } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  StatusBar,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Button from './Button';
import NexenPlayer, {
  LayoutMode,
  NexenPlayerRef,
  NexenConfig,
  NexenSource,
  PlayListItem,
  PlayList,
} from 'react-native-nexen-player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Orientation, { OrientationType } from 'react-native-orientation-locker';
import { useNavigation } from '@react-navigation/native';
import { IconSingle } from '../assets/icons';
import { getData } from './data';
const { width } = Dimensions.get('screen');

const SingleScreen = () => {
  const COLUMNS = 3;
  const ITEM_SIZE = width / 3;
  const navigation = useNavigation();
  const edgeinsets = useSafeAreaInsets();

  const playerRef = React.useRef<NexenPlayerRef>(null);

  const [source] = React.useState<NexenSource>({
    // source: {
    //   uri: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    // },
    source: require('../assets/videos/Street_Fighter_V_Stop_Motion.mp4'),

    poster: 'https://img.youtube.com/vi/KrmxD8didgQ/0.jpg',
    title: "Ryu's Hurricane Kick and Hadoken",
  });
  const [config, setConfig] = React.useState<NexenConfig>({
    posterResizeMode: 'cover',
    layoutMode: 'basic',
    autoPlay: true,
  });

  // const [paused, setPaused] = React.useState(true);
  const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
  const [playlist, setPlaylist] = React.useState<PlayList | undefined>();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: !isFullScreen });
  }, [navigation, isFullScreen]);

  const hideTabBar = () => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });
  };
  const showTabBar = () => {
    navigation.setOptions({
      tabBarStyle: { display: 'flex' },
    });
  };

  const updateLayoutMode = (mode: LayoutMode) => {
    setConfig((prevState) => {
      return {
        ...prevState,
        layoutMode: mode,
      };
    });
  };

  const onModePress = () => {
    if (config.layoutMode === 'basic') {
      updateLayoutMode('intermediate');
    } else if (config.layoutMode === 'intermediate') {
      updateLayoutMode('advanced');
    } else {
      updateLayoutMode('basic');
    }
  };

  const onFullScreenModeUpdate = async (fullScreen: boolean) => {
    console.log(`Player: onFullScreenModeUpdate:${fullScreen}`);
    if (fullScreen) {
      hideTabBar();
      // Orientation.lockToLandscape();
    } else {
      showTabBar();
      // Orientation.lockToPortrait();
    }
    setIsFullScreen(fullScreen);
  };

  const onBackPressed = () => {};

  const onPlay = () => {
    console.log(`Player: onPlay`);
    // setPaused(false);
  };

  const onPaused = () => {
    console.log(`Player: onPaused`);
    // setPaused(true);
  };

  const onSkipNext = (index: number) => {
    updateCurrentIndex(index);
  };

  const onSkipBack = (index: number) => {
    updateCurrentIndex(index);
  };

  const onPlaylistSet = () => {
    if (playlist) {
      setPlaylist(undefined);
    } else {
      setPlaylist({
        items: getData(),
        currentIndex: 4,
      });
    }
  };

  const updateCurrentIndex = (index: number) => {
    setPlaylist((prevState) => {
      return {
        ...prevState,
        currentIndex: index,
      };
    });
  };

  const renderItem = ({
    item,
    index,
  }: ListRenderItemInfo<PlayListItem>): ReactElement<any, any> => {
    const onItemPress = () => {
      console.log(
        `onItemPress: currentIndex: ${playlist?.currentIndex} index: ${index}`
      );
      if (index !== playlist?.currentIndex) {
        updateCurrentIndex(index);
      }
    };
    const posterUri = { uri: item.itemSource.poster };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.item, { width: ITEM_SIZE, height: ITEM_SIZE }]}
        onPress={onItemPress}
      >
        <Image
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
          }}
          source={posterUri}
        />
        {index !== playlist?.currentIndex && (
          <View style={styles.iconContainer}>
            <IconSingle size={50} color={'rgba(255,255,255,0.3)'} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const viewStyle: StyleProp<ViewStyle> = isFullScreen
    ? {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 9999,
      }
    : { position: 'relative' };

  return (
    <>
      <StatusBar
        hidden={isFullScreen}
        // translucent={isFullScreen}
        // backgroundColor={'rgba(0,0,0,0)'}
      />
      <View style={[styles.container, viewStyle]}>
        <View style={[viewStyle]}>
          <NexenPlayer
            ref={playerRef}
            style={styles.player}
            source={source}
            config={config}
            playList={playlist}
            insets={edgeinsets}
            theme={{
              // colors: {
              //   primaryIconColor: fullScreen ? 'white' : 'blue',
              // },
              fonts: {
                primaryFont: 'Montserrat-Medium',
                secondaryFont: 'Montserrat-Regular',
              },
            }}
            onPlay={onPlay}
            onPause={onPaused}
            onSkipNext={onSkipNext}
            onSkipBack={onSkipBack}
            onBackPress={onBackPressed}
            onFullScreenModeUpdate={onFullScreenModeUpdate}
          />
        </View>
        <FlatList
          keyExtractor={(index) => index.toString()}
          style={{ flex: 1 }}
          data={playlist?.items}
          renderItem={renderItem}
          numColumns={COLUMNS}
        />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            onPress={onModePress}
            title={`Mode: ${config.layoutMode}`}
          />

          <View style={{ width: 8 }} />
          <Button
            style={styles.button}
            onPress={onPlaylistSet}
            title={playlist ? 'Clear Playlist' : 'Set Playlist'}
          />
        </View>
      </View>
    </>
  );
};

export default SingleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  player: {
    width: '100%',
    height: 260,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 1,
  },
  button: {
    flex: 1,
  },
  item: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  icon: {
    position: 'absolute',
  },
});
