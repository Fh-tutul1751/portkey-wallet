import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AvatarProps } from 'react-native-gifted-chat';
import { pTd } from 'utils/unit';
import CommonAvatar from 'components/CommonAvatar';
import { ChatMessage } from 'pages/Chat/types';
import Touchable from 'components/Touchable';
import navigationService from 'utils/navigationService';

export default function CustomChatAvatar(props: AvatarProps<ChatMessage>) {
  const { currentMessage, previousMessage } = props;

  if (currentMessage?.user?._id === previousMessage?.user?._id) {
    return <View style={styles.blank} />;
  }

  return (
    <Touchable
      onPress={() =>
        navigationService.navigate('ChatContactProfile', {
          relationId: currentMessage?.from,
        })
      }>
      <CommonAvatar hasBorder title={currentMessage?.fromName} avatarSize={pTd(40)} style={styles.avatarStyle} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  avatarStyle: {
    marginRight: pTd(4),
  },
  blank: {
    width: pTd(40),
    marginRight: pTd(4),
  },
});
