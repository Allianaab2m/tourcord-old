import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public run(message: Message) {
		if (message.channel.type === 'DM') {
			return this.ok();
		} else {
			return this.error();
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		inDirectMessage: never;
	}
}
