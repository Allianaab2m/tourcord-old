import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public run(message: Message) {
		if (!message.member) return this.error();
		if (!message.guild) return this.error();
		const member = message.member;
		const teamRole = member.roles.cache.find((role) => role.name === 'tc-member');
		if (teamRole) {
			return this.ok();
		} else {
			return this.error({
				message: 'チームメンバーではないため実行できません。'
			});
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isTeamMember: never;
	}
}
