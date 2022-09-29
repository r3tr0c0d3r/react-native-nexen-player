import React, { ReactElement } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NexenPlayer, { PlayListItem } from 'react-native-nexen-player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getData } from './data';

const FlatlistScreen = () => {
  const [dimension, setDimension] = React.useState({ width: 0, height: 0 });
  const navigation = useNavigation();
  const edgeinsets = useSafeAreaInsets();
  const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const fullScreenIndex = React.useRef(-1);
  const quiteIndex = React.useRef(0);
  const ITEM_HEIGHT = 260;
  const FULL_ITEM_HEIGHT = dimension.height;
  const flatlistRef = React.useRef<FlatList>(null);

  const _onLayoutChange = async (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const { width: w, height: h } = dimension;
    if (w !== width || h !== height) {
      setDimension({ width, height });
    }
  };

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

  const onPlay = (index?: number) => {
    quiteIndex.current = index!;
    setActiveIndex(index!);
  };

  const onSkipNext = (index: number) => {
    quiteIndex.current = index;
    console.log(
      `Player: onSkipNext:${index} quiteIndex: ${quiteIndex.current}`
    );
  };

  const onSkipBack = (index: number) => {
    quiteIndex.current = index;
    console.log(
      `Player: onSkipBack:${index} quiteIndex: ${quiteIndex.current}`
    );
  };

  const onFullScreenModeUpdate = async (
    fullScreen: boolean,
    index?: number
  ) => {
    console.log(`Player: onFullScreenModeUpdate:${fullScreen}`);
    if (fullScreen) {
      // hideTabBar();
      fullScreenIndex.current = index!;
      // Orientation.lockToLandscape();
    } else {
      // showTabBar();
      fullScreenIndex.current = -1;
      // Orientation.lockToPortrait();
    }
    setIsFullScreen(fullScreen);
  };

  //   const onPress = () => {
  //     setIsFullScreen(prevState => !prevState);
  //   }

  const renderItem = ({
    item,
    index,
  }: ListRenderItemInfo<PlayListItem>): ReactElement<any, any> => {
    return (
      <View
        style={[
          styles.playerContainer,
          {
            width: '100%',
            height:
              index === fullScreenIndex.current
                ? FULL_ITEM_HEIGHT
                : ITEM_HEIGHT,
          },
        ]}
      >
        <NexenPlayer
          style={styles.player}
          config={{
            index,
            activeIndex,
            optimize: true,
          }}
          source={{
            source: item.itemSource.source,
            poster: item.itemSource.poster,
            title: item.itemSource.title,
          }}
          insets={edgeinsets}
          onPlay={onPlay}
          onSkipNext={onSkipNext}
          onSkipBack={onSkipBack}
          onFullScreenModeUpdate={onFullScreenModeUpdate}
        />
      </View>
    );
  };

  React.useEffect(() => {
    if (isFullScreen) {
      hideTabBar();
    } else {
      showTabBar();
    }
    if (fullScreenIndex.current >= 0) {
      flatlistRef.current?.scrollToOffset({
        animated: true,
        offset: fullScreenIndex.current * ITEM_HEIGHT,
      });
    } else {
      flatlistRef.current?.scrollToOffset({
        animated: true,
        offset: quiteIndex.current * ITEM_HEIGHT,
      });
      setActiveIndex(quiteIndex.current);
    }
  }, [isFullScreen]);

  const renderFlatlist = () => {
    return (
      <>
        <StatusBar hidden={isFullScreen} />
        <FlatList
          ref={flatlistRef}
          style={styles.list}
          onLayout={_onLayoutChange}
          keyExtractor={(index) => index.toString()}
          data={getData()}
          renderItem={renderItem}
          initialScrollIndex={
            fullScreenIndex.current >= 0 ? fullScreenIndex.current : 0
          }
          scrollEnabled={isFullScreen ? false : true}
          pagingEnabled={isFullScreen ? true : false}
          ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        />
      </>
    );
  };

  return renderFlatlist();
};

export default FlatlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    zIndex: 1,
  },
  playerContainer: {
    flex: 1,
  },
  player: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
