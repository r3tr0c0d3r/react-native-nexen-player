import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { ReactElement } from 'react';
import { IconChevronDown } from '../assets/icons';

const ANIMATION_DURATION = 300;
const USE_NATIVE_DRIVER = false;

export type DropDownItem = {
  label?: string;
  value?: string;
};

type DropDownProps = {
  width?: number;
  height?: number;
  label: string;
  data: Array<{ label: string; value: string }>;
  onSelect: (item: DropDownItem) => void;
};

const DropDown = (props: DropDownProps) => {
  const { width, height = 100, label, data, onSelect } = props;
  // console.log(`DropDown:: height:${height}`);
  const DropdownButton = React.useRef<TouchableOpacity>(null);
  const containerHeight = React.useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState<DropDownItem>();
  const [dropdownTop, setDropdownTop] = React.useState(0);

  const startExpandAnimation = (
    callback?: Animated.EndCallback | undefined
  ) => {
    Animated.timing(containerHeight, {
      toValue: height,
      duration: ANIMATION_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(callback);
    // Animated.parallel([
    //   Animated.timing(trackOpacity, {
    //     toValue: 1,
    //     duration: ANIMATION_DURATION,
    //     useNativeDriver: USE_NATIVE_DRIVER,
    //   }),
    //   Animated.timing(trackBottomMargin, {
    //     toValue: 0,
    //     duration: ANIMATION_DURATION,
    //     useNativeDriver: USE_NATIVE_DRIVER,
    //   }),
    // ]).start(callback);
  };

  const startCollapseAnimation = (
    callback?: Animated.EndCallback | undefined
  ) => {
    Animated.timing(containerHeight, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(callback);
    // Animated.parallel([
    //   Animated.timing(trackOpacity, {
    //     toValue: 0,
    //     duration: ANIMATION_DURATION,
    //     useNativeDriver: USE_NATIVE_DRIVER,
    //   }),
    //   Animated.timing(trackBottomMargin, {
    //     toValue: -dimension.height * 0.25,
    //     duration: ANIMATION_DURATION,
    //     useNativeDriver: USE_NATIVE_DRIVER,
    //   }),
    // ]).start(callback);
  };

  React.useEffect(() => {
    console.log(`useEffect: ${visible}`);
    if (visible) {
      startExpandAnimation();
      // startCollapseAnimation();
    } else {
      // startExpandAnimation();
      startCollapseAnimation();
    }
  }, [visible]);

  const toggleDropdown = (): void => {
    setVisible((prevState) => !prevState);
    //openDropdown();
  };

  const openDropdown = (): void => {
    DropdownButton?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h);
    });
    setVisible(true);
  };

  const onItemPress = (item: DropDownItem): void => {
    // setSelected(item);
    // onSelect(item);
    // setVisible(false);
  };

  const renderItem = ({
    item,
  }: ListRenderItemInfo<DropDownItem>): ReactElement<any, any> => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.item}
      onPress={() => onItemPress(item)}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View ref={DropdownButton} style={[styles.container]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={toggleDropdown}
      >
        <Text style={styles.buttonText}>
          {(selected && selected.label) || label}
        </Text>
        <IconChevronDown
          style={[styles.icon, { transform: [{ scaleY: visible ? -1 : 1 }] }]}
          size={20}
          color={'#fafafa'}
        />
      </TouchableOpacity>

      <Animated.View
        style={{
          height: containerHeight,
        }}
      >
        <FlatList
          // contentContainerStyle={{width: '100%', height: '100%', backgroundColor: 'red'}}
          // style={{
          //   height: containerHeight,
          // }}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </Animated.View>
    </View>
  );
};

export default DropDown;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#bad',
    // height: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.7)',
    height: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    zIndex: 1,
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
    color: '#fafafa',
    // backgroundColor: 'red',
  },
  icon: {
    // margin: 10,
  },
  dropdown: {
    // position: 'absolute',
    // backgroundColor: '#fff',
    // width: '100%',
    // shadowColor: '#000000',
    // shadowRadius: 4,
    // shadowOffset: { height: 4, width: 0 },
    // shadowOpacity: 0.5,
  },
  overlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'blue',
  },
  item: {
    backgroundColor: '#bad',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
