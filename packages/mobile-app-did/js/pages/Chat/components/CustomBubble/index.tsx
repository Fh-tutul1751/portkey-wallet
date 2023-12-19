import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleProps } from 'react-native-gifted-chat';
import { Bubble } from 'react-native-gifted-chat';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import { ChatMessage } from 'pages/Chat/types';
import { TextS } from 'components/CommonText';

export default function CustomBubble(props: BubbleProps<ChatMessage> & { isGroupChat?: boolean }) {
  const { isGroupChat, currentMessage, previousMessage, user } = props || {};
  const { messageType } = currentMessage || {};

  // not red packets
  const isGeneralMessage = currentMessage?.messageType !== 'REDPACKAGE-CARD';

  const isHideName = useMemo(
    () => currentMessage?.user?._id === previousMessage?.user?._id || user?._id === currentMessage?.user?._id,
    [currentMessage?.user?._id, previousMessage?.user?._id, user?._id],
  );

  return (
    <View>
      {isGroupChat && !isHideName && (
        <TextS numberOfLines={1} style={styles.memberName}>
          {currentMessage?.fromName}
        </TextS>
      )}
      <Bubble
        touchableProps={{ disabled: true }}
        wrapperStyle={useMemo(
          () => ({
            left: [
              styles.wrapperStyle,
              styles.wrapLeft,
              !isGeneralMessage && styles.redPacketWrapStyle,
              messageType === 'NOT_SUPPORTED' && styles.notSupportStyle,
            ],
            right: [
              styles.wrapperStyle,
              styles.wrapRight,
              !isGeneralMessage && styles.redPacketWrapStyle,
              messageType === 'NOT_SUPPORTED' && styles.notSupportStyle,
            ],
          }),
          [isGeneralMessage, messageType],
        )}
        containerToNextStyle={{
          left: [styles.containerToNextLeftStyle, !isGeneralMessage && styles.redPacketContainerToNextStyle],
          right: [styles.containerToNextRightStyle, !isGeneralMessage && styles.redPacketContainerToNextStyle],
        }}
        containerStyle={{
          left: styles.containerStyle,
          right: styles.containerStyle,
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperStyle: {
    borderRadius: pTd(16),
    color: defaultColors.font5,
  },
  redPacketWrapStyle: {
    borderRadius: pTd(12),
    backgroundColor: 'transparent',
  },
  wrapLeft: {
    backgroundColor: defaultColors.bg18,
    borderTopLeftRadius: pTd(2),
    marginLeft: -pTd(8),
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
  },
  wrapRight: {
    backgroundColor: defaultColors.bg9,
    borderTopRightRadius: pTd(2),
    marginRight: 0,
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
  },
  redPacketContainerToNextStyle: {
    borderBottomRightRadius: pTd(12),
    borderBottomLeftRadius: pTd(12),
    borderTopRightRadius: pTd(12),
    borderTopLeftRadius: pTd(12),
  },
  containerToNextRightStyle: {
    borderBottomRightRadius: pTd(16),
  },
  containerToNextLeftStyle: {
    borderTopLeftRadius: pTd(2),
    borderBottomLeftRadius: pTd(16),
  },
  containerStyle: {
    marginHorizontal: pTd(4),
  },
  notSupportStyle: {
    backgroundColor: defaultColors.bg18,
  },
  memberName: {
    color: defaultColors.font7,
    marginBottom: pTd(2),
    marginLeft: -pTd(4),
  },
});
