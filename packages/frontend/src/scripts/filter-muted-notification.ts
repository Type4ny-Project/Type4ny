import * as Misskey from 'misskey-js';
import { defaultStore } from '@/store.js';
import { $i } from '@/account.js';

export function filterMutedNotification(notification: Misskey.entities.Notification): boolean {
	switch (notification.type) {
		case 'reaction':
			if (defaultStore.state.mutedReactions.includes(notification.reaction.replace('@.', ''))) return false;
			if (defaultStore.state.reactionAndServerMute && $i && $i.mutedInstances && !$i.mutedInstances.includes(notification.reaction.split('@')[1])) return true; // ローカルの絵文字には @. というsuffixがつくのでそれを消してから比較してあげる
			break;
		case 'reaction:grouped':
			notification.reactions = notification.reactions.filter(reaction => !defaultStore.state.mutedReactions.includes(reaction.reaction.replace('@.', ''))).filter(reaction => !($i && $i.mutedInstances && !$i.mutedInstances.includes(reaction.reaction.split('@')[1])));
			if (notification.reactions.length === 0) return false;
			break;
	}

	return true;
}
