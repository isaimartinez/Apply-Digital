import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import { notificationService } from '@/services/notifications';
import { backgroundFetchService } from '@/services/background-fetch';
import { hackerNewsAPI } from '@/services/api';
import { storageService } from '@/services/storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TestNotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  const handleRequestPermission = async () => {
    try {
      addLog('Requesting notification permission...');
      const granted = await notificationService.requestPermissions();
      addLog(`Permission ${granted ? 'GRANTED ✅' : 'DENIED ❌'}`);
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleCheckPermission = async () => {
    try {
      const hasPermission = await notificationService.checkPermissionStatus();
      addLog(`Current permission status: ${hasPermission ? 'GRANTED ✅' : 'DENIED ❌'}`);
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      addLog('Sending test notification...');
      const mockArticle = {
        objectID: 'test-123',
        title: 'Test Article',
        author: 'Test Author',
        created_at: new Date().toISOString(),
        url: 'https://news.ycombinator.com',
        story_text: null,
        story_title: 'This is a test notification!',
        story_url: 'https://news.ycombinator.com',
      };

      const notificationId = await notificationService.scheduleNewArticleNotification(mockArticle);
      addLog(`Notification sent! ID: ${notificationId}`);
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleManualBackgroundFetch = async () => {
    try {
      addLog('Starting manual background fetch...');

      const preferences = await storageService.getUserPreferences();
      addLog(`User preferences: ${JSON.stringify(preferences)}`);

      if (!preferences.notificationsEnabled) {
        addLog('Notifications are disabled in preferences');
        return;
      }

      const cachedArticles = await storageService.getArticles();
      const cachedIds = new Set(cachedArticles.map(a => a.objectID));
      addLog(`Cached articles: ${cachedIds.size}`);

      let totalNewArticles = 0;
      for (const topic of preferences.selectedTopics) {
        addLog(`Fetching articles for topic: ${topic}...`);
        const response = await hackerNewsAPI.fetchArticles(topic);
        const newArticles = response.hits.filter(article => !cachedIds.has(article.objectID));

        addLog(`Found ${newArticles.length} new articles for "${topic}"`);
        totalNewArticles += newArticles.length;

        if (newArticles.length > 0) {
          // Send notification for first new article
          await notificationService.scheduleNewArticleNotification(newArticles[0]);
          addLog(`Notification sent for: ${newArticles[0].title || newArticles[0].story_title}`);
        }
      }

      addLog(`✅ Background fetch complete! Found ${totalNewArticles} new articles`);
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const handleCheckBackgroundFetch = async () => {
    try {
      const status = await backgroundFetchService.getStatus();
      const isRegistered = await backgroundFetchService.isRegistered();

      addLog(`Background fetch registered: ${isRegistered ? 'YES ✅' : 'NO ❌'}`);
      addLog(`Background fetch status: ${status}`);
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Test Notifications</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      {!Device.isDevice && (
        <View style={[styles.warning, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#856404" />
          <Text style={[styles.warningText, { color: '#856404' }]}>
            Notifications require a physical device. Testing on simulator will show errors.
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Tests</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>1. Request Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleCheckPermission}
          >
            <Text style={styles.buttonText}>2. Check Permission Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleSendTestNotification}
          >
            <Text style={styles.buttonText}>3. Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Background Fetch Tests</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleCheckBackgroundFetch}
          >
            <Text style={styles.buttonText}>Check Background Fetch Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9500' }]}
            onPress={handleManualBackgroundFetch}
          >
            <Text style={styles.buttonText}>🔥 Run Manual Background Fetch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.logHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Logs</Text>
            <TouchableOpacity onPress={handleClearLogs}>
              <Text style={[styles.clearButton, { color: colors.tint }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.logsContainer, { backgroundColor: colors.background, borderColor: colors.icon }]}>
            {logs.length === 0 ? (
              <Text style={[styles.logText, { color: colors.icon }]}>No logs yet...</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={[styles.logText, { color: colors.text }]}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  warning: {
    flexDirection: 'row',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
