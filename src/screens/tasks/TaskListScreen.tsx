import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllTasks, updateTask, deleteTask } from '../../database/repositories/TaskRepository';
import { Task } from '../../database/schema';
import { formatDateTime } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';

export default function TaskListScreen() {
    const navigation = useNavigation<any>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();
    const { colors } = theme;

    useFocusEffect(
        React.useCallback(() => {
            loadTasks();
        }, [])
    );

    const loadTasks = async () => {
        setLoading(true);
        const allTasks = await getAllTasks();
        setTasks(allTasks);
        setLoading(false);
    };

    const handleToggleComplete = async (task: Task) => {
        await updateTask(task.id, { completed: !task.completed });
        await loadTasks();
    };

    const handleDeleteTask = async (taskId: string) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteTask(taskId);
                    await loadTasks();
                },
            },
        ]);
    };

    const filteredTasks = tasks.filter(t => showCompleted ? t.completed : !t.completed);

    const renderTask = ({ item }: { item: Task }) => (
        <View style={[styles.taskCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleComplete(item)}
            >
                <Ionicons
                    name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={item.completed ? colors.secondary : colors.textSecondary}
                />
            </TouchableOpacity>

            <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: colors.text }, item.completed && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                )}
                <Text style={[styles.taskDeadline, { color: colors.warning }]}>
                    Deadline: {formatDateTime(item.deadline)}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(item.id)}
            >
                <Ionicons name="trash" size={20} color={colors.danger} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Tasks</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('TaskForm')}
                >
                    <Ionicons name="add" size={28} color={colors.card} />
                </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: colors.card }, !showCompleted && { backgroundColor: colors.primary }]}
                    onPress={() => setShowCompleted(false)}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, !showCompleted && { color: colors.card }]}>
                        Pending
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: colors.card }, showCompleted && { backgroundColor: colors.primary }]}
                    onPress={() => setShowCompleted(true)}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, showCompleted && { color: colors.card }]}>
                        Completed
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                </View>
            ) : filteredTasks.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="checkmark-done-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        {showCompleted ? 'No completed tasks' : 'No pending tasks'}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap + to create a new task</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
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
    },
    listContent: {
        padding: 20,
    },
    taskCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    checkbox: {
        marginRight: 12,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        marginBottom: 6,
    },
    taskDeadline: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 4,
    },
});
