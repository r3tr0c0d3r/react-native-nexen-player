import React from 'react';
import { ColorValue } from 'react-native';
import {Path, Rect, Svg, SvgProps} from 'react-native-svg';

const Subtitle = (props: Props) => {
  const {color, size, ...rest} = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}>
      <Rect x={2} y={4} width={20} height={16} rx={2} ry={2} />
      <Path d="M5 12h3M11 12h8M5 16h8M16 16h3" />
    </Svg>
  );
};

export default Subtitle;

interface Props extends SvgProps {
  color?: ColorValue;
  size?: string | number;
}

Subtitle.defaultProps = {
  color: 'black',
  size: '24',
};
