import React, { useImperativeHandle } from 'react';
import {
  Animated,
  I18nManager,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {
  IconSubtitle,
  IconMaximize,
  IconMinimize,
  IconPaly,
  IconPause,
  IconStop,
  IconVolume,
  IconVolume2,
  IconSun1,
  IconRepeat1,
  IconZap,
  IconSkipBack,
  IconSkipForward,
  IconPlayCircle,
  IconPauseCircle,
  IconFilm,
  IconAspectRatio,
} from '../assets/icons';
import IconButton from './IconButton';
import { formatTime } from '../utils/StringUtil';
import SeekBar, { SeekBarTheme } from './SeekBar';
import SlideButton, { SlideButtonTheme } from './SlideButton';
import GradientView from './GradientView';
import IconTagView, {
  IconTagViewRef,
  IconTagViewState,
  IconTagViewTheme,
} from './IconTagView';
import { getAlphaColor } from '../utils/ColorUtil';
import TimeTagView, { TimeTagViewTheme } from './TimeTagView';
import VolumeTagView, { VolumeTagViewTheme } from './VolumeTagView';
import type { NexenTheme } from '../utils/Theme';
import type { EdgeInsets, LayoutMode, NexenConfig } from './NexenPlayer';

type FooterControlProps = {
  opacity: Animated.Value;
  marginBottom: Animated.Value;
  paused: boolean;
  isSeekable?: React.MutableRefObject<boolean>;
  isVolumeSeekable?: React.MutableRefObject<boolean>;
  fullScreen?: boolean;
  muted: boolean;
  locked: boolean;
  trackTime: number;
  cachedTrackTime: number;
  totalTrackTime: number;
  volume: number;
  totalVolume: number;
  insets?: EdgeInsets;
  playerConfig?: NexenConfig;
  nexenTheme?: NexenTheme;
  // layoutMode?: LayoutMode;
  // disableSkip?: boolean;
  // disableStop?: boolean;
  // disableRatio?: boolean;
  // disableVolume?: boolean;
  // disableSubtitle?: boolean;
  // disableFullscreen?: boolean;
  // disablePlaylist?: boolean;
  disablePlaylistAndSkip?: boolean;
  onPlayPress?: () => void;
  onFullScreenPress?: () => void;
  onVolumePress?: () => void;
  onStopPress?: () => void;
  onCcPress?: () => void;
  onVideoListPress?: () => void;
  onFastForward?: () => void;
  onRewind?: () => void;
  onSkipNext?: () => void;
  onSkipBack?: () => void;
  onSeekStart?: (value: number, totalValue: number, position: number) => void;
  onSeekUpdate?: (value: number, totalValue: number, position: number) => void;
  onSeekEnd?: (value: number, totalValue: number, position: number) => void;
  onVolumeSeekStart?: (
    value: number,
    totalValue: number,
    position: number
  ) => void;
  onVolumeSeekUpdate?: (
    value: number,
    totalValue: number,
    position: number
  ) => void;
  onVolumeSeekEnd?: (
    value: number,
    totalValue: number,
    position: number
  ) => void;
  onSlideStart?: () => void;
  onSlideEnd?: () => void;
  onReachedToStart?: () => void;
  onReachedToEnd?: () => void;
  onAspectRatioPress?: () => void;
};

export type FooterControlRef = {
  updateIconTagView: (newState: IconTagViewState) => void;
};

const FooterControl = React.forwardRef<FooterControlRef, FooterControlProps>(
  (props, ref) => {
    const {
      opacity,
      marginBottom,
      paused,
      fullScreen,
      muted,
      locked,
      insets,
      playerConfig,
      nexenTheme,
      // layoutMode,
      
      trackTime,
      cachedTrackTime,
      totalTrackTime,
      volume,
      totalVolume,
      isSeekable,
      isVolumeSeekable,
      // disableStop,
      // disableVolume,
      // disableSkip,
      // disableRatio,
      // disableSubtitle,
      // disableFullscreen,
      // disablePlaylist,
      // disableLargeMode,
      disablePlaylistAndSkip,
      onPlayPress,
      onCcPress,
      onVideoListPress,
      onFullScreenPress,
      onVolumePress,
      onStopPress,
      onSeekStart,
      onSeekUpdate,
      onSeekEnd,
      onVolumeSeekStart,
      onVolumeSeekUpdate,
      onVolumeSeekEnd,
      onSlideStart,
      onSlideEnd,
      onReachedToStart,
      onReachedToEnd,
      onFastForward,
      onRewind,
      onSkipNext,
      onSkipBack,
      onAspectRatioPress,
      // progress,
      // duration,
    } = props;
    // console.log(`FooterControl:: renders : isSeekable: ${isSeekable?.current}`);
    const isRTL = I18nManager.isRTL;
    const iconTagViewRef = React.useRef<IconTagViewRef>(null);

    const ICON_SIZE_FACTOR = playerConfig?.layoutMode === 'advanced' ? 1.8 : 1;
    const ICON_SIZE = nexenTheme?.sizes?.primaryIconSize;
    const ICON_COLOR = nexenTheme?.colors?.primaryIconColor;
    const CONTAINER_VERTICAL_PADDING = fullScreen 
    ? insets?.bottom! > 0 
    ? insets?.bottom!
    : nexenTheme?.sizes?.paddingVertical
    : nexenTheme?.sizes?.paddingVertical;
    const CONTAINER_HORIZONTAL_PADDING = fullScreen 
    ? (insets?.left! + insets?.right!) / 2 > 0
    ? (insets?.left! + insets?.right!) / 2
    : nexenTheme?.sizes?.paddingHorizontal
    : nexenTheme?.sizes?.paddingHorizontal;
    const TAG_VIEW_HEIGHT = playerConfig?.layoutMode === 'advanced' 
    ? nexenTheme?.tagView?.height! 
    : nexenTheme?.tagView?.height! + 8;

    const CONTAINER_HEIGHT = locked
      ? ICON_SIZE! * ICON_SIZE_FACTOR +
        10 * 2 +
        TAG_VIEW_HEIGHT! +
        CONTAINER_VERTICAL_PADDING! +
        8
      : ICON_SIZE! * ICON_SIZE_FACTOR +
        10 * 2 +
        TAG_VIEW_HEIGHT! +
        CONTAINER_VERTICAL_PADDING!;

    // console.log(`FOOTER: HP: ${CONTAINER_HORIZONTAL_PADDING} VP: ${CONTAINER_VERTICAL_PADDING}`);
    // console.log(`FOOTER: CONTAINER_HEIGHT: ${CONTAINER_HEIGHT} VP: ${CONTAINER_VERTICAL_PADDING}`);
    useImperativeHandle(ref, () => ({
      updateIconTagView: (newState: IconTagViewState) => {
        iconTagViewRef.current?.updateState(newState);
      },
    }));

    const seekBarTheme = React.useMemo((): SeekBarTheme => {

      return {
        trackColor:
          nexenTheme?.trackSeekBar?.trackColor ||
          nexenTheme?.colors?.accentColor,
        cachedTrackColor:
          nexenTheme?.trackSeekBar?.cachedTrackColor ||
          nexenTheme?.colors?.secondaryColor,
        totalTrackColor:
          nexenTheme?.trackSeekBar?.totalTrackColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.3),
        thumbColor:
          nexenTheme?.trackSeekBar?.thumbColor ||
          nexenTheme?.colors?.accentColor,
        thumbBorderColor:
          nexenTheme?.trackSeekBar?.thumbBorderColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.7),

        trackHeight: nexenTheme?.trackSeekBar?.trackHeight,
        thumbSize: nexenTheme?.trackSeekBar?.thumbSize,
        thumbBorderWidth: nexenTheme?.trackSeekBar?.thumbBorderWidth,
        thumbCornerRadius: nexenTheme?.trackSeekBar?.thumbCornerRadius,
        thumbBorderCornerRadius:
          nexenTheme?.trackSeekBar?.thumbBorderCornerRadius,
      };
    }, [nexenTheme, fullScreen]);

    const volumeSeekBarTheme = React.useMemo((): VolumeTagViewTheme => {
      return {
        barColor: muted 
        ? '#414141'
        :  nexenTheme?.miniSeekBar?.barColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.7),
        underlayColor: muted 
        ? '#919191'
        :  nexenTheme?.miniSeekBar?.underlayColor ||
          getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.3),
        thumbColor: muted 
        ? '#313131'
        :  nexenTheme?.miniSeekBar?.thumbColor ||
          nexenTheme?.colors?.accentColor,
        borderColor:
          nexenTheme?.tagView?.borderColor ||
          getAlphaColor(nexenTheme?.colors?.accentColor!, 0.7),

        iconColor: nexenTheme?.colors?.primaryIconColor,

        iconSize: nexenTheme?.sizes?.primaryIconSize,
        height: nexenTheme?.tagView?.height,
        cornerRadius: nexenTheme?.tagView?.cornerRadius,
        borderWidth: nexenTheme?.tagView?.borderWidth,

        trackHeight: nexenTheme?.miniSeekBar?.trackHeight,
        thumbSize: nexenTheme?.miniSeekBar?.thumbSize,
        thumbCornerRadius: nexenTheme?.miniSeekBar?.thumbCornerRadius,
      };
    }, [nexenTheme, fullScreen, muted]);

    const timeTagViewTheme = React.useMemo((): TimeTagViewTheme => {
      return {
        font: nexenTheme?.fonts?.secondaryFont,
        height: nexenTheme?.tagView?.height,
        cornerRadius: nexenTheme?.tagView?.cornerRadius,
        borderWidth: nexenTheme?.tagView?.borderWidth,
        textSize: nexenTheme?.tagView?.textSize,
        textLineHeight: nexenTheme?.tagView?.textLineHeight,
        textColor:
          nexenTheme?.tagView?.textColor ||
          nexenTheme?.colors?.secondaryTextColor,
        borderColor:
          nexenTheme?.tagView?.borderColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.3),
        backgroundColor: 
          nexenTheme?.tagView?.backgroundColor ||
          getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.0),
      };
    }, [nexenTheme, fullScreen]);

    /* const iconTagViewTheme = React.useMemo((): IconTagViewTheme => {
      return {
        height: nexenTheme?.tagView?.height,
        cornerRadius: nexenTheme?.tagView?.cornerRadius,
        borderWidth: nexenTheme?.tagView?.borderWidth,
        iconSize: nexenTheme?.tagView?.iconSize!,
        textSize: nexenTheme?.tagView?.textSize,
        textLineHeight: nexenTheme?.tagView?.textLineHeight,
        iconColor:
          nexenTheme?.tagView?.iconColor || nexenTheme?.colors?.primaryColor,
        activeIconColor:
          nexenTheme?.tagView?.activeIconColor ||
          getAlphaColor(nexenTheme?.colors?.accentColor!, 0.7),
        inactiveIconColor:
          nexenTheme?.tagView?.inactiveIconColor ||
          getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.5),
        textColor:
          nexenTheme?.tagView?.textColor ||
          nexenTheme?.colors?.secondaryTextColor,
        borderColor:
          nexenTheme?.tagView?.borderColor ||
          getAlphaColor(nexenTheme?.colors?.accentColor!, 0.7),
      };
    }, [nexenTheme, fullScreen]); */

    // console.log(`iconTagViewTheme:: ${JSON.stringify(iconTagViewTheme)}`);

    const slideButtonTheme = React.useMemo((): SlideButtonTheme => {

      return {
        font: nexenTheme?.fonts?.secondaryFont,
        containerColor:
          nexenTheme?.lockButton?.containerColor ||
          getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.7),
        underlayColor:
          nexenTheme?.lockButton?.underlayColor ||
          getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.15),
        thumbColor:
          nexenTheme?.lockButton?.thumbColor ||
          nexenTheme?.colors?.secondaryColor,
        thumbIconColor:
          nexenTheme?.lockButton?.thumbIconColor ||
          nexenTheme?.colors?.accentColor,
        textColor:
          nexenTheme?.lockButton?.textColor ||
          nexenTheme?.colors?.primaryTextColor,

        thumbHeight: nexenTheme?.lockButton?.thumbHeight,
        thumbWidth: nexenTheme?.lockButton?.thumbWidth,
        thumbCornerRadius: nexenTheme?.lockButton?.thumbCornerRadius,
        thumbIconSize: nexenTheme?.lockButton?.thumbIconSize,
        textSize: nexenTheme?.lockButton?.textSize,
        padding: 3,
      };
    }, [nexenTheme, fullScreen]);

    const renderBasicLayout = () => {
      return (
        <>
          <View style={styles.iconButtonContainer}>
            <IconButton
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              onPress={onPlayPress}
            >
              {paused ? (
                <IconPaly size={ICON_SIZE} color={ICON_COLOR} />
              ) : (
                <IconPause size={ICON_SIZE} color={ICON_COLOR} />
              )}
            </IconButton>
            {!playerConfig?.disableStop && (
              <IconButton onPress={onStopPress}>
                <IconStop size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
          </View>
          <View style={styles.iconButtonContainer}>
            {!playerConfig?.disableVolume && (
              <IconButton onPress={onVolumePress}>
                {muted ? (
                  <IconVolume size={ICON_SIZE} color={ICON_COLOR} />
                ) : (
                  <IconVolume2 size={ICON_SIZE} color={ICON_COLOR} />
                )}
              </IconButton>
            )}
            {!playerConfig?.disableFullscreen && (
              <IconButton onPress={onFullScreenPress}>
                {fullScreen ? (
                  <IconMinimize size={ICON_SIZE} color={ICON_COLOR} />
                ) : (
                  <IconMaximize size={ICON_SIZE} color={ICON_COLOR} />
                )}
              </IconButton>
            )}
          </View>
        </>
      );
    };

    const renderIntermediateLayout = () => {
      return (
        <>
          <View style={styles.iconButtonContainer}>
            {!disablePlaylistAndSkip && !playerConfig?.disableSkip && (
              <IconButton
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                onPress={onSkipBack}
              >
                <IconSkipBack size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
            <IconButton
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              onPress={onPlayPress}
            >
              {paused ? (
                <IconPaly size={ICON_SIZE} color={ICON_COLOR} />
              ) : (
                <IconPause size={ICON_SIZE} color={ICON_COLOR} />
              )}
            </IconButton>
            {!playerConfig?.disableStop && (
              <IconButton onPress={onStopPress}>
                <IconStop size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}

            {!disablePlaylistAndSkip && !playerConfig?.disableSkip && (
              <IconButton
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                onPress={onSkipNext}
              >
                <IconSkipForward size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
          </View>
          <View style={styles.iconButtonContainer}>
            {!playerConfig?.disableVolume && (
              <VolumeTagView
                volume={volume}
                totalVolume={totalVolume}
                muted={muted}
                isSeekable={isVolumeSeekable}
                theme={volumeSeekBarTheme}
                onVolumeSeekStart={onVolumeSeekStart}
                onVolumeSeekUpdate={onVolumeSeekUpdate}
                onVolumeSeekEnd={onVolumeSeekEnd}
                onVolumePress={onVolumePress}
              />
            )}
            {!playerConfig?.disableFullscreen && (
              <IconButton onPress={onFullScreenPress}>
                {fullScreen ? (
                  <IconMinimize size={ICON_SIZE} color={ICON_COLOR} />
                ) : (
                  <IconMaximize size={ICON_SIZE} color={ICON_COLOR} />
                )}
              </IconButton>
            )}
          </View>
        </>
      );
    };

    const renderAdvancedLayout = () => {
      return (
        <View style={styles.iconButtonContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            {/* <IconTagView
              ref={iconTagViewRef}
              style={{ marginLeft: 12 }}
              theme={iconTagViewTheme}
            /> */}
            {!playerConfig?.disableResizeMode && !locked && (
              <IconButton onPress={onAspectRatioPress}>
                <IconAspectRatio size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
            {!disablePlaylistAndSkip && !playerConfig?.disablePlaylist && !locked && (
              <IconButton onPress={onVideoListPress}>
              <IconFilm size={ICON_SIZE} color={ICON_COLOR} />
            </IconButton>
            )}
          </View>

          <View
            style={{
              // position: 'absolute',
              // left: 0,
              // right: 0,
              // bottom: 0,
              // backgroundColor: 'blue',
              // zIndex: 200,
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!disablePlaylistAndSkip && !playerConfig?.disableSkip && (
              <IconButton
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                onPress={onSkipBack}
              >
                <IconSkipBack size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
            <IconButton
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              onPress={onPlayPress}
            >
              {paused ? (
                <IconPlayCircle
                  size={ICON_SIZE! * ICON_SIZE_FACTOR}
                  color={ICON_COLOR}
                />
              ) : (
                <IconPauseCircle
                  size={ICON_SIZE! * ICON_SIZE_FACTOR}
                  color={ICON_COLOR}
                />
              )}
            </IconButton>
            {!disablePlaylistAndSkip && !playerConfig?.disableSkip && (
              <IconButton
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                onPress={onSkipNext}
              >
                <IconSkipForward size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {!playerConfig?.disableSubtitle && (
              <IconButton onPress={onCcPress}>
                <IconSubtitle size={ICON_SIZE} color={ICON_COLOR} />
              </IconButton>
            )}

            {!playerConfig?.disableFullscreen && (
              <IconButton onPress={onFullScreenPress}>
                {fullScreen ? (
                  <IconMinimize size={ICON_SIZE} color={ICON_COLOR} />
                ) : (
                  <IconMaximize size={ICON_SIZE} color={ICON_COLOR} />
                )}
              </IconButton>
            )}
          </View>
        </View>
      );
    };

    return (
      <Animated.View
        style={[
          styles.container,
          { height: CONTAINER_HEIGHT },
          { opacity, marginBottom },
        ]}
      >
        <GradientView
          style={{
            height: '100%',
            width: '100%',
          }}
          startOpacity={0.0}
          middleOpacity={0.2}
          endOpacity={0.5}
        />
        <TouchableHighlight
          style={[
            styles.innerContainer,
            {
              paddingBottom: CONTAINER_VERTICAL_PADDING,
              paddingHorizontal: CONTAINER_HORIZONTAL_PADDING,
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            <View style={styles.seekbarContainer}>
              <TimeTagView
                timeText={formatTime(trackTime)}
                theme={timeTagViewTheme}
              />
              <SeekBar
                style={styles.trackSeekbar}
                trackValue={trackTime}
                cachedTrackValue={cachedTrackTime}
                totalTrackValue={totalTrackTime}
                isSeekable={isSeekable}
                theme={seekBarTheme}
                onSeekStart={onSeekStart}
                onSeekUpdate={onSeekUpdate}
                onSeekEnd={onSeekEnd}
              />
              <TimeTagView
                timeText={formatTime(totalTrackTime)}
                theme={timeTagViewTheme}
              />
            </View>
            {locked ? (
              <View style={styles.lockedViewContainer}>
                <View style={styles.slideButtonContainer}>
                  <SlideButton
                    theme={slideButtonTheme}
                    onSlideStart={onSlideStart}
                    onSlideEnd={onSlideEnd}
                    onReachedToStart={onReachedToStart}
                    onReachedToEnd={onReachedToEnd}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.unlockedViewContainer}>
                {playerConfig?.layoutMode === 'basic' && renderBasicLayout()}
                {playerConfig?.layoutMode === 'intermediate' && renderIntermediateLayout()}
                {playerConfig?.layoutMode === 'advanced' && renderAdvancedLayout()}
              </View>
            )}
          </View>
        </TouchableHighlight>
      </Animated.View>
    );
  }
);

export default React.memo(FooterControl);

FooterControl.defaultProps = {
  // disableLargeMode: false,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    minHeight: 68,
    zIndex: 100,
    // backgroundColor: 'pink'
  },
  innerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    // paddingBottom: 8,
    // backgroundColor: 'red',
  },
  iconButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // flexShrink: 1,
    // backgroundColor: 'green',
  },
  lockedViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unlockedViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seekbarContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  trackSeekbar: {
    marginHorizontal: 4,
  },
  // textContainer: {
  //   height: 18,
  //   borderRadius: 9,
  //   borderWidth: 2,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // timeText: {
  //   fontSize: 11,
  //   opacity: 0.8,
  //   marginHorizontal: 6,
  //   lineHeight: 13,
  // },
  slideButtonContainer: {
    flex: 1,
    padding: 8,
  },
});
