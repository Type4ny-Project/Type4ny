import { $i } from '@/i.js';

export function isLocalTimelineAvailable() {
	return $i == null || ($i.policies?.ltlAvailable ?? true);
}

export function isGlobalTimelineAvailable() {
	return $i == null || ($i.policies?.gtlAvailable ?? true);
}
