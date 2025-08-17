/**
 * Gaming Mode Composable
 * Provides reactive access to gaming mode state and type
 */

import { computed } from 'vue';
import { store } from '@/store.js';

export function useGamingMode() {
	const gamingMode = computed(() => store.s.gamingMode);
	const gamingType = computed(() => store.s.gamingType);
	const darkMode = computed(() => store.s.darkMode);

	return {
		gamingMode,
		gamingType,
		darkMode,
	};
}
