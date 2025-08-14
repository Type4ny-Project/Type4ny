import * as Misskey from 'misskey-js';
import { store } from '@/store.js';
import { $i } from '@/i.js';

export function filterMutedNotification(notification: Misskey.entities.Notification): boolean {
	switch (notification.type) {
		case 'reaction':
			if (store.s.mutedReactions.includes(notification.reaction.replace('@.', ''))) return false;
			if (store.s.reactionAndServerMute && $i && $i.mutedInstances && !$i.mutedInstances.includes(notification.reaction.split('@')[1])) return true; // ローカルの絵文字には @. というsuffixがつくのでそれを消してから比較してあげる
			break;
		case 'reaction:grouped':
			notification.reactions = notification.reactions.filter(reaction => !(store.s.reactionAndServerMute && $i && $i.mutedInstances && !$i.mutedInstances.includes(reaction.reaction.split('@')[1]))).filter(reaction => !store.s.mutedReactions.includes(reaction.reaction.replace('@.', '')));
			if (notification.reactions.length === 0) return false;
			break;
	}

	return true;
}
