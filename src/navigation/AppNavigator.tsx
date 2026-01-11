import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DiaryStack from './DiaryStack';
import LearningsScreen from '../screens/learnings/LearningsScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskFormScreen from '../screens/tasks/TaskFormScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TaskStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TaskList" component={TaskListScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { theme, isDark } = useTheme();
    const { colors } = theme;

    const navigationTheme = isDark ? DarkTheme : DefaultTheme;

    return (
        <NavigationContainer theme={navigationTheme}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'home';

                        if (route.name === 'DiaryTab') {
                            iconName = focused ? 'book' : 'book-outline';
                        } else if (route.name === 'Learnings') {
                            iconName = focused ? 'bulb' : 'bulb-outline';
                        } else if (route.name === 'Progress') {
                            iconName = focused ? 'trending-up' : 'trending-up-outline';
                        } else if (route.name === 'Tasks') {
                            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                        height: 60,
                        paddingBottom: 8,
                    },
                    headerShown: false,
                })}
            >
                <Tab.Screen
                    name="DiaryTab"
                    component={DiaryStack}
                    options={{ tabBarLabel: 'Diary' }}
                />
                <Tab.Screen name="Learnings" component={LearningsScreen} />
                <Tab.Screen name="Progress" component={ProgressScreen} />
                <Tab.Screen name="Tasks" component={TaskStack} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
