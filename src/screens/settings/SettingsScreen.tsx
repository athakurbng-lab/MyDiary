import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiKeyManagementModal from './ApiKeyManagementModal';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
    const [apiModalVisible, setApiModalVisible] = useState(false);
    const { theme, isDark, toggleTheme } = useTheme();
    const { colors } = theme;

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

                <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                    <View style={styles.settingLeft}>
                        <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.primary} />
                        <View style={styles.settingTextContainer}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                {isDark ? 'Dark mode is on' : 'Light mode is on'}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={colors.white}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AI Configuration</Text>

                <TouchableOpacity
                    style={[styles.settingItem, { backgroundColor: colors.card }]}
                    onPress={() => setApiModalVisible(true)}
                >
                    <View style={styles.settingLeft}>
                        <Ionicons name="key" size={24} color={colors.primary} />
                        <View style={styles.settingTextContainer}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>Manage API Keys</Text>
                            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                Add or remove Gemini API keys
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

                <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="information-circle" size={24} color={colors.primary} />
                        <View style={styles.settingTextContainer}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>MyDiary</Text>
                            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                AI-Powered Smart Diary App v1.0.0
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <ApiKeyManagementModal
                visible={apiModalVisible}
                onClose={() => setApiModalVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        padding: 20,
        paddingTop: 60,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingVertical: 8,
        textTransform: 'uppercase',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },
});
