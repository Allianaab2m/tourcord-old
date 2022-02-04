import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public run(message: Message) {
		const guild = message.guild;
		const member = message.member;
		if (!member || !guild) return this.error();
		if (member.permissions.has('ADMINISTRATOR')) {
			return this.ok();
		} else {
			return this.error({
				message: 'このコマンドを実行するのに権限が足りません。'
			});
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isGuildAdmin: never;
	}
}
