import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEFAULT_TOPICS, usePreferencesStore } from '@/store/preferences';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    notificationsEnabled,
    selectedTopics,
    loadPreferences,
    toggleNotifications,
    toggleTopic,
    addTopic,
    removeTopic,
  } = usePreferencesStore();

  const [customTopic, setCustomTopic] = useState('');
  const [isSimulator, setIsSimulator] = useState(false);

  useEffect(() => {
    loadPreferences();
    setIsSimulator(!Device.isDevice);
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleAddCustomTopic = () => {
    if (!customTopic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    if (selectedTopics.includes(customTopic.trim())) {
      Alert.alert('Error', 'Topic already added');
      return;
    }

    addTopic(customTopic.trim());
    setCustomTopic('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.icon }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        {Platform.OS === 'ios' && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.tint} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>

          {isSimulator && (
            <View style={[styles.warningBox, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#856404" />
              <Text style={[styles.warningText, { color: '#856404' }]}>
                Push notifications are not supported on iOS Simulator. Please use a physical device to test this feature.
              </Text>
            </View>
          )}

          <View style={[styles.settingRow, { borderBottomColor: colors.icon }]}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.icon }]}>
                Get notified about new articles
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.icon, true: colors.tint }}
              disabled={isSimulator}
            />
          </View>
        </View>

        {notificationsEnabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Topics of Interest</Text>
            <Text style={[styles.sectionDescription, { color: colors.icon }]}>
              Select topics to receive notifications about
            </Text>

            {DEFAULT_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[styles.topicRow, { borderBottomColor: colors.icon }]}
                onPress={() => toggleTopic(topic)}
              >
                <Text style={[styles.topicLabel, { color: colors.text }]}>{topic}</Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.icon,
                      backgroundColor: selectedTopics.includes(topic)
                        ? colors.tint
                        : 'transparent',
                    },
                  ]}
                >
                  {selectedTopics.includes(topic) && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {selectedTopics
              .filter((topic) => !DEFAULT_TOPICS.includes(topic))
              .map((topic) => (
                <View key={topic} style={[styles.topicRow, { borderBottomColor: colors.icon }]}>
                  <Text style={[styles.topicLabel, { color: colors.text }]}>{topic}</Text>
                  <TouchableOpacity onPress={() => removeTopic(topic)}>
                    <IconSymbol name="trash" size={20} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              ))}

            <View style={styles.addTopicContainer}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
                placeholder="Add custom topic"
                placeholderTextColor={colors.icon}
                value={customTopic}
                onChangeText={setCustomTopic}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={handleAddCustomTopic}
              >
                <IconSymbol name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.icon }]}>
            This app fetches and displays articles from Hacker News using the Algolia API.
          </Text>
          <Text style={[styles.aboutText, { color: colors.icon }]}>Version 1.0.0</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topicLabel: {
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTopicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
