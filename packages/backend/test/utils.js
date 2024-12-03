/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { basename, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { inspect } from 'node:util';
import WebSocket from 'ws';
import fetch, { File } from 'node-fetch';
import { DataSource } from 'typeorm';
import { JSDOM } from 'jsdom';
import Fastify from 'fastify';
import { entities } from '../src/postgres.js';
import { loadConfig } from '../src/config.js';
import { DEFAULT_POLICIES } from '@/core/RoleService.js';
import { validateContentTypeSetAsActivityPub } from '@/core/activitypub/misc/validator.js';
export { server as startServer, jobQueue as startJobQueue } from '@/boot/common.js';
const config = loadConfig();
export const port = config.port;
export const origin = config.url;
export const host = new URL(config.url).host;
export const WEBHOOK_HOST = 'http://localhost:15080';
export const WEBHOOK_PORT = 15080;
export const cookie = (me) => {
    return `token=${me.token};`;
};
export const successfulApiCall = async (request, assertion = {}) => {
    const { endpoint, parameters, user } = request;
    const res = await api(endpoint, parameters, user);
    const status = assertion.status ?? (res.body == null ? 204 : 200);
    assert.strictEqual(res.status, status, inspect(res.body, { depth: 5, colors: true }));
    return res.body;
};
export const failedApiCall = async (request, assertion) => {
    const { endpoint, parameters, user } = request;
    const { status, code, id } = assertion;
    const res = await api(endpoint, parameters, user);
    assert.strictEqual(res.status, status, inspect(res.body));
    assert.ok(res.body);
    assert.strictEqual(castAsError(res.body).error.code, code, inspect(res.body));
    assert.strictEqual(castAsError(res.body).error.id, id, inspect(res.body));
};
export const api = async (path, params, me) => {
    const bodyAuth = {};
    const headers = {
        'Content-Type': 'application/json',
    };
    if (me?.bearer) {
        headers.Authorization = `Bearer ${me.token}`;
    }
    else if (me) {
        bodyAuth.i = me.token;
    }
    const res = await relativeFetch(`api/${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(Object.assign(bodyAuth, params)),
        redirect: 'manual',
    });
    const body = res.headers.get('content-type') === 'application/json; charset=utf-8'
        ? await res.json()
        : null;
    return {
        status: res.status,
        headers: res.headers,
        // FIXME: removing this non-null assertion: requires better typing around empty response.
        body: body,
    };
};
export const relativeFetch = async (path, init) => {
    return await fetch(new URL(path, `http://127.0.0.1:${port}/`).toString(), init);
};
export function randomString(chars = 'abcdefghijklmnopqrstuvwxyz0123456789', length = 16) {
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += chars[Math.floor(Math.random() * chars.length)];
    }
    return randomString;
}
/**
 * @brief プロミスにタイムアウト追加
 * @param p 待ち対象プロミス
 * @param timeout 待機ミリ秒
 */
function timeoutPromise(p, timeout) {
    return Promise.race([
        p,
        new Promise((reject) => {
            setTimeout(() => { reject(new Error('timed out')); }, timeout);
        }),
    ]);
}
export const signup = async (params) => {
    const q = Object.assign({
        username: randomString(),
        password: 'test',
    }, params);
    const res = await api('signup', q);
    return res.body;
};
export const post = async (user, params) => {
    const q = params;
    const res = await api('notes/create', q, user);
    // FIXME: the return type should reflect this fact.
    return (res.body ? res.body.createdNote : null);
};
export const createAppToken = async (user, permissions) => {
    const res = await api('miauth/gen-token', {
        session: randomUUID(),
        permission: permissions,
    }, user);
    return res.body.token;
};
// 非公開ノートをAPI越しに見たときのノート NoteEntityService.ts
export const hiddenNote = (note) => {
    const temp = {
        ...note,
        fileIds: [],
        files: [],
        text: null,
        cw: null,
        isHidden: true,
    };
    delete temp.visibleUserIds;
    delete temp.poll;
    return temp;
};
export const react = async (user, note, reaction) => {
    await api('notes/reactions/create', {
        noteId: note.id,
        reaction: reaction,
    }, user);
};
export const userList = async (user, userList = {}) => {
    const res = await api('users/lists/create', {
        name: 'test',
        ...userList,
    }, user);
    return res.body;
};
export const page = async (user, page = {}) => {
    const res = await api('pages/create', {
        alignCenter: false,
        content: [
            {
                id: '2be9a64b-5ada-43a3-85f3-ec3429551ded',
                text: 'Hello World!',
                type: 'text',
            },
        ],
        eyeCatchingImageId: null,
        font: 'sans-serif',
        hideTitleWhenPinned: false,
        name: '1678594845072',
        script: '',
        summary: null,
        title: '',
        variables: [],
        ...page,
    }, user);
    return res.body;
};
export const play = async (user, play = {}) => {
    const res = await api('flash/create', {
        permissions: [],
        script: 'test',
        summary: '',
        title: 'test',
        ...play,
    }, user);
    return res.body;
};
export const clip = async (user, clip = {}) => {
    const res = await api('clips/create', {
        description: null,
        isPublic: true,
        name: 'test',
        ...clip,
    }, user);
    return res.body;
};
export const galleryPost = async (user, galleryPost = {}) => {
    const res = await api('gallery/posts/create', {
        description: null,
        fileIds: [],
        isSensitive: false,
        title: 'test',
        ...galleryPost,
    }, user);
    return res.body;
};
export const channel = async (user, channel = {}) => {
    const res = await api('channels/create', {
        bannerId: null,
        description: null,
        name: 'test',
        ...channel,
    }, user);
    return res.body;
};
export const role = async (user, role = {}, policies = {}) => {
    const res = await api('admin/roles/create', {
        asBadge: false,
        canEditMembersByModerator: false,
        color: null,
        condFormula: {
            id: 'ebef1684-672d-49b6-ad82-1b3ec3784f85',
            type: 'isRemote',
        },
        description: '',
        displayOrder: 0,
        iconUrl: null,
        isAdministrator: false,
        isModerator: false,
        isPublic: false,
        name: 'New Role',
        target: 'manual',
        policies: {
            ...Object.entries(DEFAULT_POLICIES).map(([k, v]) => [k, {
                    priority: 0,
                    useDefault: true,
                    value: v,
                }]),
            ...policies,
        },
        ...role,
    }, user);
    return res.body;
};
/**
 * Upload file
 * @param user User
 */
export const uploadFile = async (user, { path, name, blob } = {}) => {
    const absPath = path == null
        ? new URL('resources/192.jpg', import.meta.url)
        : isAbsolute(path.toString())
            ? new URL(path)
            : new URL(path, new URL('resources/', import.meta.url));
    const formData = new FormData();
    formData.append('file', blob ??
        new File([await readFile(absPath)], basename(absPath.toString())));
    formData.append('force', 'true');
    if (name) {
        formData.append('name', name);
    }
    const headers = {};
    if (user?.bearer) {
        headers.Authorization = `Bearer ${user.token}`;
    }
    else if (user) {
        formData.append('i', user.token);
    }
    const res = await relativeFetch('api/drive/files/create', {
        method: 'POST',
        body: formData,
        headers,
    });
    const body = res.status !== 204 ? await res.json() : null;
    return {
        status: res.status,
        headers: res.headers,
        body,
    };
};
export const uploadUrl = async (user, url) => {
    const marker = Math.random().toString();
    const catcher = makeStreamCatcher(user, 'main', (msg) => msg.type === 'urlUploadFinished' && msg.body.marker === marker, (msg) => msg.body.file, 60 * 1000);
    await api('drive/files/upload-from-url', {
        url,
        marker,
        force: true,
    }, user);
    return catcher;
};
export function connectStream(user, channel, listener, params) {
    return new Promise((res, rej) => {
        const url = new URL(`ws://127.0.0.1:${port}/streaming`);
        const options = {};
        if (user.bearer) {
            options.headers = { Authorization: `Bearer ${user.token}` };
        }
        else {
            url.searchParams.set('i', user.token);
        }
        const ws = new WebSocket(url, options);
        ws.on('unexpected-response', (req, res) => rej(res));
        ws.on('open', () => {
            ws.on('message', data => {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'channel' && msg.body.id === 'a') {
                    listener(msg.body);
                }
                else if (msg.type === 'connected' && msg.body.id === 'a') {
                    res(ws);
                }
            });
            ws.send(JSON.stringify({
                type: 'connect',
                body: {
                    channel: channel,
                    id: 'a',
                    pong: true,
                    params: params,
                },
            }));
        });
    });
}
export const waitFire = async (user, channel, trgr, cond, params) => {
    return new Promise(async (res, rej) => {
        let timer = null;
        let ws;
        try {
            ws = await connectStream(user, channel, msg => {
                if (cond(msg)) {
                    ws.close();
                    if (timer)
                        clearTimeout(timer);
                    res(true);
                }
            }, params);
        }
        catch (e) {
            rej(e);
        }
        if (!ws)
            return;
        timer = setTimeout(() => {
            ws.close();
            res(false);
        }, 3000);
        try {
            await trgr();
        }
        catch (e) {
            ws.close();
            if (timer)
                clearTimeout(timer);
            rej(e);
        }
    });
};
/**
 * @brief WebSocketストリームから特定条件の通知を拾うプロミスを生成
 * @param user ユーザー認証情報
 * @param channel チャンネル
 * @param cond 条件
 * @param extractor 取り出し処理
 * @param timeout ミリ秒タイムアウト
 * @returns 時間内に正常に処理できた場合に通知からextractorを通した値を得る
 */
export function makeStreamCatcher(user, channel, cond, extractor, timeout = 60 * 1000) {
    let ws;
    const p = new Promise(async (resolve) => {
        ws = await connectStream(user, channel, (msg) => {
            if (cond(msg)) {
                resolve(extractor(msg));
            }
        });
    }).finally(() => {
        ws.close();
    });
    return timeoutPromise(p, timeout);
}
export const simpleGet = async (path, accept = '*/*', cookie = undefined, bodyExtractor = _ => Promise.resolve(null)) => {
    const res = await relativeFetch(path, {
        headers: {
            Accept: accept,
            Cookie: cookie,
        },
        redirect: 'manual',
    });
    const jsonTypes = [
        'application/json; charset=utf-8',
        'application/activity+json; charset=utf-8',
    ];
    const htmlTypes = [
        'text/html; charset=utf-8',
    ];
    if (res.ok && (accept.startsWith('application/activity+json') ||
        (accept.startsWith('application/ld+json') && accept.includes('https://www.w3.org/ns/activitystreams')))) {
        // validateContentTypeSetAsActivityPubのテストを兼ねる
        validateContentTypeSetAsActivityPub(res);
    }
    const body = jsonTypes.includes(res.headers.get('content-type') ?? '') ? await res.json() :
        htmlTypes.includes(res.headers.get('content-type') ?? '') ? new JSDOM(await res.text()) :
            await bodyExtractor(res);
    return {
        status: res.status,
        body,
        type: res.headers.get('content-type'),
        location: res.headers.get('location'),
    };
};
/**
 * あるAPIエンドポイントのPaginationが複数の条件で一貫した挙動であることをテストします。
 * (sinceId, untilId, sinceDate, untilDate, offset, limit)
 * @param expected 期待値となるEntityの並び（例：Note[]）昇順降順が一致している必要がある
 * @param fetchEntities Entity[]を返却するテスト対象のAPIを呼び出す関数
 * @param offsetBy 何をキーとしてPaginationするか。
 * @param ordering 昇順・降順
 */
export async function testPaginationConsistency(expected, fetchEntities, offsetBy = 'id', ordering = 'desc') {
    const rangeToParam = (p) => {
        if (offsetBy === 'id') {
            return { limit: p.limit, sinceId: p.since?.id, untilId: p.until?.id };
        }
        else {
            const sinceDate = p.since?.createdAt !== undefined ? new Date(p.since.createdAt).getTime() : undefined;
            const untilDate = p.until?.createdAt !== undefined ? new Date(p.until.createdAt).getTime() : undefined;
            return { limit: p.limit, sinceDate, untilDate };
        }
    };
    for (const limit of [1, 5, 10, 100, undefined]) {
        /*
        // 1. sinceId/DateとuntilId/Dateで両端を指定して取得した結果が期待通りになっていること
        if (ordering === 'desc') {
            const end = expected.at(-1)!;
            let last = await fetchEntities(rangeToParam({ limit, since: end }));
            const actual: Entity[] = [];
            while (last.length !== 0) {
                actual.push(...last);
                last = await fetchEntities(rangeToParam({ limit, until: last.at(-1), since: end }));
            }
            actual.push(end);
            assert.deepStrictEqual(
                actual.map(({ id, createdAt }) => id + ':' + createdAt),
                expected.map(({ id, createdAt }) => id + ':' + createdAt));
        }

        // 2. sinceId/Date指定+limitで取得してつなぎ合わせた結果が期待通りになっていること
        if (ordering === 'asc') {
            // 昇順にしたときの先頭(一番古いもの)をもってくる（expected[1]を基準に降順にして0番目）
            let last = await fetchEntities({ limit: 1, untilId: expected[1].id });
            const actual: Entity[] = [];
            while (last.length !== 0) {
                actual.push(...last);
                last = await fetchEntities(rangeToParam({ limit, since: last.at(-1) }));
            }
            assert.deepStrictEqual(
                actual.map(({ id, createdAt }) => id + ':' + createdAt),
                expected.map(({ id, createdAt }) => id + ':' + createdAt));
        }
        */
        // 3. untilId指定+limitで取得してつなぎ合わせた結果が期待通りになっていること
        if (ordering === 'desc') {
            let last = await fetchEntities({ limit });
            const actual = [];
            while (last.length !== 0) {
                actual.push(...last);
                last = await fetchEntities(rangeToParam({ limit, until: last.at(-1) }));
            }
            assert.deepStrictEqual(actual.map(({ id, createdAt }) => id + ':' + createdAt), expected.map(({ id, createdAt }) => id + ':' + createdAt));
        }
        // 4. offset指定+limitで取得してつなぎ合わせた結果が期待通りになっていること
        if (offsetBy === 'offset') {
            let last = await fetchEntities({ limit, offset: 0 });
            let offset = limit ?? 10;
            const actual = [];
            while (last.length !== 0) {
                actual.push(...last);
                last = await fetchEntities({ limit, offset });
                offset += limit ?? 10;
            }
            assert.deepStrictEqual(actual.map(({ id, createdAt }) => id + ':' + createdAt), expected.map(({ id, createdAt }) => id + ':' + createdAt));
        }
    }
}
export async function initTestDb(justBorrow = false, initEntities) {
    if (process.env.NODE_ENV !== 'test')
        throw new Error('NODE_ENV is not a test');
    const db = new DataSource({
        type: 'postgres',
        host: config.db.host,
        port: config.db.port,
        username: config.db.user,
        password: config.db.pass,
        database: config.db.db,
        synchronize: true && !justBorrow,
        dropSchema: true && !justBorrow,
        entities: initEntities ?? entities,
    });
    await db.initialize();
    return db;
}
export async function sendEnvUpdateRequest(params) {
    const res = await fetch(`http://localhost:${port + 1000}/env`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    if (res.status !== 200) {
        throw new Error('server env update failed.');
    }
}
export async function sendEnvResetRequest() {
    const res = await fetch(`http://localhost:${port + 1000}/env-reset`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
    if (res.status !== 200) {
        throw new Error('server env update failed.');
    }
}
// 与えられた値を強制的にエラーとみなす。この関数は型安全性を破壊するため、異常系のアサーション以外で用いられるべきではない。
// FIXME(misskey-js): misskey-jsがエラー情報を公開するようになったらこの関数を廃止する
export function castAsError(obj) {
    return obj;
}
export async function captureWebhook(postAction, port = WEBHOOK_PORT) {
    const fastify = Fastify();
    let timeoutHandle = null;
    const result = await new Promise(async (resolve, reject) => {
        fastify.all('/', async (req, res) => {
            timeoutHandle && clearTimeout(timeoutHandle);
            const body = JSON.stringify(req.body);
            res.status(200).send('ok');
            await fastify.close();
            resolve(body);
        });
        await fastify.listen({ port });
        timeoutHandle = setTimeout(async () => {
            await fastify.close();
            reject(new Error('timeout'));
        }, 3000);
        try {
            await postAction();
        }
        catch (e) {
            await fastify.close();
            reject(e);
        }
    });
    await fastify.close();
    return JSON.parse(result);
}
//# sourceMappingURL=utils.js.map