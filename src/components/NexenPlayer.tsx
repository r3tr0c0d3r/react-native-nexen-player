import React from 'react';
import {
  Animated,
  AppState,
  BackHandler,
  Dimensions,
  I18nManager,
  LayoutChangeEvent,
  NativeModules,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  IconLock,
  IconPaly,
  IconPause,
  IconRepeat,
  IconUnlock,
  IconZap,
} from '../assets/icons';
import { NexenThemeProvider } from '../hooks/useNexenTheme';
import { getAspectRatioTipText, getTimeTipText } from '../utils/StringUtil';
import FooterControl, { FooterControlRef } from './FooterControl';
import GestureView, {
  GestureEventType,
  MAX_BRIGHTNESS,
  MAX_VOLUME,
  TapEventType,
} from './GestureView';
import TipView, { TipViewRef, TipViewTheme } from './TipView';
// import Orientation, { OrientationType } from 'react-native-orientation-locker';
import MoreControl, { MoreItem } from './MoreControl';
import {
  NexenTheme,
  DefaultTheme,
  DefaultSizesTheme,
  DefaultMiniSeekBarTheme,
  DefaultTagViewTheme,
} from '../utils/Theme';
import HeaderControl, { HeaderControlRef } from './HeaderControl';
import LineSeekBar, { LineSeekBarTheme } from './LineSeekBar';
import SpeedControl from './SpeedControl';
import TrackControl from './TrackControl';
import PlayButton from './PlayButton';
import Loader, { LoaderTheme } from './Loader';
import { getAlphaColor } from '../utils/ColorUtil';
import Video, {
  LoadError,
  OnBufferData,
  OnLoadData,
  OnPlaybackRateData,
  OnProgressData,
  OnSeekData,
  TextTrackType,
} from 'react-native-video';
import { getBrightnessIcon, getVolumeIcon } from '../utils/ComponentUtil';
import PlaylistControl from './PlaylistControl';
import { WrapperComponentRef } from '../hoc/withAnimation';
import PosterView from './PosterView';

const { NexenPlayerModule } = NativeModules;

const ANIMATION_DURATION = 300;
const USE_NATIVE_DRIVER = false;
const FORWARD_OR_REWIND_DURATION = 10;

export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
export type LayoutMode = 'basic' | 'intermediate' | 'advanced';
export type ControlHideMode = 'auto' | 'touch';
export type Dimension = { width: number; height: number };
export type ResizeMode = 'stretch' | 'contain' | 'cover' | undefined;
export type TextTrackType =
  | 'application/x-subrip'
  | 'application/ttml+xml'
  | 'text/vtt';
export type TextTrack = {
  // index: number;
  title?: string | undefined;
  language?: string | undefined;
  type: TextTrackType; //'application/x-subrip' | 'application/ttml+xml' | 'text/vtt';
  uri: string;
};
export type SelectedTextTrack = {
  type: 'system' | 'disabled' | 'title' | 'language' | 'index';
  value?: string | number | undefined;
};
export type AudioTrack = {
  index: number;
  title: string;
  language: string;
  type: string;
};
export type SelectedAudioTrack = {
  type: 'system' | 'disabled' | 'title' | 'language' | 'index';
  value?: string | number | undefined;
};
export type PlaybackSpeed =
  | '0.25'
  | '0.5'
  | '0.75'
  | '1.0'
  | '1.5'
  | '2.0'
  | '3.0';
export type Source =
  | {
      uri?: string | undefined;
      headers?: { [key: string]: string } | undefined;
      type?: string | undefined;
    }
  | number;
export type PlaylistItem = {
  author?: string;
  title?: string;
  source: Source;
  poster?: string;
  description?: string;
};

const RESIZE_MODES = ['BEST_FIT', 'FIT_TO_SCREEN', 'FILL_TO_SCREEN'];
const RESIZE_MODE_VALUES: ResizeMode[] = ['contain', 'cover', 'stretch'];

export type NexenPlayerRef = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipNext: () => void;
  skipBack: () => void;
  reload: () => void;
  // setLoop: (loop: boolean) => void;
  // setMuted: (mute: boolean) => void;
  // setVolume: (volume: number) => void;
  // setBrightness: (brightness: number) => void;
  // setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  // setPlaylist: (list?: PlaylistItem[], index?: number) => void;
  // setPlaylistIndex: (index: number) => void;
  setResizeMode: (mode: ResizeMode) => void;
  setFullScreenMode: (fullScreen: boolean) => void;
};

export type PlayerSource = {
  source: Source;
  title?: string;
  poster?: string | undefined;
  playlist?: {
    items: PlaylistItem[];
    activeIndex?: number;
  };
  textTracks?: TextTrack[];
  selectedTextTrack?: SelectedTextTrack;
  selectedAudioTrack?: SelectedAudioTrack;
};

export type PlayerConfig = {
  loaderText?: string;
  errorText?: string;
  doubleTapTime?: number;
  controlTimeout?: number;
  controlHideMode?: ControlHideMode;
  layoutMode?: LayoutMode;
  posterResizeMode?: ResizeMode;
  resizeMode?: ResizeMode;
  volume?: number;
  brightness?: number;
  playbackSpeed?: number;
  muted?: boolean;
  repeat?: boolean;
  autoPlay?: boolean;

  disableOnScreenPlayButton?: boolean;
  disableBack?: boolean;
  disableResizeMode?: boolean;
  disableVolume?: boolean;
  disableMore?: boolean;
  disableSkip?: boolean;
  disableStop?: boolean;
  disableFullscreen?: boolean;
  disablePlaylist?: boolean;
  disableSubtitle?: boolean;
};

type NexenPlayerProps = {
  playerSource: PlayerSource;
  playerConfig?: PlayerConfig;
  style?: StyleProp<ViewStyle>;
  theme?: NexenTheme;
  insets?: EdgeInsets;
  onBackPress?: () => void;
  onFullScreenModeUpdate?: (fullScreen: boolean) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onSkipNext?: (index: number) => void;
  onSkipBack?: (index: number) => void;
  onVolumeUpdate?: (volume: number) => void;
  onBrightnessUpdate?: (brightness: number) => void;
  onMuteUpdate?: (muted: boolean) => void;
  onRepeatUpdate?: (repeat: boolean) => void;
  onSpeedUpdate?: (speed: number) => void;
  onPlaylistItemSelect?: (index: number) => void;
  onScreenLockUpdate?: (locked: boolean) => void;
  onReload?: () => void;
};

const NexenPlayer = React.forwardRef<NexenPlayerRef, NexenPlayerProps>(
  (props, ref) => {
    let {
      playerSource: nexenPlayerSource,
      playerConfig: nexenPlayerConfig,
      style,
      insets,
      theme,
      onBackPress,
      onFullScreenModeUpdate,
      onPlay,
      onPause,
      onStop,
      onSkipNext,
      onSkipBack,
      onVolumeUpdate,
      onBrightnessUpdate,
      onMuteUpdate,
      onRepeatUpdate,
      onSpeedUpdate,
      onPlaylistItemSelect,
      onScreenLockUpdate,
      onReload,
    } = props;

    // console.log(`playerSource: ${JSON.stringify(playerSource)}`)

    const [dimension, setDimension] = React.useState({ width: 0, height: 0 });
    const [showControl, setShowControl] = React.useState(false);
    const [showSpeedControl, setShowSpeedControl] = React.useState(false);
    const [showTrackControl, setShowTrackControl] = React.useState(false);
    const [showPlaylistControl, setShowPlaylistControl] = React.useState(false);
    const [showMoreControl, setShowMoreControl] = React.useState(false);
    const [showPoster, setShowPoster] = React.useState(true);

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [locked, setLocked] = React.useState(false);
    const [disablePlaylistAndSkip, setDisablePlaylistAndSkip] =
      React.useState(false);

    const [playerSource, setPlayerSource] = React.useState<PlayerSource>(nexenPlayerSource);

    const [playerConfig, setPlayerConfig] = React.useState<
      PlayerConfig | undefined
    >({
      loaderText: 'Loading...',
      errorText: 'Error...!',
      doubleTapTime: 300,
      controlTimeout: 5000,
      controlHideMode: 'touch',
      layoutMode: 'intermediate',
      posterResizeMode: 'contain',
      resizeMode: 'contain',

      volume: 80,
      brightness: 25,
      playbackSpeed: 1,
      muted: false,
      repeat: false,
      autoPlay: false,
      // paused: true,
      // fullScreen: false,

      disableOnScreenPlayButton: false,
      disableBack: false,
      disableResizeMode: false,
      disableMore: false,
      disableSkip: false,
      disableStop: false,
      disableVolume: false,
      disableFullscreen: false,
      disablePlaylist: false,
      disableSubtitle: false,
      // ...nexenPlayerConfig,
    });

    const [fullScreen, setFullScreen] = React.useState(false);
    const [paused, setPaused] = React.useState(!playerConfig?.autoPlay);
    // const [muted, setMuted] = React.useState(false);
    // const [loop, setLoop] = React.useState(false);
    // const [speed, setSpeed] = React.useState(1);
    // const [volume, setVolume] = React.useState(80);
    // const [brightness, setBrightness] = React.useState(40);

    // const [resizeModeIndex, setResizeModeIndex] = React.useState(0);

    const [trackInfo, setTrackInfo] = React.useState({
      trackTime: 0,
      totalTrackTime: 0,
      cachedTrackTime: 0,
    });

    // const [videoList, setVideoList] = React.useState<PlaylistItem[] | undefined>([]);
    // const [videoIndex, setVideoIndex] = React.useState(0);

    const [playlistIndex, setPlaylistIndex] = React.useState(0);
    const [dropdownTextTracks, setDropdownTextTracks] = React.useState<
      any[] | undefined
    >();

    const [dropdownAudioTracks, setDropdownAudioTracks] = React.useState<
    any[] | undefined
  >();

    // const [textTracks, setTextTracks] = React.useState<
    //   TextTrack[] | undefined
    // >();
    // const [selectedTextTrack, setSelectedTextTrack] = React.useState<
    //   SelectedTextTrack | undefined
    // >();


    // const [audioTracks, setAudioTracks] = React.useState<
    //   AudioTrack[] | undefined
    // >();
    // const [selectedAudioTrack, setSelectedAudioTrack] = React.useState<
    //   SelectedAudioTrack | undefined
    // >();

    // React.useEffect(() => {
    //   setTextTracks(tt);
    //   setSelectedTextTrack(stt);
    //   setDropdownTextTracks(tt);
    // }, [tt, stt])
    // const [totalTrackTime, setTotalTrackTime] = React.useState(0);
    // const [cachedTrackTime, setCachedTrackTime] = React.useState(0);
    // const [trackTime, setTrackTime] = React.useState(0);
    const durationTime = React.useRef(0);
    const cachedTime = React.useRef(0);
    const currentTime = React.useRef(0);

    const isSeeking = React.useRef(false);
    const isSliding = React.useRef(false);
    const isSeekable = React.useRef(false);
    const gestureEnabled = React.useRef(false);
    const isStopped = React.useRef(false);
    const isVolumeSeekable = React.useRef(true);
    // const layoutOption = React.useRef(layoutMode);

    const appState = React.useRef(AppState.currentState);
    const isFullscreen = React.useRef(fullScreen);

    // const volume = React.useRef(playerVolume);
    // const brightness = React.useRef(playerBrightness);

    const moreControlRef = React.useRef<WrapperComponentRef>(null);
    const speedControlRef = React.useRef<WrapperComponentRef>(null);
    const playlistControlRef = React.useRef<WrapperComponentRef>(null);
    const trackControlRef = React.useRef<WrapperComponentRef>(null);

    const videoRef = React.useRef<Video>(null);
    const tipViewRef = React.useRef<TipViewRef>(null);
    const headerControlRef = React.useRef<HeaderControlRef>(null);
    const footerControlRef = React.useRef<FooterControlRef>(null);

    const headerOpacity = React.useRef(new Animated.Value(0)).current;
    const headerTopMargin = React.useRef(new Animated.Value(-60)).current;
    const footerOpacity = React.useRef(new Animated.Value(0)).current;
    const footerBottomMargin = React.useRef(new Animated.Value(-60)).current;

    // const speedOpacity = React.useRef(new Animated.Value(0)).current;
    // const speedBottomMargin = React.useRef(
    //   new Animated.Value(-dimension.height * 0.25)
    // ).current;

    // const trackOpacity = React.useRef(new Animated.Value(0)).current;
    // const trackBottomMargin = React.useRef(
    //   new Animated.Value(-dimension.height * 0.25)
    // ).current;

    // const moreOpacity = React.useRef(new Animated.Value(0)).current;
    // const moreRightMargin = React.useRef(
    //   new Animated.Value(-dimension.width * 0.45)
    // ).current;

    const controlTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);


    React.useImperativeHandle(ref, () => ({
      play: () => {
        setPaused(false);
      },
      pause: () => {
        setPaused(true);
      },
      stop: () => {
        handleStopPlayback();
      },
      skipNext: () => {
        _onSkipNext();
      },
      skipBack: () => {
        _onSkipBack();
      },
      reload: () => {
        handleReloadVideo();
      },
      // setLoop: (loop: boolean) => {
      //   handleRepeatVideo();
      // },
      // setMuted: (mute: boolean) => {
      //   handleMuteVideo(mute);
      // },
      // setVolume: (volume: number) => {
      //   tipViewRef.current?.updateState({
      //     showTip: true,
      //     tipText: `Volume : ${volume}%`,
      //     autoHide: true,
      //   });
      //   setVolume(volume);
      //   onVolumeUpdate?.(volume);
      // },
      // setBrightness: (brightness: number) => {
      //   tipViewRef.current?.updateState({
      //     showTip: true,
      //     tipText: `Brightness : ${brightness}%`,
      //     autoHide: true,
      //   });
      //   setBrightness(brightness);
      //   NexenPlayerModule.setBrightness(brightness / 100);
      //   onBrightnessUpdate?.(brightness);
      // },
      // setPlaybackSpeed: (speed: PlaybackSpeed) => {
      //   _onSpeedUpdate(speed);
      // },
      // setPlaylist: (list?: PlaylistItem[], index: number = 0) => {
      //   console.log(`setPlaylist: ${list?.length} paused:${paused}}`);
      //   setTrackInfo({
      //     trackTime: 0,
      //     totalTrackTime: 0,
      //     cachedTrackTime: 0,
      //   });
      //   if (list) {
      //     setVideoList(list);
      //     if (index >= 0 && index < list.length!) {
      //       setVideoIndex(index);
      //     } else {
      //       setVideoIndex(0);
      //     }
      //   }
      // },
      // setPlaylistIndex: (index: number) => {
      //   if (videoList) {
      //     if (index >= 0 && index < videoList.length) {
      //       setTrackInfo({
      //         trackTime: 0,
      //         totalTrackTime: 0,
      //         cachedTrackTime: 0,
      //       });
      //       setVideoIndex(index);
      //     }
      //   }
      // },
      setResizeMode: (mode: ResizeMode) => {
        // setResizeModeIndex(RESIZE_MODE_VALUES.indexOf(mode));
        handleResizeMode(mode);
      },
      setFullScreenMode: (fullScreen: boolean) => {
        setFullScreen(fullScreen);
        onFullScreenModeUpdate?.(fullScreen);
      },
    }));

    const nexenTheme = React.useMemo((): NexenTheme => {
      return {
        ...DefaultTheme,
        trackSeekBar: {
          ...DefaultTheme.trackSeekBar,
          ...theme?.trackSeekBar,
        },
        speedSeekBar: {
          ...DefaultTheme.speedSeekBar,
          ...theme?.speedSeekBar,
        },
        lineSeekBar: {
          ...DefaultTheme.lineSeekBar,
          ...theme?.lineSeekBar,
        },
        miniSeekBar: {
          ...DefaultMiniSeekBarTheme,
          ...theme?.miniSeekBar,
        },
        volumeSeekBar: {
          ...DefaultTheme.volumeSeekBar,
          ...theme?.volumeSeekBar,
        },
        brightnessSeekBar: {
          ...DefaultTheme.brightnessSeekBar,
          ...theme?.brightnessSeekBar,
        },
        lockButton: {
          ...DefaultTheme.lockButton,
          ...theme?.lockButton,
        },
        tagView: {
          ...DefaultTheme.tagView,
          ...theme?.tagView,
        },
        dropdownMenu: {
          ...DefaultTheme.dropdownMenu,
          ...theme?.dropdownMenu,
        },
        colors: {
          ...DefaultTheme.colors,
          ...theme?.colors,
        },
        sizes: {
          ...DefaultSizesTheme,
          ...theme?.sizes,
        },
        fonts: {
          ...theme?.fonts,
        },
      };
    }, [theme]);

    const ICON_SIZE_FACTOR = 0.8;
    const TAG_VIEW_ICON_SIZE = nexenTheme?.tagView?.iconSize!;
    const TAG_VIEW_ACTIVE_ICON_COLOR =
      nexenTheme?.tagView?.activeIconColor ||
      getAlphaColor(nexenTheme?.colors?.accentColor!, 0.7);
    const TAG_VIEW_INACTIVE_ICON_COLOR =
      nexenTheme?.tagView?.inactiveIconColor ||
      getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.5);

    const TIP_VIEW_ICON_SIZE = nexenTheme?.tipView?.iconSize;
    const TIP_VIEW_TEXT_SIZE = nexenTheme?.tipView?.textSize;
    const TIP_VIEW_ICON_COLOR =
      nexenTheme.tipView?.iconColor || nexenTheme.colors?.secondaryIconColor;
    const TIP_VIEW_TEXT_COLOR =
      nexenTheme?.tipView?.textColor || nexenTheme?.colors?.secondaryTextColor;

    const CONTAINER_BORDER_RADIUS = nexenTheme?.sizes?.modalCornerRadius;
    const CONTAINER_BACKGROUND_COLOR =
      nexenTheme?.colors?.modalBackgroundColor ||
      getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.7);

    const minValue = Math.min(
      Number(dimension.width),
      Number(dimension.height)
    );
    const MORE_CONTROL_CONTAINER_WIDTH = fullScreen
      ? minValue * 0.55 + insets?.right!
      : minValue * 0.7;
    const SPEED_CONTROL_CONTAINER_HEIGHT = fullScreen
      ? minValue * 0.2 + insets?.bottom!
      : minValue * 0.3;
    const PLAYLIST_CONTROL_CONTAINER_HEIGHT = fullScreen
      ? minValue * 0.3 + insets?.bottom!
      : minValue * 0.35;

    const TRACK_CONTROL_CONTAINER_HEIGHT = fullScreen
      ? minValue * 0.4 + insets?.bottom!
      : minValue * 0.45;

    const LINE_SEEK_BAR_HEIGHT = 2;

    const rtlMultiplier = React.useRef(1);
    const isRTL = I18nManager.isRTL;
    rtlMultiplier.current = isRTL ? -1 : 1;

    const tipViewTheme = React.useMemo((): TipViewTheme => {
      return {
        textColor: TIP_VIEW_TEXT_COLOR,
        textSize: TIP_VIEW_TEXT_SIZE,
        font: nexenTheme?.fonts?.secondaryFont,
      };
    }, [nexenTheme]);

    const loaderTheme = React.useMemo((): TipViewTheme => {
      return {
        iconSize: 40,
        iconColor: TIP_VIEW_ICON_COLOR,
        textColor: TIP_VIEW_TEXT_COLOR,
        textSize: 16,
        font: nexenTheme?.fonts?.secondaryFont,
      };
    }, [nexenTheme]);

    const lineSeekBarTheme = React.useMemo((): LineSeekBarTheme => {
      return {
        lineHeight: LINE_SEEK_BAR_HEIGHT,
        lineColor:
          nexenTheme?.lineSeekBar?.lineColor || nexenTheme?.colors?.accentColor,
        lineUnderlayColor:
          nexenTheme?.lineSeekBar?.lineUnderlayColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.3),
      };
    }, [nexenTheme]);

    const _onLayoutChange = async (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      const { width: w, height: h } = dimension;
      if (w !== width || h !== height) {
        setDimension({ width, height });
        console.log(`width: ${width} height: ${height}`);
      }
    };

    const _onTapDetected = React.useCallback(
      (event: TapEventType, value?: number) => {
        console.log(
          `handleScreenTapEvent : ${event} showControl: ${showControl}`
        );

        switch (event) {
          case TapEventType.SINGLE_TAP:
            if (showMoreControl) {
              hideMoreOptions();
              gestureEnabled.current = true;
              break;
            }
            if (showSpeedControl) {
              hidePlaybackSpeedControl();
              gestureEnabled.current = true;
              break;
            }
            if (showTrackControl) {
              hideSubtitleTrackControl();
              gestureEnabled.current = true;
              break;
            }
            if (showPlaylistControl) {
              hideVideoListControl();
              gestureEnabled.current = true;
              break;
            }
            if (showControl) {
              hideMainControl();
            } else {
              showMainControl();
            }
            break;
          case TapEventType.DOUBLE_TAP_LEFT:
          case TapEventType.DOUBLE_TAP_RIGHT:
            if (value) {
              videoRef.current?.seek(value);
              setTrackInfo((prevState) => {
                return {
                  ...prevState,
                  trackTime: value,
                };
              });
            }
            break;
          case TapEventType.DOUBLE_TAP_MIDDLE:
            handleDoubleTapPlayPause();
            break;
        }
      },
      [
        showControl,
        showSpeedControl,
        showTrackControl,
        showPlaylistControl,
        showMoreControl,
        paused,
      ]
    );

    const _onGestureMove = React.useCallback(
      (event: GestureEventType, value: number) => {
        switch (event) {
          case GestureEventType.TRACK:
            // console.log(`TRACK: ${value}`);
            videoRef.current?.seek(value);
            setTrackInfo((prevState) => {
              return {
                ...prevState,
                trackTime: value,
              };
            });
            break;
          case GestureEventType.VOLUME:
            headerControlRef.current?.updateIconTagView({
              volumeIcon: getVolumeIcon(
                value,
                MAX_VOLUME,
                TAG_VIEW_ICON_SIZE,
                TIP_VIEW_ICON_COLOR
              ),
            });
            videoRef.current?.setNativeProps({ volume: value / 100 });
            break;
          case GestureEventType.BRIGHTNESS:
            headerControlRef.current?.updateIconTagView({
              brightnessIcon: getBrightnessIcon(
                value,
                MAX_BRIGHTNESS,
                TAG_VIEW_ICON_SIZE,
                TIP_VIEW_ICON_COLOR
              ),
            });
            NexenPlayerModule.setBrightness(value / 100);
            break;
        }
      },
      []
    );

    const _onGestureEnd = React.useCallback(
      async (event: GestureEventType, value: number) => {
        switch (event) {
          case GestureEventType.TRACK:
            videoRef.current?.seek(value);
            setTrackInfo((prevState) => {
              return {
                ...prevState,
                trackTime: value,
              };
            });
            break;
          case GestureEventType.VOLUME:
            headerControlRef.current?.updateIconTagView({
              volumeIcon: getVolumeIcon(
                value,
                MAX_VOLUME,
                TAG_VIEW_ICON_SIZE,
                TIP_VIEW_ICON_COLOR
              ),
            });
            // setVolume(value);
            videoRef.current?.setNativeProps({ volume: value / 100 });
            setPlayerConfig((prevState) => {
              return {
                ...prevState,
                volume: value,
              };
            });
            onVolumeUpdate?.(value);
            break;
          case GestureEventType.BRIGHTNESS:
            headerControlRef.current?.updateIconTagView({
              brightnessIcon: getBrightnessIcon(
                value,
                MAX_BRIGHTNESS,
                TAG_VIEW_ICON_SIZE,
                TIP_VIEW_ICON_COLOR
              ),
            });
            NexenPlayerModule.setBrightness(value / 100);
            setPlayerConfig((prevState) => {
              return {
                ...prevState,
                brightness: value,
              };
            });
            onBrightnessUpdate?.(value);
            break;
        }
      },
      []
    );

    const showMainControl = () => {
      setShowControl(true);
    };

    const hideMainControl = () => {
      startControlHideAnimation(() => {
        setShowControl(false);
      });
    };

    const setControlTimeout = () => {
      controlTimeoutRef.current = setTimeout(() => {
        hideMainControl();
      }, playerConfig?.controlTimeout);
    };

    const clearControlTimeout = () => {
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current);
      }
    };

    const resetControlTimeout = () => {
      clearControlTimeout();
      setControlTimeout();
    };

    const showMoreOptions = () => {
      setShowMoreControl(true);
    };

    const hideMoreOptions = () => {
      moreControlRef.current?.hide(() => {
        setShowMoreControl(false);
      });
    };

    const showPlaybackSpeedControl = () => {
      setShowSpeedControl(true);
    };

    const hidePlaybackSpeedControl = () => {
      speedControlRef.current?.hide(() => {
        setShowSpeedControl(false);
      });
    };

    const showSubtitleTrackControl = () => {
      setShowTrackControl(true);
    };

    const hideSubtitleTrackControl = () => {
      trackControlRef.current?.hide(() => {
        setShowTrackControl(false);
      });
    };

    const showVideoListControl = () => {
      setShowPlaylistControl(true);
    };

    const hideVideoListControl = () => {
      playlistControlRef.current?.hide(() => {
        setShowPlaylistControl(false);
      });
    };

    const startControlShowAnimation = (
      callback?: Animated.EndCallback | undefined
    ) => {
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(headerTopMargin, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(footerBottomMargin, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(callback);
    };

    const startControlHideAnimation = (
      callback?: Animated.EndCallback | undefined
    ) => {
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(headerTopMargin, {
          toValue: -60,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(footerOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(footerBottomMargin, {
          toValue: -60,
          duration: ANIMATION_DURATION,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(callback);
    };

    React.useEffect(() => {
      if (paused) {
        onPause?.();
      } else {
        onPlay?.();
      }
    }, [paused])

    React.useEffect(() => {
      // console.log(
      //   `useEffect: showControls: ${showControl} volume: ${volume} brightness: ${brightness} layoutMode: ${layoutMode} loop:${loop} speed: ${speed}`
      // );
      // console.log(
      //   `useEffect: isSeekable: ${isSeekable.current} isSeeking: ${isSeeking.current} gestureEnabled: ${gestureEnabled.current}`
      // );
      isFullscreen.current = fullScreen;

      if (showControl) {
        startControlShowAnimation();
        if (playerConfig?.controlHideMode == 'auto') {
          setControlTimeout();
        }
      } else {
        // hideControlAnimation();
        if (playerConfig?.controlHideMode == 'auto') {
          clearControlTimeout();
        }
      }

      if (playerConfig?.layoutMode === 'intermediate') {
      }

      if (playerConfig?.layoutMode === 'advanced') {
        headerControlRef.current?.updateIconTagView({
          volumeIcon: getVolumeIcon(
            playerConfig?.volume!,
            MAX_VOLUME,
            TAG_VIEW_ICON_SIZE,
            TIP_VIEW_ICON_COLOR
          ),
          brightnessIcon: getBrightnessIcon(
            playerConfig?.brightness!,
            MAX_BRIGHTNESS,
            TAG_VIEW_ICON_SIZE,
            TIP_VIEW_ICON_COLOR
          ),
          repeatIcon: playerConfig?.repeat ? (
            <IconRepeat
              size={TAG_VIEW_ICON_SIZE}
              color={TAG_VIEW_ACTIVE_ICON_COLOR}
            />
          ) : (
            <IconRepeat
              size={TAG_VIEW_ICON_SIZE}
              color={TAG_VIEW_INACTIVE_ICON_COLOR}
            />
          ),
          speedIcon:
            playerConfig?.playbackSpeed !== 1.0 ? (
              <IconZap
                size={TAG_VIEW_ICON_SIZE}
                color={TAG_VIEW_ACTIVE_ICON_COLOR}
              />
            ) : (
              <IconZap
                size={TAG_VIEW_ICON_SIZE}
                color={TAG_VIEW_INACTIVE_ICON_COLOR}
              />
            ),
        });
      }
    }, [showControl, fullScreen, locked, playerConfig]);

    React.useEffect(() => {
      // console.log(`useEffect: showMoreOptions: ${showMoreOptions} showSpeedControl: ${showSpeedControl}`);
      if (showMoreControl) {
        moreControlRef.current?.show();
        return;
      }

      if (showSpeedControl) {
        speedControlRef.current?.show();
        return;
      }

      if (showTrackControl) {
        trackControlRef.current?.show();
        return;
      }
      if (showPlaylistControl) {
        playlistControlRef.current?.show();
        return;
      }
    }, [
      showMoreControl,
      showSpeedControl,
      showTrackControl,
      showPlaylistControl,
    ]);

    React.useEffect(() => {
      currentTime.current = trackInfo.trackTime;
      cachedTime.current = trackInfo.cachedTrackTime;
      durationTime.current = trackInfo.totalTrackTime;
      // console.log(`trackInfo:: ${JSON.stringify(trackInfo)}`);
    }, [trackInfo]);

    React.useEffect(() => {
      // console.log(`onAspectRatioChanged: ${resizeModeIndex}`);
      const currentIndex = RESIZE_MODE_VALUES.indexOf(playerConfig?.resizeMode);
      if (isSeekable.current) {
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: getAspectRatioTipText(RESIZE_MODES[currentIndex]),
          autoHide: true,
        });
      }
    }, [playerConfig?.resizeMode]);

    // React.useEffect(() => {
    //   if (poster) {
    //     setShowPoster(true);
    //   } else {
    //     setShowPoster(false);
    //   }
    // }, [poster]);

    React.useEffect(() => {
      const newConfig = {
        ...playerConfig,
        ...nexenPlayerConfig,
      };
      // console.log(`newConfig: ${JSON.stringify(newConfig)}`)
      NexenPlayerModule.setBrightness(newConfig.brightness! / 100);
      setPlayerConfig(newConfig);
    }, [nexenPlayerConfig]);

    React.useEffect(() => {
      const newSource = {
        ...playerSource,
        ...nexenPlayerSource,
      };
      console.log(`newSource: ${JSON.stringify(newSource.textTracks)}`);
      if (
        !newSource?.playlist ||
        !newSource?.playlist.items ||
        newSource?.playlist.items.length === 0
      ) {
        console.log(`EMPTY PLAYLIST`);
        setDisablePlaylistAndSkip(true);
      } else {
        setDisablePlaylistAndSkip(false);
      }
      // setVideoList(newSource?.playlist?.items || []);
      // setVideoIndex(newSource?.playlist?.activeIndex || 0);
      setPlaylistIndex(newSource?.playlist?.activeIndex || 0);
      // setTextTracks(newSource.textTracks);
      // setSelectedTextTrack(newSource.selectedTextTrack);
      // setSelectedAudioTrack(newSource.selectedAudioTrack);
      setPlayerSource(newSource);
    }, [nexenPlayerSource]);

    // React.useEffect(() => {
    //   if (!videoList
    //     || videoList.length === 0) {
    //       console.log(`EMPTY PLAYLIST`)
    //     setDisablePlaylistAndSkip(true);
    //   } else {
    //     setDisablePlaylistAndSkip(false);
    //   }
    // }, [videoList]);

    React.useEffect(() => {
      // console.log(`WW: ${ww} WH: ${wh}`);
      // Orientation.lockToPortrait();
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        _onBackPress
      );
      const subscription = AppState.addEventListener(
        'change',
        (nextAppState) => {
          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
          ) {
            // console.log(`App has come to the foreground! isFullscreen: ${isFullscreen.current}`);
            if (isFullscreen.current) {
              NexenPlayerModule.hideSystemBar();
            }
          }
          appState.current = nextAppState;
        }
      );
      return () => {
        backHandler.remove();
        subscription.remove();
        if (controlTimeoutRef.current) {
          clearTimeout(controlTimeoutRef.current);
        }
      };
    }, []);

    const _onBackPress = React.useCallback(() => {
      if (isFullscreen.current) {
        setFullScreen(false);
        NexenPlayerModule.showSystemBar();
        onFullScreenModeUpdate?.(false);
      } else {
        onBackPress?.();
      }
      return true;
    }, []);

    const _onAspectRatioPress = React.useCallback(() => {
      handleResizeMode(playerConfig?.resizeMode);
    }, [playerConfig?.resizeMode]);

    const _onMorePress = React.useCallback(() => {
      console.log(`onMorePress`);
      showMoreOptions();
      hideMainControl();
      gestureEnabled.current = false;
    }, []);

    const _onMoreItemPress = React.useCallback(
      (item: MoreItem) => {
        switch (item.id) {
          case 'lock':
            hideMoreOptions();
            handleLockScreen();
            isSeekable.current = false;
            gestureEnabled.current = false;
            break;
          case 'speed':
            hideMoreOptions();
            showPlaybackSpeedControl();
            gestureEnabled.current = false;
            break;
          case 'repeat':
            hideMoreOptions();
            handleRepeatVideo(!playerConfig?.repeat);
            gestureEnabled.current = true;
            break;
        }
      },
      [playerConfig]
    );

    const _onSpeedUpdate = React.useCallback((value: string) => {
      const newSpeed = Number(value);
      // console.log(`onSpeedChange: speed: ${speed} newSpeed: ${newSpeed}`);
      tipViewRef.current?.updateState({
        showTip: true,
        tipText: `${newSpeed}x Speed`,
        autoHide: true,
        withIcon: true,
        icon: <IconZap size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />,
      });
      // setSpeed(newSpeed);
      setPlayerConfig((prevState) => {
        return {
          ...prevState,
          playbackSpeed: newSpeed,
        };
      });
      onSpeedUpdate?.(newSpeed);
    }, []);

    const _onTextTrackSelect = React.useCallback(
      (selectedTextTrack: SelectedTextTrack) => {
        console.log(`_onTextTrackSelect: ${JSON.stringify(selectedTextTrack)}`);
        // setSelectedTextTrack(selectedTextTrack);
        setPlayerSource((prevState) => {
          return {
            ...prevState,
            selectedTextTrack,
          }
        });
      },
      []
    );

    const _onAudioTrackSelect = React.useCallback(
      (selectedAudioTrack: SelectedAudioTrack) => {
        console.log(
          `_onAudioTrackSelect: ${JSON.stringify(selectedAudioTrack)}`
        );
        // setSelectedAudioTrack(selectedAudioTrack);
        setPlayerSource((prevState) => {
          return {
            ...prevState,
            selectedAudioTrack,
          }
        });
      },
      []
    );

    const handleDoubleTapPlayPause = () => {
      if (paused) {
        setPaused(false);
        // onPlay?.();
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: 'Playing',
          autoHide: true,
          withIcon: true,
          icon: (
            <IconPaly size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />
          ),
        });
      } else {
        setPaused(true);
        // onPause?.();
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: 'Paused',
          autoHide: true,
          withIcon: true,
          icon: (
            <IconPause size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />
          ),
        });
      }
    };

    /* FooterControl Callback */
    const _onPlayPress = () => {
      console.log(`onPlayPress`);
      setPaused(false);
      // onPlay?.();
    };

    const _onCcPress = () => {
      console.log(`onCcPress`);
      hideMainControl();
      showSubtitleTrackControl();
      gestureEnabled.current = false;
    };

    const _onStopPress = () => {
      console.log(`onStopPress`);
      // isStopped.current = false;
      handleStopPlayback();
    };

    const handleStopPlayback = () => {
      isStopped.current = true;
      videoRef.current?.seek(0, 0);
      setPaused(true);
      onStop?.();
    };

    const handleRepeatVideo = (repeat: boolean) => {
      tipViewRef.current?.updateState({
        showTip: true,
        tipText: repeat ? 'Repeat On' : 'Repeat Off',
        autoHide: true,
        withIcon: true,
        icon: (
          <IconRepeat size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />
        ),
      });
      onRepeatUpdate?.(repeat);
      setPlayerConfig((prevState) => {
        return {
          ...prevState,
          repeat: repeat,
        };
      });
    };

    const handleResizeMode = (resizeMode: ResizeMode) => {
      const currentIndex = RESIZE_MODE_VALUES.indexOf(resizeMode);
      if (currentIndex < RESIZE_MODE_VALUES.length - 1) {
        setPlayerConfig((prevState) => {
          return {
            ...prevState,
            resizeMode: RESIZE_MODE_VALUES[currentIndex + 1],
          };
        });

      } else {
        setPlayerConfig((prevState) => {
          return {
            ...prevState,
            resizeMode: RESIZE_MODE_VALUES[0],
          };
        });
      }
    };

    const handleReloadVideo = () => {
      console.log(`handleReloadVideo!!: ${paused}`);
      setTrackInfo({
        trackTime: 0,
        totalTrackTime: 0,
        cachedTrackTime: 0,
      });
      // videoRef.current?.unloadAsync().then(() => {

      //   videoRef.current
      //     ?.loadAsync(
      //       videoList
      //       ? videoList.length !== 0
      //       ? { uri: videoList[videoIndex].source }
      //       : source
      //       : source,
      //       {shouldPlay: !paused}
      //     )
      //     .then(() => {
      //       onReload?.();
      //       console.log(`reloaded!!: ${paused}`);
      //     });
      // });
    };

    const handleLockScreen = () => {
      tipViewRef.current?.updateState({
        showTip: true,
        tipText: 'Locked',
        autoHide: true,
        withIcon: true,
        icon: (
          <IconLock size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />
        ),
      });
      setLocked(true);
      onScreenLockUpdate?.(true);
    };

    const handleTextTracks = (textTracks?: any[]) => {
      const selectedTrack = textTracks?.find((x: any) => {
        return x.selected;
      });

      setDropdownTextTracks(textTracks);
      if (selectedTrack?.language) {
        setPlayerSource((prevState) => {
          return {
            ...prevState,
            selectedTextTrack: {
                type: 'language',
                value: selectedTrack?.language,
            }
          }
        });
      }
    };

    const handleAudioTracks = (audioTracks: any[]) => {
      const selectedTrack = audioTracks?.find((x: any) => {
        return x.selected;
      });
      setDropdownAudioTracks(audioTracks);
      if (selectedTrack?.language) {
        setPlayerSource((prevState) => {
          return {
            ...prevState,
            selectedAudioTrack: {
                type: 'language',
                value: selectedTrack?.language,
            }
          }
        });
      }
    };

    const _onRewind = () => {
      const time = trackInfo.trackTime - FORWARD_OR_REWIND_DURATION;
      videoRef.current?.seek(time);
      setTrackInfo((prevState) => {
        return {
          ...prevState,
          trackTime: time,
        };
      });
    };

    const _onFastForward = () => {
      const time = trackInfo.trackTime + FORWARD_OR_REWIND_DURATION;
      videoRef.current?.seek(time);
      setTrackInfo((prevState) => {
        return {
          ...prevState,
          trackTime: time,
        };
      });
    };

    const _onSkipNext = () => {
      if (playerSource.playlist) {
        if (playlistIndex < playerSource.playlist.items.length - 1) {
          const index = playlistIndex + 1;
          setPlaylistIndex(index);
          setPaused(!playerConfig?.autoPlay!);
          onSkipNext?.(index);
        }
      }
    };

    const _onSkipBack = () => {
      if (playerSource.playlist) {
        if (playlistIndex > 0) {
          const index = playlistIndex - 1;
          setPlaylistIndex(index);
          setPaused(!playerConfig?.autoPlay!);
          onSkipBack?.(index);
        }
      }
    };
    const _onVideoListPress = () => {
      hideMainControl();
      showVideoListControl();
      gestureEnabled.current = false;
    };

    const _onPlaylistItemPress = (index: number) => {
      setPlaylistIndex(index);
      setPaused(!playerConfig?.autoPlay!);
      onPlaylistItemSelect?.(index);
    };

    const _onTogglePlayPause = () => {
      setPaused((prevState) => !prevState);
    };

    const _onToggleFullScreen = () => {
      if (fullScreen) {
        NexenPlayerModule.showSystemBar();
      } else {
        NexenPlayerModule.hideSystemBar();
      }
      onFullScreenModeUpdate?.(!fullScreen);
      setFullScreen((prevState) => !prevState);
    };

    const _onToggleVolume = () => {
      handleMuteVideo(!playerConfig?.muted);
    };

    const handleMuteVideo = (mute: boolean) => {
      tipViewRef.current?.updateState({
        showTip: true,
        tipText: mute ? 'Sound Off' : 'Sound On',
        autoHide: true,
      });
      isVolumeSeekable.current = !mute;
      onMuteUpdate?.(mute);
      setPlayerConfig((prevState) => {
        return {
          ...prevState,
          muted: mute,
        };
      });
    };

    /* Slide Button Callback */
    const _onSlideStart = React.useCallback(() => {
      isSliding.current = true;
    }, []);

    const _onSlideEnd = React.useCallback(() => {
      isSliding.current = false;
    }, []);

    const _onReachedToStart = React.useCallback(() => {
    }, []);

    const _onReachedToEnd = React.useCallback(() => {
      setLocked(false);
      isSeekable.current = true;
      gestureEnabled.current = true;
      tipViewRef.current?.updateState({
        showTip: true,
        tipText: 'Unlocked',
        autoHide: true,
        withIcon: true,
        icon: (
          <IconUnlock size={TIP_VIEW_ICON_SIZE} color={TIP_VIEW_ICON_COLOR} />
        ),
      });
    }, []);

    /* SeekBar Callback */
    const _onSeekStart = React.useCallback(
      (value: number, totalValue: number) => {
        isSeeking.current = true;
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: getTimeTipText(value, totalValue),
          autoHide: false,
        });
      },
      []
    );

    const _onSeekUpdate = React.useCallback(
      (value: number, totalValue: number) => {
        if (isSeeking.current) {
          tipViewRef.current?.updateState({
            tipText: getTimeTipText(value, totalValue),
          });
        }
      },
      []
    );

    const _onSeekEnd = React.useCallback((value: number) => {
      isSeeking.current = false;
      videoRef.current?.seek(value);
      setTrackInfo((prevState) => {
        return { ...prevState, trackTime: value };
      });

      tipViewRef.current?.updateState({ showTip: false, autoHide: true });
    }, []);

    /* Volume SeekBar Callback */
    const _onVolumeSeekStart = React.useCallback(
      (value: number, totalValue: number) => {
        videoRef.current?.setNativeProps({ volume: value / 100 });
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: `Volume : ${value}%`,
          autoHide: false,
        });
        onVolumeUpdate?.(value);
      },
      []
    );

    const _onVolumeSeekUpdate = React.useCallback(
      (value: number, totalValue: number) => {
        videoRef.current?.setNativeProps({ volume: value / 100 });
        tipViewRef.current?.updateState({
          showTip: true,
          tipText: `Volume : ${value}%`,
          autoHide: false,
        });
        onVolumeUpdate?.(value);
      },
      []
    );

    const _onVolumeSeekEnd = React.useCallback((value: number) => {
      setPlayerConfig((prevState) => {
        return {
          ...prevState,
          volume: value,
        };
      });
      videoRef.current?.setNativeProps({ volume: value / 100 });
      tipViewRef.current?.updateState({ showTip: false, autoHide: true });
      onVolumeUpdate?.(value);
    }, []);

    /* VLCPlayer Callback */
    const _onLoadStart = React.useCallback(() => {
      setLoading(true);
      setShowPoster(true);
    }, []);
    const _onLoad = React.useCallback((data: OnLoadData) => {
      // console.log(`onLoad!!: ${JSON.stringify(data)}`);

      setLoading(false);
      setError(false);
      setTrackInfo((prevState) => {
        return {
          ...prevState,
          trackTime: data.currentTime,
          totalTrackTime: data.duration,
        };
      });
      handleTextTracks(data.textTracks);
      handleAudioTracks(data.audioTracks);
      isSeekable.current = true;
      gestureEnabled.current = true;
      isStopped.current = false;
    }, []);

    const _onReadyForDisplay = React.useCallback(() => {
      console.log(`onReadyForDisplay!!: called`);
      // if (showPoster) {
      //   setShowPoster(false);
      // }
    }, []);

    const _onPlaybackRateChange = React.useCallback(
      (data: OnPlaybackRateData) => {
        // console.log(`onPlaybackRateChange!!: called`);
      },
      []
    );

    const _onPlaybackResume = React.useCallback(() => {
      console.log(`onPlaybackResume!!`);
    }, []);

    const _onPlaybackStalled = React.useCallback(() => {
      console.log(`onPlaybackStalled!!`);
    }, []);

    const _onTimedMetadata = React.useCallback((meta: any[]) => {
      console.log(`onTimedMetadata!!: ${JSON.stringify(meta)}`);
    }, []);

    const _onBuffer = React.useCallback((data: OnBufferData) => {
      console.log(`onBuffer: ${JSON.stringify(data)}`);
      // const { length, time, buffer } = e;
      // if (buffer == 0 && length >= 0 && time >= 0) {
      //   setLoading(true);
      // }
      // if (buffer == 100 && length > 0 && time >= 0) {
      //   setLoading(false);
      // }
    }, []);

    const _onProgress = React.useCallback(
      (data: OnProgressData) => {
        if (showPoster) {
          setShowPoster(false);
        }
        if (!isSeeking.current) {
          setTrackInfo({
            trackTime: data.currentTime,
            cachedTrackTime: data.playableDuration,
            totalTrackTime: data.seekableDuration,
          });
        }
      },
      [showPoster]
    );

    const _onSeek = React.useCallback((data: OnSeekData) => {
      if (isStopped.current && data.seekTime == 0 && data.currentTime == 0) {
        setTrackInfo((prevState) => {
          return {
            ...prevState,
            trackTime: 0,
            cachedTrackTime: 0,
          };
        });
      }
    }, []);

    const _onEnd = React.useCallback(() => {
      handleStopPlayback();
    }, []);

    const _onError = React.useCallback((error: LoadError) => {
      setError(true);
    }, []);

    const newStyle: StyleProp<ViewStyle> = fullScreen
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
      <View
        style={[styles.playerContainer, style, newStyle]}
        onLayout={_onLayoutChange}
      >
        <Video
          ref={videoRef}
          style={styles.player}
          source={
            playerSource.playlist?.items
              ? playerSource.playlist?.items.length !== 0
                ? playerSource.playlist?.items[playlistIndex].source
                : playerSource.source
              : playerSource.source
          }
          textTracks={playerSource.textTracks}
          selectedTextTrack={playerSource.selectedTextTrack}
          selectedAudioTrack={playerSource.selectedAudioTrack}
          paused={paused}
          resizeMode={playerConfig?.resizeMode}
          muted={playerConfig?.muted}
          volume={playerConfig?.volume! / 100}
          repeat={playerConfig?.repeat}
          rate={playerConfig?.playbackSpeed}
          onLoadStart={_onLoadStart}
          onLoad={_onLoad}
          onBuffer={_onBuffer}
          onProgress={_onProgress}
          onSeek={_onSeek}
          onEnd={_onEnd}
          onError={_onError}
          onReadyForDisplay={_onReadyForDisplay}
          // onPlaybackRateChange={_onPlaybackRateChange}
          // onPlaybackResume={_onPlaybackResume}
          // onPlaybackStalled={_onPlaybackStalled}
        />

        {showPoster && !error && (
          <PosterView
            posterSource={
              playerSource.playlist?.items
                ? playerSource.playlist?.items.length !== 0
                  ? playerSource.playlist?.items[playlistIndex].poster
                  : playerSource.poster
                : playerSource.poster
            }
            posterResizeMode={playerConfig?.posterResizeMode}
          />
        )}
        <GestureView
          fullScreen={fullScreen}
          locked={locked}
          error={error}
          isSeeking={isSeeking}
          isSliding={isSliding}
          isSeekable={isSeekable}
          gestureEnabled={gestureEnabled}
          durationTime={durationTime}
          currentTime={currentTime}
          dimension={dimension}
          volume={playerConfig?.volume!}
          brightness={playerConfig?.brightness!}
          playerConfig={playerConfig}
          nexenTheme={nexenTheme}
          onTapDetected={_onTapDetected}
          onGestureMove={_onGestureMove}
          onGestureEnd={_onGestureEnd}
        />

        <>
          {/* top control bar */}
          {showControl && (
            <HeaderControl
              ref={headerControlRef}
              title={
                playerSource.playlist?.items
                  ? playerSource.playlist?.items.length !== 0
                    ? playerSource.playlist?.items[playlistIndex].title
                    : playerSource.title
                  : playerSource.title
              }
              opacity={headerOpacity}
              marginTop={headerTopMargin}
              fullScreen={fullScreen}
              locked={locked}
              insets={insets}
              playerConfig={playerConfig}
              nexenTheme={nexenTheme}
              onBackPress={_onBackPress}
              onAspectRatioPress={_onAspectRatioPress}
              onMorePress={_onMorePress}
            />
          )}

          {/* bottom control bar */}
          {showControl && (
            <FooterControl
              ref={footerControlRef}
              opacity={footerOpacity}
              marginBottom={footerBottomMargin}
              fullScreen={fullScreen}
              muted={playerConfig?.muted!}
              locked={locked}
              insets={insets}
              playerConfig={playerConfig}
              nexenTheme={nexenTheme}
              paused={paused!}
              isSeekable={isSeekable}
              isVolumeSeekable={isVolumeSeekable}
              trackTime={trackInfo.trackTime}
              cachedTrackTime={trackInfo.cachedTrackTime}
              totalTrackTime={trackInfo.totalTrackTime}
              volume={playerConfig?.volume!}
              totalVolume={MAX_VOLUME}
              disablePlaylistAndSkip={disablePlaylistAndSkip}
              onStopPress={_onStopPress}
              onPlayPress={_onTogglePlayPause}
              onFullScreenPress={_onToggleFullScreen}
              onVolumePress={_onToggleVolume}
              onCcPress={_onCcPress}
              onVideoListPress={_onVideoListPress}
              onAspectRatioPress={_onAspectRatioPress}
              onRewind={_onRewind}
              onFastForward={_onFastForward}
              onSeekStart={_onSeekStart}
              onSkipNext={_onSkipNext}
              onSkipBack={_onSkipBack}
              onSeekUpdate={_onSeekUpdate}
              onSeekEnd={_onSeekEnd}
              onVolumeSeekStart={_onVolumeSeekStart}
              onVolumeSeekUpdate={_onVolumeSeekUpdate}
              onVolumeSeekEnd={_onVolumeSeekEnd}
              onSlideStart={_onSlideStart}
              onSlideEnd={_onSlideEnd}
              onReachedToStart={_onReachedToStart}
              onReachedToEnd={_onReachedToEnd}
            />
          )}
          {/* bottom line bar */}
          {!showControl &&
            !showMoreControl &&
            !showSpeedControl &&
            !showTrackControl && (
              <LineSeekBar
                trackTime={trackInfo.trackTime}
                totalTrackTime={trackInfo.totalTrackTime}
                layoutWidth={dimension.width}
                theme={lineSeekBarTheme}
              />
            )}

          {showMoreControl && (
            <MoreControl
              ref={moreControlRef}
              animateFrom={'RIGHT'}
              distance={MORE_CONTROL_CONTAINER_WIDTH}
              style={{
                width: MORE_CONTROL_CONTAINER_WIDTH,
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
                borderBottomLeftRadius: CONTAINER_BORDER_RADIUS,
              }}
              fullScreen={fullScreen}
              insets={insets}
              nexenTheme={nexenTheme}
              onItemPress={_onMoreItemPress}
            />
          )}

          {showSpeedControl && (
            <SpeedControl
              ref={speedControlRef}
              animateFrom={'BOTTOM'}
              distance={SPEED_CONTROL_CONTAINER_HEIGHT}
              style={{
                height: SPEED_CONTROL_CONTAINER_HEIGHT,
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
                borderTopRightRadius: CONTAINER_BORDER_RADIUS,
              }}
              fullScreen={fullScreen}
              insets={insets}
              currentSpeed={playerConfig?.playbackSpeed!}
              nexenTheme={nexenTheme}
              onSpeedChange={_onSpeedUpdate}
            />
          )}

          {showTrackControl && (
            <TrackControl
              ref={trackControlRef}
              animateFrom={'BOTTOM'}
              distance={TRACK_CONTROL_CONTAINER_HEIGHT}
              style={{
                height: TRACK_CONTROL_CONTAINER_HEIGHT,
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
                borderTopRightRadius: CONTAINER_BORDER_RADIUS,
              }}
              textTracks={dropdownTextTracks}
              selectedTextTrack={playerSource.selectedTextTrack}
              onTextTrackSelect={_onTextTrackSelect}
              audioTracks={dropdownAudioTracks}
              selectedAudioTrack={playerSource.selectedAudioTrack}
              onAudioTrackSelect={_onAudioTrackSelect}
              fullScreen={fullScreen}
              insets={insets}
              nexenTheme={nexenTheme}
            />
          )}

          {showPlaylistControl && (
            <PlaylistControl
              ref={playlistControlRef}
              animateFrom={'BOTTOM'}
              distance={PLAYLIST_CONTROL_CONTAINER_HEIGHT}
              style={{
                height: PLAYLIST_CONTROL_CONTAINER_HEIGHT,
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderTopLeftRadius: CONTAINER_BORDER_RADIUS,
                borderTopRightRadius: CONTAINER_BORDER_RADIUS,
              }}
              playlist={playerSource.playlist?.items}
              playlistIndex={playlistIndex}
              fullScreen={fullScreen}
              nexenTheme={nexenTheme}
              onPlaylistItemPress={_onPlaylistItemPress}
            />
          )}

          {!showControl &&
            !showMoreControl &&
            !showSpeedControl &&
            !showTrackControl &&
            !showPlaylistControl &&
            !locked &&
            !error &&
            paused &&
            !playerConfig?.disableOnScreenPlayButton && (
              <PlayButton dimension={dimension} onPlayPress={_onPlayPress} />
            )}

          {/* Loader */}
          {!error && loading && (
            <Loader
              style={{
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderRadius: CONTAINER_BORDER_RADIUS,
              }}
              theme={loaderTheme}
              loaderText={playerConfig?.loaderText}
            />
          )}

          {playerConfig?.layoutMode !== 'basic' && (
            <TipView
              ref={tipViewRef}
              style={{
                backgroundColor: CONTAINER_BACKGROUND_COLOR,
                borderRadius: CONTAINER_BORDER_RADIUS,
              }}
              theme={tipViewTheme}
            />
          )}
        </>
      </View>
    );
  }
);

export default NexenPlayer;

NexenPlayer.defaultProps = {
  insets: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
};

const styles = StyleSheet.create({
  playerContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  player: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
  },
});
