import React, { useCallback, useMemo, useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Carousel from 'rn-teaset/components/Carousel/Carousel';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import { screenWidth } from '@portkey-wallet/utils/mobile/device';
import { useDiscoverJumpWithNetWork } from 'hooks/discover';
import PortkeySkeleton from 'components/PortkeySkeleton';
import Svg from 'components/Svg';

const DEFAULT_CAROUSEL_IMAGE_RATIO = 375.0 / 125.0;

export interface CarouselItemProps {
  imgUrl: string;
  url: string;
}

export interface CarouselProps {
  containerStyle?: StyleProp<ViewStyle>;
  imageMarginHorizontal?: number;
  imageRatio?: number; // image 'width / height'
  showImageBorderRadius?: boolean;
  showDivider?: boolean;
  items: CarouselItemProps[];
  onClick?: ({ index, item }: { index: number; item: CarouselItemProps }) => void;
}

const CarouselComponent: React.FC<CarouselProps> = ({
  containerStyle,
  items,
  onClick,
  imageMarginHorizontal = 0,
  imageRatio = DEFAULT_CAROUSEL_IMAGE_RATIO,
  showImageBorderRadius = false,
  showDivider = false,
}) => {
  const jumpToWebview = useDiscoverJumpWithNetWork();
  const [showSkeleton, setShowSkeleton] = useState(true);

  const onPress =
    ({ index, item }: { index: number; item: CarouselItemProps }) =>
    () => {
      if (onClick) {
        onClick({ index, item });
      } else {
        jumpToWebview({
          item: {
            name: item.url,
            url: item.url,
          },
        });
      }
    };

  const onImageLoadEnd = useCallback(() => {
    setShowSkeleton(false);
  }, []);

  const imageWidth = useMemo(() => {
    return screenWidth - imageMarginHorizontal * 2;
  }, [imageMarginHorizontal]);
  const imageHeight = useMemo(() => {
    return imageWidth / imageRatio;
  }, [imageRatio, imageWidth]);
  const containerHeight = useMemo(() => {
    return imageHeight;
  }, [imageHeight]);
  const imageBorderRadius = useMemo(() => {
    return showImageBorderRadius ? pTd(12) : 0;
  }, [showImageBorderRadius]);
  return (
    <View style={[styles.container, { height: containerHeight }, containerStyle, showDivider && styles.divider]}>
      <Carousel
        style={styles.carouselWrap}
        control={
          items.length > 1 && (
            <Carousel.Control
              style={styles.dotRow}
              dot={<View style={styles.dotStyle} />}
              activeDot={<View style={[styles.dotStyle, styles.activeDotStyle]} />}
            />
          )
        }
        carousel={items.length > 1}>
        {items.map((item, index) => {
          return (
            <TouchableOpacity
              style={{ marginHorizontal: imageMarginHorizontal }}
              key={index}
              onPress={onPress({ index, item })}
              activeOpacity={1}>
              <Image
                style={[styles.image, { height: imageHeight, borderRadius: imageBorderRadius }]}
                source={{ uri: item.imgUrl }}
                resizeMode="stretch"
                onLoadEnd={onImageLoadEnd}
              />
            </TouchableOpacity>
          );
        })}
      </Carousel>
      {showSkeleton && (
        <View style={[styles.skeletonWrap, showDivider && styles.divider]}>
          <PortkeySkeleton
            style={{ marginHorizontal: imageMarginHorizontal, borderRadius: imageBorderRadius }}
            width={imageWidth}
            height={imageHeight}
          />
          <View style={[styles.skeletonImageWrap, { height: imageHeight }]}>
            <Svg icon="image-loading" size={pTd(32)} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
  },
  carouselWrap: {
    width: '100%',
    height: '100%',
  },
  skeletonWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  skeletonImageWrap: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    borderBottomColor: defaultColors.neutralDivider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: defaultColors.neutralDivider,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: '100%',
    overflow: 'hidden',
  },
  dotRow: {
    paddingBottom: 8,
  },
  activeDotStyle: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: defaultColors.neutralSecondaryTextColor,
  },
  dotStyle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: defaultColors.neutralDisableText,
    marginHorizontal: 1,
  },
});

export default CarouselComponent;
