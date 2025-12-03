import { SwipeableArticleItem } from '@/components/swipeable-article-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useArticlesStore } from '@/store/articles';
import { Article } from '@/types/article';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArticlesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    loading,
    error,
    fetchArticles,
    loadFromStorage,
    toggleFavorite,
    deleteArticle,
    articleStates,
    articles,
  } = useArticlesStore();

  const visibleArticles = articles.filter(article => {
    const state = articleStates[article.objectID];
    return !state?.isDeleted;
  });

  useEffect(() => {
    console.log('ArticlesScreen: Initial load started');
    loadFromStorage().then(() => {
      console.log('ArticlesScreen: Storage loaded, fetching articles...');
      fetchArticles().then(() => {
        console.log('ArticlesScreen: Fetch completed');
      }).catch((err) => {
        console.error('ArticlesScreen: Fetch error:', err);
      });
    });
  }, []);

  const handleRefresh = () => {
    fetchArticles();
  };

  const handleArticlePress = (article: Article) => {
    console.log('Article pressed:', {
      id: article.objectID,
      title: article.story_title || article.title,
      story_url: article.story_url,
      url: article.url,
    });

    const url = article.story_url || article.url || `https://news.ycombinator.com/item?id=${article.objectID}`;

    console.log('Navigating to:', url);
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

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Failed to load articles
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No articles available
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.icon }]}>
          Pull to refresh
        </Text>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.icon }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Hacker News Articles
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <IconSymbol name="gear" size={24} color={colors.tint} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={visibleArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.objectID}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={visibleArticles.length === 0 ? styles.emptyList : undefined}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
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
  },
  emptySubtext: {
    fontSize: 14,
  },
});
