import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { DiaryStackParamList } from '../../navigation/DiaryStack';
import { getDiaryEntryById } from '../../database/repositories/DiaryRepository';
import { getLearningsByDiaryId } from '../../database/repositories/LearningRepository';
import { getSuggestionByDiaryId } from '../../database/repositories/SuggestionRepository';
import { DiaryEntry, Learning, Suggestion } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';
import { LEARNING_CATEGORIES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

type RoutePropType = RouteProp<DiaryStackParamList, 'DiaryDetail'>;
type NavigationProp = StackNavigationProp<DiaryStackParamList, 'DiaryDetail'>;

export default function DiaryDetailScreen() {
    const route = useRoute<RoutePropType>();
    const navigation = useNavigation<NavigationProp>();
    const { entryId } = route.params;

    const [entry, setEntry] = useState<DiaryEntry | null>(null);
    const [learnings, setLearnings] = useState<Learning[]>([]);
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        loadEntryData();
    }, [entryId]);

    const loadEntryData = async () => {
        setLoading(true);
        const diaryEntry = await getDiaryEntryById(entryId);
        const diaryLearnings = await getLearningsByDiaryId(entryId);
        const diarySuggestion = await getSuggestionByDiaryId(entryId);

        setEntry(diaryEntry);
        setLearnings(diaryLearnings);
        setSuggestion(diarySuggestion);
        setLoading(false);
    };

    const getCategoryLabel = (category: string) => {
        return LEARNING_CATEGORIES.find(c => c.value === category)?.label || category;
    };

    if (loading || !entry) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {entry.imageUrl && (
                <Image source={{ uri: entry.imageUrl }} style={styles.headerImage} />
            )}

            <View style={styles.content}>
                <Text style={[styles.date, { color: colors.primary }]}>{formatDate(entry.date)}</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Diary Entry</Text>
                    <Text style={[styles.diaryText, { color: colors.text }]}>{entry.finalText}</Text>
                </View>

                {learnings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Learnings</Text>
                        {learnings.map((learning) => (
                            <View key={learning.id} style={[styles.learningCard, { backgroundColor: colors.card }]}>
                                <Text style={[styles.learningText, { color: colors.text }]}>{learning.text}</Text>
                                <Text style={[styles.learningCategory, { color: colors.primary }]}>
                                    {getCategoryLabel(learning.category)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {suggestion && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Suggestions</Text>

                        {suggestion.whatWentWell && (
                            <View style={[styles.suggestionCard, { backgroundColor: colors.card }]}>
                                <View style={styles.suggestionHeader}>
                                    <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
                                    <Text style={[styles.suggestionLabel, { color: colors.text }]}>What Went Well</Text>
                                </View>
                                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.whatWentWell}</Text>
                            </View>
                        )}

                        {suggestion.whatWentWrong && (
                            <View style={[styles.suggestionCard, { backgroundColor: colors.card }]}>
                                <View style={styles.suggestionHeader}>
                                    <Ionicons name="close-circle" size={18} color={colors.danger} />
                                    <Text style={[styles.suggestionLabel, { color: colors.text }]}>What Went Wrong</Text>
                                </View>
                                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.whatWentWrong}</Text>
                            </View>
                        )}

                        {suggestion.improvements && (
                            <View style={[styles.suggestionCard, { backgroundColor: colors.card }]}>
                                <View style={styles.suggestionHeader}>
                                    <Ionicons name="bulb" size={18} color={colors.primary} />
                                    <Text style={[styles.suggestionLabel, { color: colors.text }]}>Improvements</Text>
                                </View>
                                <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.improvements}</Text>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('DiaryEntry', { entryId: entry.id })}
                >
                    <Ionicons name="create" size={20} color={colors.card} />
                    <Text style={[styles.editButtonText, { color: colors.card }]}>Edit Diary</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    headerImage: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    content: {
        padding: 20,
    },
    date: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    diaryText: {
        fontSize: 16,
        lineHeight: 24,
    },
    learningCard: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    learningText: {
        fontSize: 14,
        marginBottom: 6,
    },
    learningCategory: {
        fontSize: 12,
        fontWeight: '600',
    },
    suggestionCard: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    suggestionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
