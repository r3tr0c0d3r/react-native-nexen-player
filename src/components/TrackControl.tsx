import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import type { NexenTheme } from '../utils/Theme';
import DropDown, { DropDownItem, DropDownTheme } from './DropDown';
import GradientView from './GradientView';
import ModalView from './ModalView';

import { withAnimation } from '../hoc/withAnimation';
import { AudioTrack, EdgeInsets, SelectedAudioTrack, SelectedTextTrack, TextTrack } from './NexenPlayer';
import { getAlphaColor } from '../utils/ColorUtil';

type TrackControlProps = {
  textTracks?: TextTrack[];
  selectedTextTrack?: SelectedTextTrack;
  audioTracks?: AudioTrack[];
  selectedAudioTrack?: SelectedAudioTrack;
  onTextTrackSelect?: (selectedTextTrack: SelectedTextTrack) => void;
  onAudioTrackSelect?: (selectedAudioTrack: SelectedAudioTrack) => void;
  fullScreen?: boolean;
  nexenTheme?: NexenTheme;
  insets?: EdgeInsets;
  style?: StyleProp<ViewStyle>;
};

const TrackControl = (props: TrackControlProps) => {
  const { style, fullScreen, nexenTheme, insets, textTracks, selectedTextTrack, audioTracks, selectedAudioTrack, onTextTrackSelect, onAudioTrackSelect } = props;
  // const rtlMultiplier = React.useRef(1);
  // const isRTL = I18nManager.isRTL;
  // rtlMultiplier.current = isRTL ? -1 : 1;

  const hh = StyleSheet.flatten(style).height || 100;
  // console.log(`hh: ${hh} textTracks: ${textTracks?.length} audioTracks: ${audioTracks?.length}`);
  const dropdownHeight = Number(hh) - 10 * 2 - 40;

  const CONTAINER_HORIZONTAL_PADDING = fullScreen 
  ? (insets?.left! + insets?.right!) / 2 > 0 
  ? (insets?.left! + insets?.right!) / 2
  : 8
  : 8;

  // const selectRef = React.useRef<Select>(null);
  // const optionRef = React.useRef<OptionList>(null);
  const [textItems, setTextItems] = React.useState<DropDownItem[] | undefined>();
  const [selectedTextItem, setSelectedTextItem] = React.useState<DropDownItem | undefined>();
  const [audioItems, setAudioItems] = React.useState<DropDownItem[] | undefined>();
  const [selectedAudioItem, setSelectedAudioItem] = React.useState<DropDownItem | undefined>();
  const data = [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
    { label: 'Three', value: '3' },
    { label: 'Four', value: '4' },
    { label: 'Five', value: '5' },
  ];

  const dropDownTheme = React.useMemo((): DropDownTheme => {
    return {
      font: nexenTheme?.fonts?.secondaryFont,
      backgroundColor: nexenTheme?.dropdownMenu?.backgroundColor
      || getAlphaColor(nexenTheme?.colors?.secondaryColor!, 0.1),
      headerBackgroundColor: nexenTheme?.dropdownMenu?.headerBackgroundColor
      || getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.7),
      itemBackgroundColor: nexenTheme?.dropdownMenu?.itemBackgroundColor
      || getAlphaColor(nexenTheme?.colors?.primaryColor!, 0.3),
      textColor: nexenTheme?.dropdownMenu?.textColor
      || nexenTheme?.colors?.secondaryTextColor,
      headerTextColor: nexenTheme?.dropdownMenu?.headerTextColor
      || nexenTheme?.colors?.secondaryTextColor,
      itemTextColor: nexenTheme?.dropdownMenu?.itemTextColor
      || nexenTheme?.colors?.secondaryTextColor,
      itemSelectedColor: nexenTheme?.dropdownMenu?.itemSelectedColor
      || nexenTheme?.colors?.accentColor,
      textSize: nexenTheme?.dropdownMenu?.textSize
      || nexenTheme?.sizes?.secondaryTextSize,
      headerTextSize: nexenTheme?.dropdownMenu?.headerTextSize
      || nexenTheme?.sizes?.secondaryTextSize,
      itemTextSize: nexenTheme?.dropdownMenu?.itemTextSize
      || nexenTheme?.sizes?.secondaryTextSize,
      cornerRadius: nexenTheme?.dropdownMenu?.cornerRadius,
    };
  }, [nexenTheme]);

  const containerStyle = {
    left: CONTAINER_HORIZONTAL_PADDING,
    right: CONTAINER_HORIZONTAL_PADDING,
    bottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  }

  const _onTextItemSelect = (item: DropDownItem) => {
    const selectedTrack = {type: selectedTextTrack?.type || 'title', value: item.value}
    onTextTrackSelect?.(selectedTrack);
    setSelectedTextItem(item);
  }

  const _onAudioItemSelect = (item: DropDownItem) => {
    const selectedTrack = {type: selectedAudioTrack?.type || 'title', value: item.value}
    onAudioTrackSelect?.(selectedTrack);
    setSelectedAudioItem(item);
  }

  React.useEffect(() => {
    if (textTracks && textTracks.length > 0) {
      const newItems: DropDownItem[] = [{label: 'None', value: 'none'}];
      textTracks.forEach((item) => {
        newItems.push({label: item.title, value: item.title});
      });
      setTextItems(newItems);
    }
    if (audioTracks && audioTracks.length > 0) {
      const newItems: DropDownItem[] = [{label: 'None', value: 'none'}];
      audioTracks.forEach((item) => {
        newItems.push({label: item.title, value: item.title});
      });
      setAudioItems(newItems);
    }

  }, [textTracks, audioTracks])

  React.useEffect(() => {
    if (textTracks && selectedTextTrack) {
      const selected = textTracks.find((item) => {
        return item[selectedTextTrack.type] === selectedTextTrack.value
      });
      setSelectedTextItem({label: selected?.title || 'None', value: selected?.title || 'none'});
    }

    if (audioTracks && selectedAudioTrack) {
      const selected = audioTracks.find((item) => {
        return item[selectedAudioTrack.type] === selectedAudioTrack.value
      });
      setSelectedAudioItem({label: selected?.title || 'None', value: selected?.title || 'none'});
    }
    
  }, [selectedTextTrack, selectedAudioTrack])


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
            items={textItems}
            selectedItem={selectedTextItem}
            onItemSelect={_onTextItemSelect}
            theme={dropDownTheme}
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
            items={audioItems}
            selectedItem={selectedAudioItem}
            onItemSelect={_onAudioItemSelect}
            theme={dropDownTheme}
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
