import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    getApiKeys,
    addApiKeys,
    removeApiKey,
    removeAllApiKeys,
    maskApiKey,
} from '../../services/storage/apiKeyStorage';
import { reloadKeys } from '../../services/ai/geminiConfig';
import { useTheme } from '../../context/ThemeContext';

interface ApiKeyManagementModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ApiKeyManagementModal({ visible, onClose }: ApiKeyManagementModalProps) {
    const [inputText, setInputText] = useState('');
    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        if (visible) {
            loadApiKeys();
        }
    }, [visible]);

    const loadApiKeys = async () => {
        const keys = await getApiKeys();
        setApiKeys(keys);
    };

    const handleAddKeys = async () => {
        if (!inputText.trim()) {
            Alert.alert('Error', 'Please enter at least one API key');
            return;
        }

        setLoading(true);
        try {
            const newKeys = inputText
                .split(/[,\n]/)
                .map(k => k.trim())
                .filter(k => k.length > 0);

            if (newKeys.length === 0) {
                Alert.alert('Error', 'No valid API keys found');
                return;
            }

            await addApiKeys(newKeys);
            await reloadKeys();
            await loadApiKeys();
            setInputText('');
            Alert.alert('Success', `Added ${newKeys.length} API key(s)`);
        } catch (error) {
            Alert.alert('Error', 'Failed to add API keys');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveKey = async (key: string) => {
        Alert.alert(
            'Remove API Key',
            'Are you sure you want to remove this API key?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await removeApiKey(key);
                        await reloadKeys();
                        await loadApiKeys();
                    },
                },
            ]
        );
    };

    const handleRemoveAll = async () => {
        Alert.alert(
            'Remove All Keys',
            'Are you sure you want to remove all API keys? This will disable all AI features.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove All',
                    style: 'destructive',
                    onPress: async () => {
                        await removeAllApiKeys();
                        await reloadKeys();
                        await loadApiKeys();
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Manage API Keys</Text>

                    <TextInput
                        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                        placeholder="Enter keys separated by commas or newlines"
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={handleAddKeys}
                        disabled={loading}
                    >
                        <Text style={styles.addButtonText}>Add Keys</Text>
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Keys ({apiKeys.length}):</Text>

                    <ScrollView style={styles.keysList}>
                        {apiKeys.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No API keys added yet</Text>
                        ) : (
                            apiKeys.map((key, index) => (
                                <View key={index} style={[styles.keyItem, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.keyText, { color: colors.text }]}>{maskApiKey(key)}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveKey(key)}>
                                        <Ionicons name="trash" size={20} color={colors.danger} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {apiKeys.length > 0 && (
                        <TouchableOpacity style={[styles.removeAllButton, { backgroundColor: colors.danger }]} onPress={handleRemoveAll}>
                            <Text style={styles.removeAllText}>Remove All Keys</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.card }]} onPress={onClose}>
                        <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
                    </TouchableOpacity>
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
        marginBottom: 16,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 12,
        textAlignVertical: 'top',
    },
    addButton: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    keysList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    keyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    keyText: {
        fontSize: 14,
        fontFamily: 'monospace',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
    removeAllButton: {
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    removeAllText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
