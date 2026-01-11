import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { DiaryStackParamList } from '../../navigation/DiaryStack';
import { createDiaryEntry, getDiaryEntryById, updateDiaryEntry, getDiaryEntryByDate } from '../../database/repositories/DiaryRepository';
import { paraphraseDiary } from '../../services/ai/paraphrasing';
import { generateSuggestions } from '../../services/ai/suggestions';
import { extractLearnings } from '../../services/ai/learningExtraction';
import { compareDiaryProgress } from '../../services/ai/progressComparison';
import { generateDiaryImage } from '../../services/ai/imageGeneration';
import { createSuggestion } from '../../database/repositories/SuggestionRepository';
import { createLearning } from '../../database/repositories/LearningRepository';
import { getRecentDiaryEntries } from '../../database/repositories/DiaryRepository';
import { createProgressScore, getCurrentCumulativeScores, upsertProgressScore } from '../../database/repositories/ProgressRepository';
import { getTodayDate } from '../../utils/dateUtils';
import LearningApprovalModal from './LearningApprovalModal';
import SuggestionsModal from './SuggestionsModal';
import { useTheme } from '../../context/ThemeContext';

type NavigationProp = StackNavigationProp<DiaryStackParamList, 'DiaryEntry'>;
type RoutePropType = RouteProp<DiaryStackParamList, 'DiaryEntry'>;

export default function DiaryEntryScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const { date, entryId } = route.params || {};

    const [originalText, setOriginalText] = useState('');
    const [paraphrasedText, setParaphrasedText] = useState('');
    const [finalText, setFinalText] = useState('');
    const [isParaphrasing, setIsParaphrasing] = useState(false);
    const [hasParaphrased, setHasParaphrased] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    const [learningModalVisible, setLearningModalVisible] = useState(false);
    const [suggestionsModalVisible, setSuggestionsModalVisible] = useState(false);
    const [extractedLearnings, setExtractedLearnings] = useState<any[]>([]);
    const [generatedSuggestions, setGeneratedSuggestions] = useState<any>(null);
    const [savedDiaryId, setSavedDiaryId] = useState<string>('');

    const { theme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        if (entryId) {
            loadExistingEntry();
        }
    }, [entryId]);

    const loadExistingEntry = async () => {
        if (!entryId) return;
        const entry = await getDiaryEntryById(entryId);
        if (entry) {
            setOriginalText(entry.originalText);
            setParaphrasedText(entry.paraphrasedText);
            setFinalText(entry.finalText);
            setHasParaphrased(true);
        }
    };

    const handleParaphrase = async () => {
        if (!originalText.trim()) {
            Alert.alert('Error', 'Please write something in your diary first');
            return;
        }

        setIsParaphrasing(true);
        try {
            const paraphrased = await paraphraseDiary(originalText);
            setParaphrasedText(paraphrased);
            setFinalText(paraphrased);
            setHasParaphrased(true);
            setShowComparison(true);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to paraphrase diary. Please check your API keys.');
        } finally {
            setIsParaphrasing(false);
        }
    };

    const handleSaveDiary = async () => {
        if (!hasParaphrased) {
            Alert.alert('Notice', 'Please improve your writing first before saving');
            return;
        }

        if (!finalText.trim()) {
            Alert.alert('Error', 'Diary cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const diaryDate = date || getTodayDate();

            // Check if entry already exists for this date
            const existing = await getDiaryEntryByDate(diaryDate);
            if (existing && existing.id !== entryId) {
                Alert.alert('Error', 'An entry already exists for this date');
                setIsSaving(false);
                return;
            }

            // Generate image
            const { imageUrl, prompt } = await generateDiaryImage(finalText);

            let diaryId: string;

            if (entryId) {
                // Update existing entry
                await updateDiaryEntry(entryId, {
                    originalText,
                    paraphrasedText,
                    finalText,
                    imageUrl,
                    imagePrompt: prompt,
                });
                diaryId = entryId;
            } else {
                // Create new entry
                const newEntry = await createDiaryEntry({
                    date: diaryDate,
                    originalText,
                    paraphrasedText,
                    finalText,
                    imageUrl,
                    imagePrompt: prompt,
                });
                diaryId = newEntry.id;
            }

            setSavedDiaryId(diaryId);

            // Post-save AI processing
            await processPostSave(diaryId, finalText);

            setIsSaving(false);
        } catch (error: any) {
            setIsSaving(false);
            Alert.alert('Error', error.message || 'Failed to save diary');
        }
    };

    const processPostSave = async (diaryId: string, text: string) => {
        try {
            // 1. Extract learnings
            const learnings = await extractLearnings(text);
            setExtractedLearnings(learnings.map(l => ({ ...l, diaryId })));

            // 2. Generate suggestions
            const suggestions = await generateSuggestions(text);
            setGeneratedSuggestions({ ...suggestions, diaryId });

            // 3. Compare progress
            const recentEntries = await getRecentDiaryEntries(7);
            const pastTexts = recentEntries
                .filter(e => e.id !== diaryId)
                .map(e => e.finalText)
                .slice(0, 5);

            let diaryScore: -1 | 0 | 1 = 0;
            if (pastTexts.length > 0) {
                diaryScore = await compareDiaryProgress(text, pastTexts);
            }

            // Update progress score
            const currentScores = await getCurrentCumulativeScores();
            const newDiaryScore = currentScores.diary + diaryScore;

            await upsertProgressScore({
                date: date || getTodayDate(),
                diaryScore,
                taskScore: 0, // Will be updated by task completion
                cumulativeDiaryScore: newDiaryScore,
                cumulativeTaskScore: currentScores.task,
            });

            // Show learning approval modal
            if (learnings.length > 0) {
                setLearningModalVisible(true);
            } else {
                // If no learnings, show suggestions directly
                setSuggestionsModalVisible(true);
            }
        } catch (error) {
            console.error('Post-save processing error:', error);
            // Don't block the user, just log the error
            navigation.goBack();
        }
    };

    const handleLearningsApproved = async (approvedLearnings: any[]) => {
        // Save approved learnings
        for (const learning of approvedLearnings) {
            await createLearning({
                diaryId: savedDiaryId,
                text: learning.text,
                category: learning.category,
            });
        }

        setLearningModalVisible(false);

        // Show suggestions after learnings are saved
        if (generatedSuggestions) {
            setSuggestionsModalVisible(true);
        } else {
            navigation.goBack();
        }
    };

    const handleSuggestionsClosed = async () => {
        // Save suggestions
        if (generatedSuggestions) {
            await createSuggestion(generatedSuggestions);
        }

        setSuggestionsModalVisible(false);
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.label, { color: colors.text }]}>Write your diary:</Text>
                <TextInput
                    style={[styles.textInput, { backgroundColor: colors.input, color: colors.text }]}
                    placeholder="What happened today?..."
                    placeholderTextColor={colors.textSecondary}
                    value={originalText}
                    onChangeText={setOriginalText}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    editable={!isSaving}
                />

                {!hasParaphrased && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleParaphrase}
                        disabled={isParaphrasing || !originalText.trim()}
                    >
                        {isParaphrasing ? (
                            <ActivityIndicator color={colors.card} />
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color={colors.card} />
                                <Text style={[styles.buttonText, { color: colors.card }]}>Improve Writing</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {hasParaphrased && showComparison && (
                    <>
                        <View style={styles.comparisonContainer}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Original:</Text>
                            <View style={[styles.comparisonBox, { backgroundColor: colors.card }]}>
                                <Text style={[styles.comparisonText, { color: colors.text }]}>{originalText}</Text>
                            </View>

                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Improved:</Text>
                            <TextInput
                                style={[styles.comparisonBox, { backgroundColor: colors.card }, { color: colors.text }]}
                                value={finalText}
                                onChangeText={setFinalText}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.secondary }]}
                            onPress={handleSaveDiary}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={colors.card} />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.card} />
                                    <Text style={[styles.buttonText, { color: colors.card }]}>Save Diary</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <LearningApprovalModal
                visible={learningModalVisible}
                learnings={extractedLearnings}
                onApprove={handleLearningsApproved}
                onSkip={() => {
                    setLearningModalVisible(false);
                    setSuggestionsModalVisible(true);
                }}
            />

            <SuggestionsModal
                visible={suggestionsModalVisible}
                suggestions={generatedSuggestions}
                onClose={handleSuggestionsClosed}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    textInput: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 200,
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    comparisonContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    comparisonBox: {
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
    },
    comparisonText: {
        fontSize: 16,
        lineHeight: 24,
    },
    editableBox: {
        fontSize: 16,
        lineHeight: 24,
    },
});
