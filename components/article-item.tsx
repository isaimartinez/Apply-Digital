import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Article } from '@/types/article';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { IconSymbol } from './ui/icon-symbol';

interface ArticleItemProps {
  article: Article;
  onPress: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  showRestoreButton?: boolean;
  onRestore?: () => void;
}

export function ArticleItem({
  article,
  onPress,
  onToggleFavorite,
  isFavorite,
  showRestoreButton,
  onRestore,
}: ArticleItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.icon }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {article.story_title || article.title}
          </Text>
        </View>

        <View style={styles.metadata}>
          <Text style={[styles.author, { color: colors.icon }]}>
            {article.author}
          </Text>
          <Text style={[styles.separator, { color: colors.icon }]}>•</Text>
          <Text style={[styles.time, { color: colors.icon }]}>
            {timeAgo}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {showRestoreButton && onRestore ? (
          <TouchableOpacity onPress={onRestore} style={styles.iconButton}>
            <IconSymbol name="arrow.uturn.backward" size={20} color={colors.tint} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onToggleFavorite} style={styles.iconButton}>
            <IconSymbol
              name={isFavorite ? 'heart.fill' : 'heart'}
              size={20}
              color={isFavorite ? '#FF0000' : colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  actions: {
    justifyContent: 'center',
  },
  iconButton: {
    padding: 4,
  },
});
