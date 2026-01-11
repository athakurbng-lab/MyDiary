import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAllProgressScores, getCurrentCumulativeScores } from '../../database/repositories/ProgressRepository';
import { ProgressScore } from '../../database/schema';
import { INITIAL_GROWTH_SCORE } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
    const [progressData, setProgressData] = useState<ProgressScore[]>([]);
    const [currentScores, setCurrentScores] = useState({ diary: INITIAL_GROWTH_SCORE, task: INITIAL_GROWTH_SCORE });
    const [showDiaryGraph, setShowDiaryGraph] = useState(true);
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        loadProgressData();
    }, []);

    const loadProgressData = async () => {
        setLoading(true);
        const scores = await getAllProgressScores();
        const current = await getCurrentCumulativeScores();
        setProgressData(scores);
        setCurrentScores(current);
        setLoading(false);
    };

    const getChartData = () => {
        if (progressData.length === 0) {
            return {
                labels: ['Start'],
                datasets: [{
                    data: [INITIAL_GROWTH_SCORE],
                }],
            };
        }

        const last30 = progressData.slice(-30);
        const labels = last30.map((_, index) => `${index + 1}`);
        const data = showDiaryGraph
            ? last30.map(s => s.cumulativeDiaryScore)
            : last30.map(s => s.cumulativeTaskScore);

        return {
            labels,
            datasets: [{ data }],
        };
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.header, { color: colors.text }]}>Progress</Text>

            <View style={styles.scoreContainer}>
                <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Current Score</Text>
                    <Text style={[styles.scoreValue, { color: colors.primary }]}>
                        {showDiaryGraph ? currentScores.diary : currentScores.task}
                    </Text>
                    <Text style={[styles.scoreSubtext, { color: colors.textSecondary }]}>
                        {showDiaryGraph ? 'Daily Life Progress' : 'Task Performance'}
                    </Text>
                </View>
            </View>

            <View style={styles.graphToggle}>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: colors.card }, showDiaryGraph && { backgroundColor: colors.primary }]}
                    onPress={() => setShowDiaryGraph(true)}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, showDiaryGraph && { color: colors.card }]}>
                        Diary Progress
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, { backgroundColor: colors.card }, !showDiaryGraph && { backgroundColor: colors.primary }]}
                    onPress={() => setShowDiaryGraph(false)}
                >
                    <Text style={[styles.toggleText, { color: colors.textSecondary }, !showDiaryGraph && { color: colors.card }]}>
                        Task Progress
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
                </View>
            ) : (
                <View style={styles.chartContainer}>
                    <LineChart
                        data={getChartData()}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: colors.card,
                            backgroundGradientFrom: colors.card,
                            backgroundGradientTo: colors.card,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                            labelColor: (opacity = 1) => colors.text,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: colors.primary,
                            },
                        }}
                        bezier
                        style={styles.chart}
                    />

                    {progressData.length === 0 && (
                        <View style={[styles.emptyOverlay, { backgroundColor: 'rgba(26, 26, 26, 0.8)' }]}>
                            <Text style={[styles.emptyText, { color: colors.text }]}>No progress data yet</Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                Start writing diary entries to track your progress
                            </Text>
                        </View>
                    )}
                </View>
            )}

            <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>How it works:</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    • AI compares each diary entry with your past entries
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    • Better day = +1, Same = 0, Worse = -1
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    • Score updates cumulatively (starts at {INITIAL_GROWTH_SCORE})
                </Text>
            </View>
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
    },
    scoreContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    scoreCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    scoreSubtext: {
        fontSize: 14,
    },
    graphToggle: {
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
    chartContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        position: 'relative',
    },
    chart: {
        borderRadius: 16,
    },
    emptyOverlay: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    infoContainer: {
        paddingHorizontal: 20,
        margin: 20,
        padding: 16,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 6,
    },
});
