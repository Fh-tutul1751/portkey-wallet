import React, { memo, useCallback, useMemo, useState } from 'react';
import { MessageProps, Time } from 'react-native-gifted-chat';
import { GestureResponderEvent, StyleSheet, Image, View } from 'react-native';
import CacheImage from 'components/CacheImage';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import Touchable from 'components/Touchable';
import ChatOverlay from '../../ChatOverlay';
import { ChatMessage } from 'pages/Chat/types';
import { formatImageSize } from '@portkey-wallet/utils/img';
import { useChatsDispatch, useCurrentChannelId } from 'pages/Chat/context/hooks';
import { useDeleteMessage } from '@portkey-wallet/hooks/hooks-ca/im';
import isEqual from 'lodash/isEqual';
import CommonToast from 'components/CommonToast';
import Broken_Image from 'assets/image/pngs/broken-image.png';
import { ListItemType } from '../../ChatOverlay/chatPopover';
import Svg from 'components/Svg';
import { setReplyMessageInfo } from 'pages/Chat/context/chatsContext';
import { useIMPin } from '@portkey-wallet/hooks/hooks-ca/im/pin';

const maxWidth = pTd(280);
const maxHeight = pTd(280);

const min = pTd(100);

function MessageImage(
  props: MessageProps<ChatMessage> & {
    isGroupChat?: boolean;
    isAdmin?: boolean;
    isHidePinStyle?: boolean;
    isHideReply?: boolean;
  },
) {
  const { currentMessage, position, isGroupChat = false, isAdmin = false, isHidePinStyle = false, isHideReply } = props;
  const { imageInfo } = currentMessage || {};

  const { imgUri, thumbUri, width, height } = imageInfo || {};
  const dispatch = useChatsDispatch();
  const currentChannelId = useCurrentChannelId();
  const { pin, unPin } = useIMPin(currentChannelId || '');
  const deleteMessage = useDeleteMessage(currentChannelId || '');

  const [loadError, setLoadError] = useState(false);

  const isPinned = useMemo(() => !isHidePinStyle && currentMessage?.pinInfo, [currentMessage?.pinInfo, isHidePinStyle]);

  const radiusStyle = useMemo(
    () => (position === 'left' ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 }),
    [position],
  );
  const img = useMemo(() => {
    const imageSize = formatImageSize({ width, height, maxWidth, maxHeight, minWidth: min, minHeight: min });

    return (
      <CacheImage
        style={[styles.image, imageSize, radiusStyle]}
        resizeMode="contain"
        originUri={imgUri}
        source={{ uri: thumbUri }}
        onError={() => setLoadError(true)}
      />
    );
  }, [height, imgUri, radiusStyle, thumbUri, width]);

  const errorImg = useMemo(() => {
    return <Image style={[styles.brokenImage, radiusStyle]} resizeMode="contain" source={Broken_Image} />;
  }, [radiusStyle]);

  const onPreviewImage = useCallback(
    (event: GestureResponderEvent) => {
      if (loadError) return;

      const { pageX, pageY } = event.nativeEvent;
      ChatOverlay.showPreviewImage({
        source: { uri: imgUri },
        thumb: { uri: thumbUri },
        width,
        height,
        customBounds: { x: pageX, y: pageY, width: 0, height: 0 },
      });
    },
    [height, imgUri, loadError, thumbUri, width],
  );

  const onShowChatPopover = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;

      const list: ListItemType[] = [];

      if (isGroupChat && !isHideReply)
        list.push({
          title: 'Reply',
          iconName: 'chat-reply',
          onPress: async () => {
            dispatch(
              setReplyMessageInfo({
                message: currentMessage,
                messageType: 'img',
              }),
            );
          },
        });

      if (isGroupChat && isAdmin)
        list.push({
          title: currentMessage?.pinInfo ? 'UnPin' : 'Pin',
          iconName: currentMessage?.pinInfo ? 'chat-unpin' : 'chat-pin',
          onPress: async () => {
            if (!currentMessage) return;
            try {
              currentMessage?.pinInfo ? await unPin(currentMessage) : await pin(currentMessage);
            } catch (error) {
              CommonToast.failError(error);
            }
          },
        });

      if (position === 'right')
        list.push({
          title: 'Delete',
          iconName: 'chat-delete',
          onPress: async () => {
            try {
              if (!currentMessage) return;
              await deleteMessage(currentMessage);
            } catch (error) {
              CommonToast.fail('Failed to delete message');
            }
          },
        });

      list.length && ChatOverlay.showChatPopover({ list, px: pageX, py: pageY, formatType: 'dynamicWidth' });
    },
    [currentMessage, deleteMessage, dispatch, isAdmin, isGroupChat, isHideReply, pin, position, unPin],
  );

  return (
    <Touchable onPress={onPreviewImage} onLongPress={onShowChatPopover}>
      {loadError ? errorImg : img}
      {!loadError && (
        <View style={styles.timeBoxStyle}>
          {isPinned && <Svg icon="pin-message" size={pTd(12)} iconStyle={styles.iconStyle} />}
          <Time
            timeFormat="HH:mm"
            timeTextStyle={timeTextStyle}
            containerStyle={timeInnerWrapStyle}
            currentMessage={currentMessage}
          />
        </View>
      )}
    </Touchable>
  );
}

export default memo(MessageImage, (prevProps, nextProps) => {
  return isEqual(prevProps.currentMessage, nextProps.currentMessage);
});

const styles = StyleSheet.create({
  image: {
    borderRadius: pTd(18),
  },
  brokenImage: {
    width: pTd(32),
    height: pTd(32),
    margin: pTd(12),
  },
  textStyles: {
    fontSize: pTd(16),
    lineHeight: pTd(24),
    marginVertical: pTd(4),
    marginHorizontal: pTd(8),
  },
  linkStyle: {
    color: defaultColors.font4,
  },
  timeBoxStyle: {
    position: 'absolute',
    backgroundColor: defaultColors.bg20,
    paddingHorizontal: pTd(8),
    borderRadius: pTd(8),
    opacity: 0.8,
    bottom: pTd(8),
    right: pTd(8),
    height: pTd(16),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    marginRight: pTd(4),
  },
  timeInnerWrap: {
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  timeTextStyle: {
    color: defaultColors.font2,
    fontSize: pTd(10),
    lineHeight: pTd(16),
  },
});

const timeInnerWrapStyle = {
  left: styles.timeInnerWrap,
  right: styles.timeInnerWrap,
};

const timeTextStyle = {
  left: styles.timeTextStyle,
  right: styles.timeTextStyle,
};
