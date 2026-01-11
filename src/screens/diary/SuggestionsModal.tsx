import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SuggestionsModalProps {
    visible: boolean;
    suggestions: {
        whatWentWell: string;
        whatWentWrong: string;
        whyItFailed: string;
        improvements: string;
    } | null;
    onClose: () => void;
}

export default function SuggestionsModal({
    visible,
    suggestions,
    onClose,
}: SuggestionsModalProps) {
    if (!suggestions) return null;

    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>AI Suggestions</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Here's what I learned from your day:
                    </Text>

                    <ScrollView style={styles.content}>
                        {suggestions.whatWentWell && (
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>What Went Well</Text>
                                </View>
                                <Text style={[styles.sectionText, { color: colors.text }]}>{suggestions.whatWentWell}</Text>
                            </View>
                        )}

                        {suggestions.whatWentWrong && (
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>What Went Wrong</Text>
                                </View>
                                <Text style={[styles.sectionText, { color: colors.text }]}>{suggestions.whatWentWrong}</Text>
                            </View>
                        )}

                        {suggestions.whyItFailed && (
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="help-circle" size={20} color={colors.warning} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Why It Failed</Text>
                                </View>
                                <Text style={[styles.sectionText, { color: colors.text }]}>{suggestions.whyItFailed}</Text>
                            </View>
                        )}

                        {suggestions.improvements && (
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="bulb" size={20} color={colors.primary} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Improvements</Text>
                                </View>
                                <Text style={[styles.sectionText, { color: colors.text }]}>{suggestions.improvements}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                        <Text style={[styles.closeButtonText, { color: colors.card }]}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    content: {
        maxHeight: 400,
        marginBottom: 16,
    },
    section: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    closeButton: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
