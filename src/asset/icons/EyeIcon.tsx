import Svg, { Circle, Path } from 'react-native-svg';

type EyeIconProps = {
  crossed?: boolean;
  size?: number;
  color?: string;
};

export default function EyeIcon({
  crossed = false,
  size = 20,
  color = '#64765E',
}: EyeIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      accessible={false}
    >
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <Circle cx={12} cy={12} r={3} />
      {crossed && <Path d="m3 3 18 18" />}
    </Svg>
  );
}
