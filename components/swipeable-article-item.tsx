import { useColorScheme } from '@/hooks/use-color-scheme';
import { Article } from '@/types/article';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ArticleItem } from './article-item';
import { IconSymbol } from './ui/icon-symbol';

interface SwipeableArticleItemProps {
  article: Article;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

export function SwipeableArticleItem({
  article,
  onPress,
  onDelete,
  onToggleFavorite,
  isFavorite,
}: SwipeableArticleItemProps) {
  const colorScheme = useColorScheme();
  const swipeableRef = useRef<Swipeable>(null);

  const handlePress = () => {
    console.log('SwipeableArticleItem: Press detected');
    swipeableRef.current?.close();
    onPress();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <View style={styles.deleteContent}>
          <IconSymbol name="trash" size={24} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onDelete}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <ArticleItem
        article={article}
        onPress={handlePress}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
  },
  deleteContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
