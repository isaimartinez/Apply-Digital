import React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useArticlesStore } from '@/store/articles';
import { ArticleItem } from '@/components/article-item';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Article } from '@/types/article';

export default function DeletedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    restoreArticle,
    toggleFavorite,
    getDeletedArticles,
    articleStates,
  } = useArticlesStore();

  const deletedArticles = getDeletedArticles();

  const handleArticlePress = (article: Article) => {
    const url = article.story_url || article.url;
    if (url) {
      router.push({
        pathname: '/article/[id]',
        params: { id: article.objectID, url },
      });
    }
  };

  const handleRestore = (articleId: string) => {
    restoreArticle(articleId);
  };

  const handleToggleFavorite = (articleId: string) => {
    toggleFavorite(articleId);
  };

  const renderArticle = ({ item }: { item: Article }) => {
    const state = articleStates[item.objectID];

    return (
      <ArticleItem
        article={item}
        onPress={() => handleArticlePress(item)}
        onToggleFavorite={() => handleToggleFavorite(item.objectID)}
        isFavorite={state?.isFavorite || false}
        showRestoreButton
        onRestore={() => handleRestore(item.objectID)}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No deleted articles
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.icon }]}>
        Deleted articles will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Deleted Articles
        </Text>
      </View>

      <FlatList
        data={deletedArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.objectID}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={deletedArticles.length === 0 ? styles.emptyList : undefined}
      />
    </SafeAreaView>
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
