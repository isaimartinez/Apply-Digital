import { SwipeableArticleItem } from '@/components/swipeable-article-item';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useArticlesStore } from '@/store/articles';
import { Article } from '@/types/article';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    toggleFavorite,
    deleteArticle,
    articleStates,
    articles,
  } = useArticlesStore();

  const favoriteArticles = articles.filter(article => {
    const state = articleStates[article.objectID];
    return state?.isFavorite && !state?.isDeleted;
  });

  const handleArticlePress = (article: Article) => {
    const url = article.story_url || article.url || `https://news.ycombinator.com/item?id=${article.objectID}`;

    router.push({
      pathname: '/article/[id]',
      params: { id: article.objectID, url },
    });
  };

  const handleToggleFavorite = (articleId: string) => {
    toggleFavorite(articleId);
  };

  const handleDelete = (articleId: string) => {
    deleteArticle(articleId);
  };

  const renderArticle = ({ item }: { item: Article }) => {
    const state = articleStates[item.objectID];

    return (
      <SwipeableArticleItem
        article={item}
        onPress={() => handleArticlePress(item)}
        onDelete={() => handleDelete(item.objectID)}
        onToggleFavorite={() => handleToggleFavorite(item.objectID)}
        isFavorite={state?.isFavorite || false}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No favorite articles yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.icon }]}>
        Articles you favorite will appear here
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.icon }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Favorite Articles
          </Text>
        </View>

        <FlatList
          data={favoriteArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.objectID}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={favoriteArticles.length === 0 ? styles.emptyList : undefined}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
