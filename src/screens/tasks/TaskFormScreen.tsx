import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../../database/repositories/TaskRepository';
import { useTheme } from '../../context/ThemeContext';

export default function TaskFormScreen() {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const { theme } = useTheme();
    const { colors } = theme;

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        try {
            await createTask({
                title,
                description,
                deadline: deadline.toISOString(),
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save task');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(deadline);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDeadline(newDate);
            // Show time picker after date is selected
            setTimeout(() => setShowTimePicker(true), 100);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            const newDate = new Date(deadline);
            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            setDeadline(newDate);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
                <Text style={[styles.label, { color: colors.text }]}>Title</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What needs to be done?"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add details..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <Text style={[styles.label, { color: colors.text }]}>Deadline</Text>
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: colors.input, borderColor: colors.border }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                    <Text style={[styles.dateText, { color: colors.text }]}>
                        {deadline.toLocaleString()}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                    />
                )}
            </ScrollView>
        </View>
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
        paddingTop: 60,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        gap: 12,
    },
    dateText: {
        fontSize: 16,
    },
});
