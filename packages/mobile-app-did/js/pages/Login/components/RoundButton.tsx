import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import Svg, { IconName } from 'components/Svg';
import Touchable from 'components/Touchable';
import React from 'react';
import { StyleSheet, TouchableOpacityProps } from 'react-native';
import { ViewStyleType } from 'types/styles';
import { pTd } from 'utils/unit';

export default function RoundButton({
  onPress,
  icon,
  style,
}: {
  icon: IconName;
  style?: ViewStyleType;
  onPress: TouchableOpacityProps['onPress'];
}) {
  return (
    <Touchable onPress={onPress} style={[GStyles.center, styles.container, style]}>
      <Svg icon={icon} size={pTd(20)} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: pTd(48),
    height: pTd(48),
    borderRadius: pTd(24),
    borderWidth: Math.max(pTd(0.5), StyleSheet.hairlineWidth),
    borderColor: defaultColors.border1,
  },
});
