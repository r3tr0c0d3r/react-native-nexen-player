import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import type { NexenTheme } from '../utils/Theme';
import DropDown, { DropDownItem } from './DropDown';
import GradientView from './GradientView';
import ModalView from './ModalView';

import { withAnimation } from '../hoc/withAnimation';
import { EdgeInsets } from './NexenPlayer';

type TrackControlProps = {
  fullScreen: boolean;
  nexenTheme?: NexenTheme;
  insets?: EdgeInsets;
  style?: StyleProp<ViewStyle>;
};

const TrackControl = (props: TrackControlProps) => {
  const { style, fullScreen, nexenTheme, insets } = props;
  // const rtlMultiplier = React.useRef(1);
  // const isRTL = I18nManager.isRTL;
  // rtlMultiplier.current = isRTL ? -1 : 1;

  const hh = StyleSheet.flatten(style).height || 100;
  console.log(`hh: ${hh}`);
  const dropdownHeight = Number(hh) - 10 * 2 - 40;

  const CONTAINER_HORIZONTAL_PADDING = fullScreen 
  ? (insets?.left! + insets?.right!) / 2 > 0 
  ? (insets?.left! + insets?.right!) / 2
  : 8
  : 8;

  // const selectRef = React.useRef<Select>(null);
  // const optionRef = React.useRef<OptionList>(null);
  const [selected, setSelected] = React.useState<DropDownItem>();
  const data = [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
    { label: 'Three', value: '3' },
    { label: 'Four', value: '4' },
    { label: 'Five', value: '5' },
  ];

  const containerStyle = {
    left: CONTAINER_HORIZONTAL_PADDING,
    right: CONTAINER_HORIZONTAL_PADDING,
    bottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  }

  // const _getOptionList = () => {
  //   return optionRef.current;
  // };

  // const _canada = (province: string) => {
  //   console.log(province);
  // };


  return (
    <ModalView style={[styles.container, style, containerStyle]}>
      <GradientView
        style={{
          height: '100%',
          width: '100%',
        }}
        startOpacity={0.0}
        middleOpacity={0.2}
        endOpacity={0.5}
      />
      <View style={[styles.innerContainer, { flexDirection: 'row' }]}>
        <View
          style={{
            flex: 1,
            marginRight: 5,
          }}
        >
          <DropDown
            height={dropdownHeight}
            label={'Text Track'}
            data={data}
            onSelect={setSelected}
          />
        </View>

        {/* <View
          style={{
            width: 2,
            height: '100%',
            backgroundColor: 'rgba(10,10,10,0.5)',
          }}
        /> */}

        <View
          style={{
            flex: 1,
            marginLeft: 5,
          }}
        >
          <DropDown
            height={dropdownHeight}
            label={'Audio Track'}
            data={data}
            onSelect={setSelected}
          />
        </View>
      </View>
    </ModalView>
  );
};

export default withAnimation(TrackControl);

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // left: 8,
    // right: 8,
    // bottom: 0,
    // minHeight: 100,
    // maxHeight: 200,
    overflow: 'hidden',
    zIndex: 110,
  },
  innerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
});
