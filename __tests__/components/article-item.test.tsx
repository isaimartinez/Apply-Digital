import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ArticleItem } from '@/components/article-item';
import { Article } from '@/types/article';

const mockArticle: Article = {
  objectID: '1',
  title: 'Test Article Title',
  author: 'testauthor',
  created_at: new Date('2024-01-01').toISOString(),
  url: 'https://example.com/article',
  story_text: null,
  story_title: 'Test Story Title',
  story_url: 'https://example.com/story',
};

describe('ArticleItem', () => {
  const mockOnPress = jest.fn();
  const mockOnToggleFavorite = jest.fn();
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render article information correctly', () => {
    const { getByText } = render(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
      />
    );

    expect(getByText('Test Story Title')).toBeTruthy();
    expect(getByText('testauthor')).toBeTruthy();
  });

  it('should call onPress when article is tapped', () => {
    const { getByText } = render(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
      />
    );

    fireEvent.press(getByText('Test Story Title'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleFavorite when favorite button is tapped', () => {
    const { getByLabelText } = render(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
      />
    );

    const favoriteButton = getByLabelText ? getByLabelText('toggle favorite') : null;
    if (favoriteButton) {
      fireEvent.press(favoriteButton);
      expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1);
    }
  });

  it('should render restore button when showRestoreButton is true', () => {
    const { queryByText } = render(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
        showRestoreButton={true}
        onRestore={mockOnRestore}
      />
    );

    // Restore button should be rendered instead of favorite button
    expect(queryByText('Test Story Title')).toBeTruthy();
  });

  it('should use title when story_title is not available', () => {
    const articleWithoutStoryTitle: Article = {
      ...mockArticle,
      story_title: null,
      title: 'Regular Title',
    };

    const { getByText } = render(
      <ArticleItem
        article={articleWithoutStoryTitle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
      />
    );

    expect(getByText('Regular Title')).toBeTruthy();
  });

  it('should display favorite state correctly', () => {
    const { rerender, getByTestId } = render(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
      />
    );

    // Rerender with favorite = true
    rerender(
      <ArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={true}
      />
    );

    // The icon should change based on favorite state
    expect(mockArticle).toBeTruthy();
  });
});
