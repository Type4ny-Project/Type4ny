/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { AbuseUserReportsRepository } from '@/models/_.js';
import { awaitAll } from '@/misc/prelude/await-all.js';
import type { MiAbuseUserReport } from '@/models/AbuseUserReport.js';
import { bindThis } from '@/decorators.js';
import { IdService } from '@/core/IdService.js';
import { UserEntityService } from './UserEntityService.js';

@Injectable()
export class AbuseUserReportEntityService {
	constructor(
		@Inject(DI.abuseUserReportsRepository)
		private abuseUserReportsRepository: AbuseUserReportsRepository,

		private userEntityService: UserEntityService,
		private idService: IdService,
	) {
	}

	@bindThis
	public async pack(
		src: MiAbuseUserReport['id'] | MiAbuseUserReport,
	) {
		const report = typeof src === 'object' ? src : await this.abuseUserReportsRepository.findOneByOrFail({ id: src });

		return await awaitAll({
			id: report.id,
			createdAt: this.idService.parse(report.id).date.toISOString(),
			comment: report.comment,
			notes: report.notes,
			resolved: report.resolved,
			reporterId: report.reporterId,
			targetUserId: report.targetUserId,
			assigneeId: report.assigneeId,
			reporter: this.userEntityService.pack(report.reporter ?? report.reporterId, null, {
				detail: true,
			}),
			targetUser: this.userEntityService.pack(report.targetUser ?? report.targetUserId, null, {
				detail: true,
			}),
			assignee: report.assigneeId ? this.userEntityService.pack(report.assignee ?? report.assigneeId, null, {
				detail: true,
			}) : null,
			forwarded: report.forwarded,
		});
	}

	@bindThis
	public packMany(
		reports: any[],
	) {
		return Promise.all(reports.map(x => this.pack(x)));
	}
}
