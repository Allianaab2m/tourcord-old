import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public run(message: Message) {
		if (message.inGuild()) {
			return this.ok();
		} else {
			return this.error({
				message: 'このコマンドはサーバー内で実行してください。'
			});
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		inGuild: never;
	}
}
