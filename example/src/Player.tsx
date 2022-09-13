import {
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import NexenPlayer, {
  LayoutMode,
  SelectedTextTrack,
  TextTrack,
  NexenPlayerRef,
  PlayerConfig,
  PlayerSource,
} from 'react-native-nexen-player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Orientation, { OrientationType } from 'react-native-orientation-locker';

import { data } from './data';
import Button from './Button';
import { TextTrackType } from 'react-native-video';

type Props = {};

const Player = (props: Props) => {
  // const [mode, setMode] = React.useState<LayoutMode>('basic');
  const [paused, setPaused] = React.useState(true);
  const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
  const [playlist, setPlaylist] = React.useState(false);

  const [source, setSource] = React.useState<PlayerSource>({
    source: {
      uri: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
    },
    // source: require('../assets/videos/Street_Fighter_V_Stop_Motion.mp4'),
    
    poster: 'https://img.youtube.com/vi/KrmxD8didgQ/0.jpg',
    title: 'Ryu\'s Hurricane Kick and Hadoken',
    
  });
  const [config, setConfig] = React.useState<PlayerConfig>({
    posterResizeMode: 'cover',
    layoutMode: 'basic',
});

  const playerRef = React.useRef<NexenPlayerRef>(null);

  const updateLayoutMode = (mode: LayoutMode) => {
    setConfig((prevState) => {
      return {
        ...prevState,
        layoutMode: mode,
      }
    });
  }

  const onModePress = () => {
    if (config.layoutMode === 'basic') {
      updateLayoutMode('intermediate')
    } else if (config.layoutMode === 'intermediate') {
      updateLayoutMode('advanced')
    } else {
      updateLayoutMode('basic')
    }
  };

  const onPausePress = () => {
    if (paused) {
      playerRef.current?.play();
    } else {
      playerRef?.current?.pause();
    }
    setPaused((prevState) => !prevState);
  };
  const onFullScreenModeUpdate = async (fullScreen: boolean) => {
    console.log(`Player: onFullScreenModeUpdate:${fullScreen}`);
    if (fullScreen) {
      // Orientation.lockToLandscape();
    } else {
      // Orientation.lockToPortrait();
    }
    setIsFullScreen(fullScreen);
  };

  const onBackPressed = () => {};

  const onPlay = () => {
    console.log(`Player: onPlay`);
    setPaused(false);
  };

  const onPaused = () => {
    console.log(`Player: onPlay`);
    setPaused(true);
  };

  const setSubtitle = () => {
    const cc: TextTrack[] = [
      {
        title: 'English CC',
        language: 'en',
        type: TextTrackType.VTT, // "text/vtt"
        uri: 'https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt',
      },
      {
        title: 'Spanish Subtitles',
        language: 'es',
        type: TextTrackType.SRT, // "application/x-subrip"
        uri: 'https://durian.blender.org/wp-content/content/subtitles/sintel_es.srt',
      },
    ];

    const scc: SelectedTextTrack = {
      type: 'title',
      value: 'English CC',
    };

    setSource((prevState) => {
      return {
        ...prevState,
        textTracks: cc,
        selectedTextTrack: scc,
      }
    });

    // setTextTracks(cc);
    // setSelectedTextTrack(scc);
  };

  const onChangeIndexPress = () => {
    // playerRef.current?.setPlaylistIndex(9);
  };
  const onReloadPress = () => {
    // playerRef.current?.reload();
    setSubtitle();
  };

  const onPlaylistSet = () => {
    if (playlist) {
      // playerRef.current?.setPlaylist([]);
      setSource((prevState) => {
        return {
          ...prevState,
          playlist: undefined,
        }
      });
    } else {
      // playerRef.current?.setPlaylist(data, 4);
      setSource((prevState) => {
        return {
          ...prevState,
          playlist: {
            items: data,
            activeIndex: 9,
          },
        }
      });
    }
    setPlaylist((prevState) => !prevState);
  };

  React.useEffect(() => {
    // playerRef.current?.setPlaylist(data, 4);
    // playerRef.current?.setActiveIndex(4);
  }, []);

  const edgeinsets = useSafeAreaInsets();
  console.log(`PlayerEdgeInsets: ${JSON.stringify(edgeinsets)}`);

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
      <StatusBar barStyle={'light-content'} hidden={isFullScreen} />
      <View style={[styles.container, viewStyle]}>
        <NexenPlayer
          ref={playerRef}
          style={styles.player}
          playerSource={source}
          playerConfig={config}
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
          onBackPress={onBackPressed}
          onFullScreenModeUpdate={onFullScreenModeUpdate}
        />

        <View style={styles.buttonContainer}>
          <Button onPress={onModePress} title={`Change Mode: ${config.layoutMode}`} />
          <View style={{ marginTop: 8 }} />
          <Button onPress={onPausePress} title={paused ? 'Play' : 'Pause'} />
          {/* <View style={{ marginTop: 8 }} />
        <Button onPress={onChangeIndexPress} title={'Change Index to 9'} /> */}
          <View style={{ marginTop: 8 }} />
          <Button onPress={onReloadPress} title={'Reload'} />
          <View style={{ marginTop: 8 }} />
          <Button
            onPress={onPlaylistSet}
            title={playlist ? 'Clear Playlist' : 'Set Playlist'}
          />
          {/* <View style={{ marginTop: 8 }} />
        <Button onPress={onPlaylistSetEmpty} title={'Set Empty Playlist'} /> */}
        </View>
      </View>
    </>
  );
};

export default Player;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // paddingVertical: 100,
    // justifyContent: 'center',
    // backgroundColor: '#bdd',
  },
  player: {
    width: '100%',
    height: 260,
    // marginVertical: 5,
  },
  buttonContainer: {
    width: 240,
    paddingVertical: 10,
    zIndex: 1,
  },
});
