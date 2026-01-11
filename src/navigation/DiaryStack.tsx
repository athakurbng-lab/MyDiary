import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DiaryListScreen from '../screens/diary/DiaryListScreen';
import DiaryEntryScreen from '../screens/diary/DiaryEntryScreen';
import DiaryDetailScreen from '../screens/diary/DiaryDetailScreen';
import { useTheme } from '../context/ThemeContext';

export type DiaryStackParamList = {
    DiaryList: undefined;
    DiaryEntry: { date?: string; entryId?: string };
    DiaryDetail: { entryId: string };
};

const Stack = createStackNavigator<DiaryStackParamList>();

export default function DiaryStack() {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="DiaryList"
                component={DiaryListScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DiaryEntry"
                component={DiaryEntryScreen}
                options={{ title: 'Write Diary' }}
            />
            <Stack.Screen
                name="DiaryDetail"
                component={DiaryDetailScreen}
                options={{ title: 'Diary Entry' }}
            />
        </Stack.Navigator>
    );
}
