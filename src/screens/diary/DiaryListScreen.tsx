import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { DiaryStackParamList } from '../../navigation/DiaryStack';
import { getAllDiaryEntries, getDiaryEntryByDate, deleteDiaryEntriesCascade } from '../../database/repositories/DiaryRepository';
import { DiaryEntry } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';
import { useTheme } from '../../context/ThemeContext';

type NavigationProp = StackNavigationProp<DiaryStackParamList, 'DiaryList'>;

export default function DiaryListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    // Selection mode state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

    const { theme } = useTheme();
    const { colors } = theme;

    const loadEntries = async () => {
        setLoading(true);
        const allEntries = await getAllDiaryEntries();
        setEntries(allEntries);
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadEntries();
        }, [])
    );

    // Create marked dates object for calendar
    const markedDates = entries.reduce((acc, entry) => {
        acc[entry.date] = { marked: true, dotColor: colors.primary };
        return acc;
    }, {} as any);

    if (selectedDate) {
        markedDates[selectedDate] = {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: colors.primary,
        };
    }

    const handleDayPress = async (day: any) => {
        const dateStr = day.dateString;
        setSelectedDate(dateStr);

        const entry = await getDiaryEntryByDate(dateStr);
        if (entry) {
            navigation.navigate('DiaryDetail', { entryId: entry.id });
        } else {
            navigation.navigate('DiaryEntry', { date: dateStr });
        }
    };

    const handleLongPress = (entryId: string) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedEntries(new Set([entryId]));
        }
    };

    const handlePress = (entryId: string) => {
        if (selectionMode) {
            const newSelected = new Set(selectedEntries);
            if (newSelected.has(entryId)) {
                newSelected.delete(entryId);
            } else {
                newSelected.add(entryId);
            }
            setSelectedEntries(newSelected);

            // Exit selection mode if nothing selected
            if (newSelected.size === 0) {
                setSelectionMode(false);
            }
        } else {
            navigation.navigate('DiaryDetail', { entryId });
        }
    };

    const handleCancelSelection = () => {
        setSelectionMode(false);
        setSelectedEntries(new Set());
    };

    const handleDeleteSelected = () => {
        Alert.alert(
            'Delete Entries',
            `Are you sure you want to delete ${selectedEntries.size} ${selectedEntries.size === 1 ? 'entry' : 'entries'}? This will also delete all related learnings and suggestions.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDiaryEntriesCascade(Array.from(selectedEntries));
                            setSelectionMode(false);
                            setSelectedEntries(new Set());
                            await loadEntries();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete entries');
                        }
                    },
                },
            ]
        );
    };

    const renderEntry = ({ item }: { item: DiaryEntry }) => {
        const isSelected = selectedEntries.has(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.entryCard,
                    { backgroundColor: colors.card },
                    isSelected && { borderWidth: 2, borderColor: colors.primary }
                ]}
                onPress={() => handlePress(item.id)}
                onLongPress={() => handleLongPress(item.id)}
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
                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.entryImage}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.entryContent}>
                    <Text style={[styles.entryDate, { color: colors.primary }]}>{formatDate(item.date)}</Text>
                    <Text style={[styles.entryText, { color: colors.text }]}>
                        {item.finalText}
                    </Text>
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {selectedEntries.size} selected
                        </Text>
                        <TouchableOpacity
                            onPress={handleDeleteSelected}
                            disabled={selectedEntries.size === 0}
                        >
                            <Ionicons
                                name="trash"
                                size={24}
                                color={selectedEntries.size > 0 ? colors.danger : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>My Diary</Text>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                style={[styles.calendarButton, { backgroundColor: showCalendar ? colors.primary : colors.card }]}
                                onPress={() => setShowCalendar(!showCalendar)}
                            >
                                <Ionicons
                                    name="calendar"
                                    size={24}
                                    color={showCalendar ? colors.card : colors.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('DiaryEntry', {})}
                            >
                                <Ionicons name="add" size={28} color={colors.card} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            {showCalendar && !selectionMode && (
                <View style={styles.calendarContainer}>
                    <Calendar
                        markedDates={markedDates}
                        onDayPress={handleDayPress}
                        theme={{
                            backgroundColor: colors.background,
                            calendarBackground: colors.card,
                            textSectionTitleColor: colors.text,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: colors.card,
                            todayTextColor: colors.primary,
                            dayTextColor: colors.text,
                            textDisabledColor: colors.textSecondary,
                            dotColor: colors.primary,
                            selectedDotColor: colors.card,
                            arrowColor: colors.primary,
                            monthTextColor: colors.text,
                            indicatorColor: colors.primary,
                        }}
                    />
                </View>
            )}

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                </View>
            ) : entries.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No diary entries yet</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap + to create your first entry</Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
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
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    calendarButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
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
    entryCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
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
    entryImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    entryContent: {
        padding: 16,
    },
    entryDate: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    entryText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
