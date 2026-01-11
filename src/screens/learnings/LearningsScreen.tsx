import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedPicker from '../../components/ThemedPicker';
import { getAllLearnings, getLearningsByCategory, deleteLearning, updateLearning } from '../../database/repositories/LearningRepository';
import { getDiaryEntryById } from '../../database/repositories/DiaryRepository';
import { Learning, LearningCategory } from '../../database/schema';
import { LEARNING_CATEGORIES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function LearningsScreen() {
    const navigation = useNavigation<any>();
    const [selectedCategory, setSelectedCategory] = useState<LearningCategory | 'all'>('all');
    const [learnings, setLearnings] = useState<Learning[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection mode
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedLearnings, setSelectedLearnings] = useState<Set<string>>(new Set());

    // Edit modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingLearning, setEditingLearning] = useState<Learning | null>(null);
    const [editText, setEditText] = useState('');
    const [editCategory, setEditCategory] = useState<LearningCategory>('personal_life');

    const { theme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        loadLearnings();
    }, [selectedCategory]);

    const loadLearnings = async () => {
        setLoading(true);
        if (selectedCategory === 'all') {
            const all = await getAllLearnings();
            setLearnings(all);
        } else {
            const filtered = await getLearningsByCategory(selectedCategory);
            setLearnings(filtered);
        }
        setLoading(false);
    };

    const handleLearningPress = async (learning: Learning) => {
        if (selectionMode) {
            // Toggle selection
            const newSelected = new Set(selectedLearnings);
            if (newSelected.has(learning.id)) {
                newSelected.delete(learning.id);
            } else {
                newSelected.add(learning.id);
            }
            setSelectedLearnings(newSelected);

            if (newSelected.size === 0) {
                setSelectionMode(false);
            }
        } else {
            // Navigate to diary
            const entry = await getDiaryEntryById(learning.diaryId);
            if (entry) {
                navigation.navigate('DiaryTab', {
                    screen: 'DiaryDetail',
                    params: { entryId: entry.id },
                });
            }
        }
    };

    const handleLongPress = (learning: Learning) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedLearnings(new Set([learning.id]));
        }
    };

    const handleEdit = (learning: Learning) => {
        setEditingLearning(learning);
        setEditText(learning.text);
        setEditCategory(learning.category);
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editingLearning) return;

        try {
            await updateLearning(editingLearning.id, {
                text: editText,
                category: editCategory,
            });
            setEditModalVisible(false);
            setEditingLearning(null);
            await loadLearnings();
        } catch (error) {
            Alert.alert('Error', 'Failed to update learning');
        }
    };

    const handleDeleteSelected = async () => {
        Alert.alert(
            'Delete Learnings',
            `Are you sure you want to delete ${selectedLearnings.size} learning(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            for (const id of selectedLearnings) {
                                await deleteLearning(id);
                            }
                            setSelectionMode(false);
                            setSelectedLearnings(new Set());
                            await loadLearnings();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete learnings');
                        }
                    },
                },
            ]
        );
    };

    const handleCancelSelection = () => {
        setSelectionMode(false);
        setSelectedLearnings(new Set());
    };

    const getCategoryLabel = (category: string) => {
        return LEARNING_CATEGORIES.find(c => c.value === category)?.label || category;
    };

    const renderLearning = ({ item }: { item: Learning }) => {
        const isSelected = selectedLearnings.has(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.learningCard,
                    { backgroundColor: colors.card },
                    isSelected && { borderWidth: 2, borderColor: colors.primary }
                ]}
                onPress={() => handleLearningPress(item)}
                onLongPress={() => handleLongPress(item)}
                activeOpacity={0.7}
            >
                {selectionMode && (
                    <View style={styles.checkboxContainer}>
                        <View style={[
                            styles.checkbox,
                            { borderColor: colors.primary },
                            isSelected && { backgroundColor: colors.primary }
                        ]}>
                            {isSelected && (
                                <Ionicons name="checkmark" size={18} color={colors.card} />
                            )}
                        </View>
                    </View>
                )}
                <Text style={[styles.learningText, { color: colors.text }]}>{item.text}</Text>
                <View style={styles.learningFooter}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{getCategoryLabel(item.category)}</Text>
                    {!selectionMode && (
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Ionicons name="create-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                {selectionMode ? (
                    <>
                        <TouchableOpacity onPress={handleCancelSelection}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerText, { color: colors.text }]}>
                            {selectedLearnings.size} selected
                        </Text>
                        <TouchableOpacity
                            onPress={handleDeleteSelected}
                            disabled={selectedLearnings.size === 0}
                        >
                            <Ionicons
                                name="trash"
                                size={24}
                                color={selectedLearnings.size > 0 ? colors.danger : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Learnings</Text>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categoriesContent}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryChip,
                        { backgroundColor: colors.card },
                        selectedCategory === 'all' && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setSelectedCategory('all')}
                >
                    <Text
                        style={[
                            styles.categoryChipText,
                            { color: colors.text },
                            selectedCategory === 'all' && { color: colors.card },
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>

                {LEARNING_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.value}
                        style={[
                            styles.categoryChip,
                            { backgroundColor: colors.card },
                            selectedCategory === cat.value && { backgroundColor: colors.primary },
                        ]}
                        onPress={() => setSelectedCategory(cat.value)}
                    >
                        <Ionicons
                            name={cat.icon as any}
                            size={16}
                            color={selectedCategory === cat.value ? colors.card : colors.text}
                        />
                        <Text
                            style={[
                                styles.categoryChipText,
                                { color: colors.text },
                                selectedCategory === cat.value && { color: colors.card },
                            ]}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                </View>
            ) : learnings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="bulb-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No learnings yet</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        Learnings will appear here after you save diary entries
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={learnings}
                    renderItem={renderLearning}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Edit Modal */}
            <Modal visible={editModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Learning</Text>

                        <TextInput
                            style={[styles.modalInput, { backgroundColor: colors.input, color: colors.text }]}
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            placeholder="Learning text..."
                            placeholderTextColor={colors.textSecondary}
                        />

                        <ThemedPicker
                            selectedValue={editCategory}
                            onValueChange={setEditCategory}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.card }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.card }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        marginLeft: 16,
    },
    categoriesScroll: {
        maxHeight: 50,
        marginBottom: 16,
    },
    categoriesContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    listContent: {
        padding: 20,
    },
    learningCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        position: 'relative',
    },
    checkboxContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    learningText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    learningFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalInput: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    picker: {
        height: 50,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
