import { LearningCategory } from '../database/schema';

export const LEARNING_CATEGORIES: { value: LearningCategory; label: string; icon: string }[] = [
    { value: 'work_career', label: 'Work & Career', icon: 'briefcase' },
    { value: 'studies_academics', label: 'Studies & Academics', icon: 'book' },
    { value: 'personal_life', label: 'Personal Life', icon: 'person' },
    { value: 'emotional_mental_health', label: 'Emotional & Mental Health', icon: 'heart' },
    { value: 'habits_discipline', label: 'Habits & Discipline', icon: 'checkmark-circle' },
    { value: 'health_fitness', label: 'Health & Fitness', icon: 'fitness' },
    { value: 'communication_relationships', label: 'Communication & Relationships', icon: 'people' },
    { value: 'time_management', label: 'Time Management', icon: 'time' },
    { value: 'productivity', label: 'Productivity', icon: 'trending-up' },
    { value: 'finance_responsibility', label: 'Finance & Responsibility', icon: 'cash' },
    { value: 'decision_making', label: 'Decision Making', icon: 'git-branch' },
    { value: 'mistakes_to_avoid', label: 'Mistakes to Avoid', icon: 'warning' },
    { value: 'values_ethics', label: 'Values & Ethics', icon: 'shield' },
    { value: 'self_awareness', label: 'Self Awareness', icon: 'eye' },
    { value: 'lifestyle', label: 'Lifestyle', icon: 'sunny' },
    { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export const COLORS = {
    primary: '#4A90E2',
    secondary: '#50C878',
    danger: '#E74C3C',
    warning: '#F39C12',
    background: '#F5F5F5',
    darkBackground: '#1A1A1A',
    text: '#333333',
    textLight: '#666666',
    white: '#FFFFFF',
    border: '#E0E0E0',
};

export const INITIAL_GROWTH_SCORE = 100;

export const THEME_DARK = {
    dark: true,
    colors: {
        primary: '#4A90E2',
        secondary: '#50C878',
        danger: '#E74C3C',
        warning: '#F39C12',
        background: '#1A1A1A',
        card: '#2A2A2A',
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
        border: '#333333',
        input: '#2A2A2A',
    }
};

export const THEME_LIGHT = {
    dark: false,
    colors: {
        primary: '#4A90E2',
        secondary: '#50C878',
        danger: '#E74C3C',
        warning: '#F39C12',
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: '#333333',
        textSecondary: '#666666',
        border: '#E0E0E0',
        input: '#FFFFFF',
    }
};
