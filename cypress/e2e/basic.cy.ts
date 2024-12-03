/*
 * SPDX-FileCopyrightText: syuilo and misskey-project , Type4ny-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('Before setup instance', () => {
	beforeEach(() => {
		cy.resetState();
	});

	afterEach(() => {
		// テスト終了直前にページ遷移するようなテストケース(例えばアカウント作成)だと、たぶんCypressのバグでブラウザの内容が次のテストケースに引き継がれてしまう(例えばアカウントが作成し終わった段階からテストが始まる)。
		// waitを入れることでそれを防止できる
		cy.wait(100);
	});

  it('successfully loads', () => {
    cy.visitHome();
  });

	it('setup instance', () => {
    cy.visitHome();

		cy.intercept('POST', '/api/admin/accounts/create').as('signup');

		cy.get('[data-cy-admin-initial-password] input').type('example_password_please_change_this_or_you_will_get_hacked');
		cy.get('[data-cy-admin-username] input').type('admin');
		cy.get('[data-cy-admin-password] input').type('admin1234');
		cy.get('[data-cy-admin-ok]').click();

		// なぜか動かない
		//cy.wait('@signup').should('have.property', 'response.statusCode');
		cy.wait('@signup');
  });
});

describe('After setup instance', () => {
	beforeEach(() => {
		cy.resetState();

		// インスタンス初期セットアップ
		cy.registerUser('admin', 'pass', true);
	});

	afterEach(() => {
		// テスト終了直前にページ遷移するようなテストケース(例えばアカウント作成)だと、たぶんCypressのバグでブラウザの内容が次のテストケースに引き継がれてしまう(例えばアカウントが作成し終わった段階からテストが始まる)。
		// waitを入れることでそれを防止できる
		cy.wait(100);
	});

  it('successfully loads', () => {
    cy.visitHome();
  });

	it('signup', () => {
		cy.visitHome();

		cy.intercept('POST', '/api/signup').as('signup');

		cy.get('[data-cy-signup]').click();
		cy.get('[data-cy-signup-rules-continue]').should('be.disabled');
		cy.get('[data-cy-signup-rules-notes-agree] [data-cy-switch-toggle]').click();
		cy.get('[data-cy-modal-dialog-ok]').click();
		cy.get('[data-cy-signup-rules-continue]').should('not.be.disabled');
		cy.get('[data-cy-signup-rules-continue]').click();

		cy.get('[data-cy-signup-submit]').should('be.disabled');
		cy.get('[data-cy-signup-username] input').type('alice');
		cy.get('[data-cy-signup-submit]').should('be.disabled');
		cy.get('[data-cy-signup-password] input').type('alice1234');
		cy.get('[data-cy-signup-submit]').should('be.disabled');
		cy.get('[data-cy-signup-password-retype] input').type('alice1234');
		cy.get('[data-cy-signup-submit]').should('not.be.disabled');
		cy.get('[data-cy-signup-submit]').click();

		cy.wait('@signup');
  });

  it('signup with duplicated username', () => {
		cy.registerUser('alice', 'alice1234');

		cy.visitHome();

		// ユーザー名が重複している場合の挙動確認
		cy.get('[data-cy-signup]').click();
		cy.get('[data-cy-signup-rules-continue]').should('be.disabled');
		cy.get('[data-cy-signup-rules-notes-agree] [data-cy-switch-toggle]').click();
		cy.get('[data-cy-modal-dialog-ok]').click();
		cy.get('[data-cy-signup-rules-continue]').should('not.be.disabled');
		cy.get('[data-cy-signup-rules-continue]').click();

		cy.get('[data-cy-signup-username] input').type('alice');
		cy.get('[data-cy-signup-password] input').type('alice1234');
		cy.get('[data-cy-signup-password-retype] input').type('alice1234');
		cy.get('[data-cy-signup-submit]').should('be.disabled');
  });
});

describe('After user signup', () => {
	beforeEach(() => {
		cy.resetState();

		// インスタンス初期セットアップ
		cy.registerUser('admin', 'pass', true);

		// ユーザー作成
		cy.registerUser('alice', 'alice1234');
	});

	afterEach(() => {
		// テスト終了直前にページ遷移するようなテストケース(例えばアカウント作成)だと、たぶんCypressのバグでブラウザの内容が次のテストケースに引き継がれてしまう(例えばアカウントが作成し終わった段階からテストが始まる)。
		// waitを入れることでそれを防止できる
		cy.wait(100);
	});

  it('successfully loads', () => {
    cy.visitHome();
  });

	it('signin', () => {
		cy.visitHome();

		cy.intercept('POST', '/api/signin-flow').as('signin');

		cy.get('[data-cy-signin]').click();

		cy.get('[data-cy-signin-page-input]').should('be.visible', { timeout: 1000 });
		// Enterキーで続行できるかの確認も兼ねる
		cy.get('[data-cy-signin-username] input').type('alice{enter}');

		cy.get('[data-cy-signin-page-password]').should('be.visible', { timeout: 10000 });
		// Enterキーで続行できるかの確認も兼ねる
		cy.get('[data-cy-signin-password] input').type('alice1234{enter}');

		cy.wait('@signin');
  });

	it('suspend', function() {
		cy.request('POST', '/api/admin/suspend-user', {
			i: this.admin.token,
			userId: this.alice.id,
		});

		cy.visitHome();

		cy.get('[data-cy-signin]').click();

		cy.get('[data-cy-signin-page-input]').should('be.visible', { timeout: 1000 });
		cy.get('[data-cy-signin-username] input').type('alice{enter}');

		// TODO: cypressにブラウザの言語指定できる機能が実装され次第英語のみテストするようにする
		cy.contains(/アカウントが凍結されています|This account has been suspended due to/gi);
	});
});

describe('After user signed in', () => {
	beforeEach(() => {
		cy.resetState();

		// インスタンス初期セットアップ
		cy.registerUser('admin', 'pass', true);

		// ユーザー作成
		cy.registerUser('alice', 'alice1234');

		cy.login('alice', 'alice1234');
	});

	afterEach(() => {
		// テスト終了直前にページ遷移するようなテストケース(例えばアカウント作成)だと、たぶんCypressのバグでブラウザの内容が次のテストケースに引き継がれてしまう(例えばアカウントが作成し終わった段階からテストが始まる)。
		// waitを入れることでそれを防止できる
		cy.wait(100);
	});

  it('successfully loads', () => {
		// 表示に時間がかかるのでデフォルト秒数だとタイムアウトする
		cy.get('[data-cy-user-setup-continue]', { timeout: 30000 }).should('be.visible');
  });

	it('account setup wizard', () => {
		// 表示に時間がかかるのでデフォルト秒数だとタイムアウトする
		cy.get('[data-cy-user-setup-continue]', { timeout: 30000 }).click();

		cy.get('[data-cy-user-setup-user-name] input').type('ありす');
		cy.get('[data-cy-user-setup-user-description] textarea').type('ほげ');
		// TODO: アイコン設定テスト

		cy.get('[data-cy-user-setup-continue]').click();

		// プライバシー設定

		cy.get('[data-cy-user-setup-continue]').click();

		// フォローはスキップ

		cy.get('[data-cy-user-setup-continue]').click();

		// プッシュ通知設定はスキップ

		cy.get('[data-cy-user-setup-continue]').click();

		cy.get('[data-cy-user-setup-continue]').click();
  });
});

describe('After user setup', () => {
	beforeEach(() => {
		cy.resetState();

		// インスタンス初期セットアップ
		cy.registerUser('admin', 'pass', true);

		// ユーザー作成
		cy.registerUser('alice', 'alice1234');

		cy.login('alice', 'alice1234');

		// アカウント初期設定ウィザード
		// 表示に時間がかかるのでデフォルト秒数だとタイムアウトする
		cy.get('[data-cy-user-setup] [data-cy-modal-window-close]', { timeout: 30000 }).click();
		cy.get('[data-cy-modal-dialog-ok]').click();
	});

	afterEach(() => {
		// テスト終了直前にページ遷移するようなテストケース(例えばアカウント作成)だと、たぶんCypressのバグでブラウザの内容が次のテストケースに引き継がれてしまう(例えばアカウントが作成し終わった段階からテストが始まる)。
		// waitを入れることでそれを防止できる

		// でもいらない気もする
		cy.wait(100);
	});

	// メモ
	// Type4ny では投稿フォームを最初から2つ表示するようにしているので、 last を使って最後の(一番新しく開かれたであろう)投稿フォームを取得している

	it('note', () => {
		cy.wait(100);
		cy.get('[data-cy-post-form-text]').type('Hello, Misskey!');
		cy.get('[data-cy-open-post-form-submit]').click();

		cy.contains('Hello, Misskey!', { timeout: 10000 }).should('be.visible');
	});

	it('open note form with hotkey', () => {

		cy.get('[data-cy-open-post-form]').last().should('be.visible');
		cy.document().trigger("keydown", { eventConstructor: 'KeyboardEvent', key: "n", code: "KeyL" });
		cy.get('[data-cy-post-form-text]').last().should('be.visible');
		cy.wait(300); //ここでwaitしないとなぜかショートカット扱いになってTLに移動する
		cy.get('[data-cy-post-form-text]').last().type('Hello, Misskey!');
		cy.get('[data-cy-open-post-form-submit]').last().click();
		cy.wait(300);
		cy.get('[data-cy-post-form-text]').last().should('be.empty');
  });

	it('visibility can be changed in note form (Public)', () => {
		cy.get('[data-cy-post-form-text]').last().type('Public');
		cy.get('[data-cy-open-post-form-visibility]', { timeout: 30000 }).last().click();
		cy.get('[data-cy-open-post-form-visibility-public]', { timeout: 30000 }).click();
		cy.get('[data-cy-open-post-form-submit]').last().click();

		cy.get('[data-cy-note-visibility-followers]').should('not.exist');
		cy.get('[data-cy-note-visibility-home]').should('not.exist');
		cy.get('[data-cy-note-visibility-specified]').should('not.exist');

	});

	it('visibility can be changed in note form (Home)', () => {
		cy.get('[data-cy-post-form-text]').last().type('Home');
		cy.get('[data-cy-open-post-form-visibility]').last().click();
		cy.get('[data-cy-open-post-form-visibility-home]').click();
		cy.get('[data-cy-open-post-form-submit]').last().click();

		cy.get('[data-cy-note-visibility-home]').last().should('be.visible');
	});

	it('visibility can be changed in note form (Followers)', () => {
		cy.get('[data-cy-post-form-text]').last().type('Followers Only');
		cy.get('[data-cy-open-post-form-visibility]').last().click();
		cy.get('[data-cy-open-post-form-visibility-followers]').click();
		cy.get('[data-cy-open-post-form-submit]').last().click();

		cy.get('[data-cy-note-visibility-followers]').last().should('be.visible');
	});

	it('visibility can be changed in note form (Specified)', () => {
		cy.get('[data-cy-post-form-text]').last().type('Specified');
		cy.get('[data-cy-open-post-form-visibility]').last().click();
		cy.get('[data-cy-open-post-form-visibility-specified]').click();
		cy.get('[data-cy-open-post-form-submit]').last().click();

		cy.get('[data-cy-note-visibility-specified]').last().should('be.visible');
	});

});

// TODO: 投稿フォームの公開範囲指定のテスト
// TODO: 投稿フォームのファイル添付のテスト
// TODO: 投稿フォームのハッシュタグ保持フィールドのテスト
