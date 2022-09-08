import React from 'react';
import {
  Animated,
  FlatList,
  GestureResponderEvent,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import type { NexenTheme } from '../utils/Theme';
import {
  IconInfo,
  IconRepeat,
  IconUnlock,
  IconZap,
} from '../assets/icons';
import GradientView from './GradientView';
import { EdgeInsets } from './NexenPlayer';
import { withAnimation } from '../hoc/withAnimation';

export type MoreItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  // onPress: () => void;
};

type MoreControlProps = {
  fullScreen: boolean;
  nexenTheme?: NexenTheme;
  insets?: EdgeInsets;
  style?: StyleProp<ViewStyle>;
  onItemPress?: (item: MoreItem) => void;
};

const MoreControl = (props: MoreControlProps) => {
  const {
    style,
    fullScreen,
    insets,
    nexenTheme,
    onItemPress,
  } = props;
  const ICON_SIZE = fullScreen ? 24 : 20;
  const ICON_COLOR = nexenTheme?.colors?.secondaryIconColor
  const TEXT_COLOR = nexenTheme?.colors?.secondaryTextColor
  
  const CONTAINER_VERTICAL_PADDING = fullScreen 
    ? (insets?.top! + insets?.bottom!) / 2 > 0 
    ? (insets?.top! + insets?.bottom!) / 2
    : nexenTheme?.sizes?.paddingVertical
    : nexenTheme?.sizes?.paddingVertical;

  const MORE_OPTION_DATA: MoreItem[] = [
    {
      id: 'lock',
      icon: <IconUnlock size={ICON_SIZE} color={ICON_COLOR} />,
      label: 'Lock',
    },
    {
      id: 'speed',
      icon: <IconZap size={ICON_SIZE} color={ICON_COLOR} />,
      label: 'Playback Speed',
    },
    {
      id: 'repeat',
      icon: <IconRepeat size={ICON_SIZE} color={ICON_COLOR} />,
      label: 'Repeat Mode',
    },
    {
      id: 'info',
      icon: <IconInfo size={ICON_SIZE} color={ICON_COLOR} />,
      label: 'Video Info',
    },
  ];

  const containerStyle = {
    top: CONTAINER_VERTICAL_PADDING,
    bottom: CONTAINER_VERTICAL_PADDING,
    right: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  };

  const itemTextStyle = {
    color: TEXT_COLOR,
    fontFamily: nexenTheme?.fonts?.secondaryFont,
  }

  const renderMoreItem = ({item}: ListRenderItemInfo<MoreItem>) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.6}
        onPress={() => {
          onItemPress?.(item);
        }}>
        {item.icon}
        <Text style={[styles.itemText, itemTextStyle]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <Animated.View style={[styles.container, style, containerStyle]}>
      <GradientView
        style={{
          height: '100%',
          width: '100%',
        }}
        startPoint={{x: 0, y: 0}}
        endPoint={{x: 1, y: 0}}
        startOpacity={0.0}
        middleOpacity={0.2}
        endOpacity={0.5}
      />
      <TouchableOpacity style={styles.listContainer} activeOpacity={1}>
        <FlatList
          keyExtractor={(item: MoreItem) => item.id}
          data={MORE_OPTION_DATA}
          renderItem={renderMoreItem}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default withAnimation(MoreControl);

MoreControl.defaultProps = {
  
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 0,
    bottom: 8,
    minWidth: 168,
    maxWidth: 220,
    zIndex: 110,
    overflow: 'hidden',
  },
  listContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 15,
    marginLeft: 8,
  },
});
