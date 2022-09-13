import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { ReactElement } from 'react';
import { IconChevronDown } from '../assets/icons';
import { DropdownMenuTheme } from '../utils/Theme';

const ANIMATION_DURATION = 250;
const USE_NATIVE_DRIVER = false;

export interface DropDownTheme extends DropdownMenuTheme {
  font?: string;
}

export type DropDownItem = {
  label?: string;
  value?: string;
};

type DropDownProps = {
  width?: number;
  height?: number;
  label: string;
  items?: DropDownItem[];
  selectedItem?: DropDownItem;
  theme?: DropDownTheme;
  onItemSelect?: (item: DropDownItem) => void;
};

const DropDown = (props: DropDownProps) => {
  const {
    width,
    height = 100,
    label,
    items,
    selectedItem,
    theme,
    onItemSelect,
  } = props;
  // console.log(`DropDown:: height:${height}`);
  const dropdownRef = React.useRef<TouchableOpacity>(null);
  const containerHeight = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = containerHeight.interpolate({
    inputRange: [0, height],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const [visible, setVisible] = React.useState(false);

  const startExpandAnimation = (
    callback?: Animated.EndCallback | undefined
  ) => {
    Animated.timing(containerHeight, {
      toValue: height,
      duration: ANIMATION_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(callback);
  };

  const startCollapseAnimation = (
    callback?: Animated.EndCallback | undefined
  ) => {
    Animated.timing(containerHeight, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(callback);
  };

  React.useEffect(() => {
    if (visible) {
      startExpandAnimation();
    } else {
      startCollapseAnimation();
    }
  }, [visible]);

  const toggleDropdown = (): void => {
    if (items && items.length > 0) {
      setVisible((prevState) => !prevState);
    }
  };

  const onItemPress = (item: DropDownItem): void => {
    onItemSelect?.(item);
    setVisible(false);
  };

  const renderItem = ({
    item,
  }: ListRenderItemInfo<DropDownItem>): ReactElement<any, any> => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.item, { backgroundColor: theme?.itemBackgroundColor }]}
      onPress={() => onItemPress(item)}
    >
      <Text
        style={[
          styles.itemText,
          {
            color: theme?.itemTextColor,
            fontSize: theme?.itemTextSize,
            fontFamily: theme?.font,
          },
        ]}
      >
        {item.label}
      </Text>
      {item.label === selectedItem?.label && (
        <View
          style={[
            styles.itemDot,
            { backgroundColor: theme?.itemSelectedColor },
          ]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View ref={dropdownRef} style={[styles.container]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.header,
          {
            backgroundColor: theme?.headerBackgroundColor,
            borderTopLeftRadius: theme?.cornerRadius,
            borderTopRightRadius: theme?.cornerRadius,
          },
        ]}
        onPress={toggleDropdown}
      >
        <Text
          style={[
            styles.headerText,
            {
              color: theme?.headerTextColor,
              fontSize: theme?.headerTextSize,
              fontFamily: theme?.font,
            },
          ]}
        >
          {label}
        </Text>
        <IconChevronDown
          style={[styles.icon, { transform: [{ scaleY: visible ? -1 : 1 }] }]}
          size={20}
          color={theme?.headerTextColor}
        />
      </TouchableOpacity>

      <View
        style={{
          width: '100%',
          height: height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme?.backgroundColor,
        }}
      >
        <Animated.Text
          style={{
            position: 'absolute',
            color: theme?.textColor,
            fontSize: theme?.textSize,
            fontFamily: theme?.font,
            opacity: opacityAnim,
          }}
        >
          {(selectedItem && selectedItem.label) || 'None'}
        </Animated.Text>
        <Animated.View
          style={[
            styles.dropdown,
            {
              height: containerHeight,
            },
          ]}
        >
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default DropDown;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.7)',
    height: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: '#fafafa',
  },
  icon: {
    // margin: 10,
  },
  dropdown: {
    ...StyleSheet.absoluteFillObject,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#fafafa',
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectedText: {
    position: 'absolute',
  },
});
