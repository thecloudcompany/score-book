import { openDatabaseSync } from 'expo-sqlite';

export function openDatabase() {
  return openDatabaseSync('scorebook.db');
}
