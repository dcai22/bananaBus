import * as SecureStore from 'expo-secure-store';

/**
 * Helper functions for secure storage.
 */

export async function saveItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string) {
    return await SecureStore.getItemAsync(key);
}

export default {
    saveItem,
    getItem,
}