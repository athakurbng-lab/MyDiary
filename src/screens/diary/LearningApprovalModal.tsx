import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedPicker from '../../components/ThemedPicker';
import { LearningCategory } from '../../database/schema';
import { LEARNING_CATEGORIES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

interface LearningApprovalModalProps {
    visible: boolean;
    learnings: Array<{ text: string; category: LearningCategory; diaryId: string }>;
    onApprove: (learnings: Array<{ text: string; category: LearningCategory }>) => void;
    onSkip: () => void;
}

export default function LearningApprovalModal({
    visible,
    learnings,
    onApprove,
    onSkip,
}: LearningApprovalModalProps) {
    const [editedLearnings, setEditedLearnings] = useState(learnings);
    const [newLearningText, setNewLearningText] = useState('');
    const [newLearningCategory, setNewLearningCategory] = useState<LearningCategory>('personal_life');

    const { theme } = useTheme();
    const { colors } = theme;

    React.useEffect(() => {
        setEditedLearnings(learnings);
    }, [learnings]);

    const handleUpdateLearning = (index: number, field: 'text' | 'category', value: string) => {
        const updated = [...editedLearnings];
        updated[index] = { ...updated[index], [field]: value };
        setEditedLearnings(updated);
    };

    const handleDeleteLearning = (index: number) => {
        const updated = editedLearnings.filter((_, i) => i !== index);
        setEditedLearnings(updated);
    };

    const handleAddLearning = () => {
        if (!newLearningText.trim()) {
            Alert.alert('Error', 'Please enter learning text');
            return;
        }

        setEditedLearnings([
            ...editedLearnings,
            {
                text: newLearningText,
                category: newLearningCategory,
                diaryId: learnings[0]?.diaryId || '',
            },
        ]);
        setNewLearningText('');
        setNewLearningCategory('personal_life');
    };

    const renderLearning = ({ item, index }: { item: any; index: number }) => (
        <View style={[styles.learningItem, { backgroundColor: colors.card }]}>
            <TextInput
                style={[styles.learningText, { color: colors.text }]}
                value={item.text}
                onChangeText={(text) => handleUpdateLearning(index, 'text', text)}
                multiline
            />

            <View style={styles.learningFooter}>
                <ThemedPicker
                    selectedValue={item.category}
                    onValueChange={(value) => handleUpdateLearning(index, 'category', value)}
                />

                <TouchableOpacity onPress={() => handleDeleteLearning(index)}>
                    <Ionicons name="trash" size={20} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Review Learnings</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Do you want to save these learnings?
                    </Text>

                    <FlatList
                        data={editedLearnings}
                        renderItem={renderLearning}
                        keyExtractor={(_, index) => index.toString()}
                        style={styles.list}
                    />

                    <View style={[styles.addSection, { borderTopColor: colors.border }]}>
                        <Text style={[styles.addTitle, { color: colors.text }]}>Add New Learning:</Text>
                        <TextInput
                            style={[styles.addInput, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder="Enter learning..."
                            placeholderTextColor={colors.textSecondary}
                            value={newLearningText}
                            onChangeText={setNewLearningText}
                            multiline
                        />
                        <ThemedPicker
                            selectedValue={newLearningCategory}
                            onValueChange={setNewLearningCategory}
                        />
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddLearning}>
                            <Ionicons name="add-circle" size={20} color={colors.card} />
                            <Text style={[styles.addButtonText, { color: colors.card }]}>Add Learning</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card }]}
                            onPress={onSkip}
                        >
                            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                            onPress={() => onApprove(editedLearnings)}
                        >
                            <Text style={[styles.saveButtonText, { color: colors.card }]}>Save Learnings</Text>
                        </TouchableOpacity>
                    </View>
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
    list: {
        maxHeight: 250,
        marginBottom: 16,
    },
    learningItem: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    learningText: {
        fontSize: 14,
        marginBottom: 8,
    },
    learningFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    addSection: {
        borderTopWidth: 1,
        paddingTop: 16,
        marginBottom: 16,
    },
    addTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    addInput: {
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        gap: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
