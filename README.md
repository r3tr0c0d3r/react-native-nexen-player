# react-native-nexen-player

A next generation video player for react native app based on `react-native-video`. It provides advanced media control functionality.

## Preview

![@](./demo/react_native_nexen_player.gif)

## Installation

```sh
npm install react-native-nexen-player
```

or

```sh
yarn add react-native-nexen-player
```

## Dependencies

```sh
yarn add react-native-video react-native-svg
```
## Usage

```js
import NexenPlayer, { NexenPlayerRef } from 'react-native-nexen-player';

// ...

const [paused, setPaused] = React.useState(true);
const playerRef = React.useRef<NexenPlayerRef>(null);

const onPausePress = () => {
    if (paused) {
      playerRef.current?.play();
    } else {
      playerRef?.current?.pause();
    }
    setPaused((prevState) => !prevState);
  };

<NexenPlayer
    ref={playerRef}
    style={styles.player}
    playerSource={{
      source: require('../assets/videos/Street_Fighter_V_Stop_Motion.mp4'),
      poster: 'https://img.youtube.com/vi/KrmxD8didgQ/0.jpg',
      title: "Ryu's Hurricane Kick and Hadoken",
    }}
    />

// ...
```

## Component props

| prop                      | type     | default      | description                                 |
| ------------------------- | -------- | ------------ | --------------------------------------------|
| playerSource              | NexenPlayer [PlayerSource](#PlayerSource) object   | {}           | media source.           |
| playerConfig              | NexenPlayer [PlayerConfig](#PlayerConfig) object   | ''           | vidoe player config.       |
| optimizationConfig        | NexenPlayer [OptimizationConfig](#OptimizationConfig) object   | {}           | only for FlatList Optimization.      |
| insets                    | object   | {}           | edge insets for video controls. you can set insets from `react-native-safe-area-context`.|
| style                     | object   | {}           | style for video player.    |
| theme                     | object   | {}           | set theme for video player.    |


### PlayerSource

| prop                      | type     | default      | description                                 |
| ------------------------- | -------- | ------------ | --------------------------------------------|
| source                    | Source   | {}           | media source.       |
| title                     | string   | undefined           | video title.       |
| poster                    | string   | undefined           | poster url.       |
| playlist                  | { items: PlaylistItem[]; currentIndex?: number; }   | {}           | poster style.      |
| textTracks                | TextTrack[]   | undefined             | text tracks (cations or subtitle) for the video.       |
| selectedTextTrack         | SelectedTextTrack   | undefined          | text trak that will be shown for the video.       |
| selectedAudioTrack        | SelectedAudioTrack   | undefined            | audio track that will be selected for the video.    |

### PlayerConfig

| prop                      | type     | default      | description                                 |
| ------------------------- | -------- | ------------ | --------------------------------------------|
| loaderText                | string   | 'Loading...' | text for loader.  |
| errorText                 | string   | 'Error...!'  | text for error message.            |
| doubleTapTime             | number   | 300ms        | duration of double tap. |
| controlTimeout            | number   | 500ms        | main control will hide after this amount of time when `controlHideMode` set to 'auto'. |
| controlHideMode           | string   | 'touch'      | hide options for main control - 'touch' or 'auto'. |
| layoutMode                | stirng   | 'basic'      | options for main control layout - 'basic', 'intermediate' or 'advanced'.        |
| resizeMode                | `ResizeMode` object  | 'contain'        | video resize options. |
| posterResizeMode          | `ResizeMode` object  | 'cover'        | poster resize options. |
| volume                    | number   | 80           | volume of the video (0-100). |
| brightness                | number   | 25           | brightness of the video (0-100). |
| playbackSpeed             | `PlaybackSpeed` objecj   | '1.0'            | video playback speed. |
| muted                     | boolean  | false        | mute video. |
| repeat                    | boolean  | false        | repeat video. |
| autoPlay                  | boolean  | false        | should autoplay the video. |
| disableOnScreenPlayButton | boolean  | false        | a large play button that appears on screen when video is paused. |
| disableBack               | boolean  | false        | hide back button. |
| disableResizeMode         | boolean  | false        | hide aspect ration button. |
| disableVolume             | boolean  | false        | hide volume button. |
| disableMore               | boolean  | false        | hide more button. |
| disableSkip               | boolean  | false        | hide skip buttons. |
| disableStop               | boolean  | false        | hide stop button. |
| disableFullscreen         | boolean  | false        | hide fullscreen button. |
| disablePlaylist           | boolean  | () => {}     | hide video playlist button. |
| index                     | number    | 0           | flatlist index (only for FlatList)      |
| activeIndex               | number    | -1          | flatlist current video index (only for FlatList)         |
| optimize                  | boolean   | false       | wheather you need flatlist optimization or not (only for FlatList)         |

## Enevt props
| prop                      | type     | default      | description                                 |
| ------------------------- | -------- | ------------ | --------------------------------------------|
| onBackPressed             | func     | () => {}     | callback for back button.|
| onPlay                    | func     | () => {}     | callback for play button.|
| onPause                   | func     | () => {}     | callback for pause button.|
| onStop                    | func     | () => {}     | callback for stop button.|
| onSkipNext                | func     | () => {}     | callback for skipNext event.|
| onSkipBack                | func     | () => {}     | callback for skipBack event.|
| onReload                  | func     | () => {}     | callback for reload event.|
| onVolumeUpdate            | func     | () => {}     | callback for volume update event.|
| onBrightnessUpdate        | func     | () => {}     | callback for brightness update event.|
| onMuteUpdate              | func     | () => {}     | callback for mute button.|
| onLoopUpdate              | func     | () => {}     | callback for loop button.|
| onSpeedUpdate             | func     | () => {}     | callback for playback speed update event.|
| onFullScreenModeUpdate    | func     | () => {}     | callback for fullscreen mode update event.|
| onScreenLockUpdate        | func     | () => {}     | callback for screen lock update event.|
| onPlaylistItemSelect      | func     | () => {}     | callback for video list item select event.|

## Methods
| prop                      | type     | default      | description                                 |
| ------------------------- | -------- | ------------ | --------------------------------------------|
| play                      | func     | () => {}     | call to play a video.|
| pause                     | func     | () => {}     | call to pause a video.|
| stop                      | func     | () => {}     | call to stop a video.|
| skipNext                  | func     | () => {}     | skip to next video.|
| skipBack                  | func     | () => {}     | skip to prvious video.|
| reload                    | func     | () => {}     | call to reload a video.|
| load                      | func     | () => {}     | call to load a video.|
| setFullScreenMode         | func     | () => {}     | set fullscreen mode.|

## ToDo

-[] Custom icon support

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
