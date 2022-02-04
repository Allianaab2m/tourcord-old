import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { PrismaClient } from '@prisma/client';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		const guild = message.guild;
		if (!guild) return this.error({ message: 'このコマンドはDMでは実行できません。' });
		const prisma = new PrismaClient();
		await prisma.$connect();
		const targetGuild = await prisma.guildConf.findMany({
			where: {
				AND: [
					{
						guildId: guild.id
					},
					{
						init: true
					}
				]
			}
		});
		if (targetGuild.length === 0) {
			return this.error({ message: '先に初期設定を行ってください。' });
		} else {
			return this.ok();
		}
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isInitialized: never;
	}
}
