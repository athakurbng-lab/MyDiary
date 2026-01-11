import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LearningCategory } from '../database/schema';
import { LEARNING_CATEGORIES } from '../utils/constants';

interface ThemedPickerProps {
    selectedValue: LearningCategory;
    onValueChange: (value: LearningCategory) => void;
}

export default function ThemedPicker({ selectedValue, onValueChange }: ThemedPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const { theme } = useTheme();
    const { colors } = theme;

    const selectedLabel = LEARNING_CATEGORIES.find((c: any) => c.value === selectedValue)?.label || 'Select';

    const handleSelect = (value: LearningCategory) => {
        onValueChange(value);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.selector, { backgroundColor: colors.input, borderColor: colors.border }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.selectorText, { color: colors.text }]}>{selectedLabel}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={LEARNING_CATEGORIES}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        selectedValue === item.value && { backgroundColor: colors.primary + '20' }
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={20}
                                        color={selectedValue === item.value ? colors.primary : colors.text}
                                    />
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: selectedValue === item.value ? colors.primary : colors.text }
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {selectedValue === item.value && (
                                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
    },
    selectorText: {
        fontSize: 14,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    optionText: {
        fontSize: 16,
        flex: 1,
    },
});
