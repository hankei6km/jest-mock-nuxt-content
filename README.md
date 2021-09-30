# my-starter-ts-npm-cli-and-lib

TypeScript で npm 用の CLI とライブラリのパッケージを作成するスターター。
CodeSandbox 上でコードを編集し、GitHub Actions から  GitHub Packages および npm レジストリーへ publish することを想定している。

## 利用方法

このリポジトリをテンプレートとして新しいリポジトリを作成する。

1. `$ gh repo create <name> --template https://github.com/hankei6km/my-starter-ts-npm-cli-and-lib` で作成
1. `package.json` と `LICENSE` 等を新しいパッケージにあわせて変更(付録にテンプレート)
1. `$ npm run upgrade-interactive` 等でパッケージを更新

作成したリポジトリを CodeSandbox でインポートすると terminal(「yarn start」タブ) 内で `start` スクリプトが実行される(通常はエラーとなる)。後は必要に応じてコードの編集等を行う。

テストの実行は CodeSandbox 上では `npm run csb:test` を利用する。コマンドとしての実行を試す場合は `npm run start -- foo.txt` のように実行する。

### CLI 部分の変更

- コマンド名(スクリプト名)を変更: `package.json` の `bin` と`src/main.ts` の `scriptName` を変更。
- コマンドのフラグ等を変更: `src/main.ts` を編集。
- コマンドの処理を変更: `src/cli.ts` を編集。

### ライブラリー部分の変更

`src/count.ts` `src/count.test.ts` `test/*` を削除し、ライブラリのコードを記述。エクスポートしたい項目を `src/index.ts` へ記述。

### npm publish

以下の設定後に GitHub で Release を Publish すると Relase の種類により GitHub Pages または npm レジストリーへ `npm publish` される。

- Pre Release: GitHub Pages のみに publish される
- Release: GitHub Pages および npm レジストリーへ publish される

なお、`prepublishOnly` 等は定義されていないので、手動で `npm publish` を実行してもビルドはされないので注意。

#### 設定

1. GitHub 上でリポジトリの "Settings / Environment" から `npm_pkg` および `gh_pkg` を作成
1. `npm_pkg` の secrets に `NPM_TOKEN` を追加(内容は npm レジストリの Access Token)

現状では、`gh_pkg` への設定変更は行わない。

#### GitHub Packages へ publish

GitHub で Release を Publish すると `npm publish` される。このとき、scope はリポジトリの所有者(`$GITHUB_REPOSITORY` の所有者部分)へ置き換えられる。

```console
$ npm version prerelease
$ git push origin
$ gh release create v0.1.2-5 -t 0.1.2-5 --target <branch>
```

#### npm レジストリーへ publish

GitHub で Release を Publish すると `npm publish` される。ただし Pre Release のときは Publish されない。

なお、`npm publish` に ` --access public` は指定されていないので、scope を利用する場合は注意。

```console
$ npm version patch
$ git push origin
$ gh release create v0.1.2 -t 0.1.2
```

## 付録

`package.json` に記述する情報のテンプレート。`license` を変更したら `LICENSE` ファイルの変更も忘れずに。

```
  "name": "<package-name>",
  "version": "0.1.0",
  "description": "<description>",
  "author": "user <mail addr> (website url)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git://github.com/<user>/<repository>.git"
  },
  "bugs": {
    "url": "https://github.com/<user>/<repository>/issues"
  },
  "keywords": []
```

## 参考

- [TypeScript で npm ライブラリ開発ことはじめ - Qiita](https://qiita.com/saltyshiomix/items/d889ba79978dadba63fd)
- [TypeScript で CLI ツールを作って、npm パッケージにする - Qiita](https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634)
- [yarn upgrade-interactive と同じように npm でも対話型な更新をしたい！ - Qiita](https://qiita.com/kotarella1110/items/08afeb61d493829711eb)
- [Node.js パッケージの公開 - GitHub Docs](https://docs.github.com/ja/actions/guides/publishing-nodejs-packages)
- [GitHub Actions で npm に自動でリリースする workflow を作ってみた | DevelopersIO](https://dev.classmethod.jp/articles/github-actions-npm-automatic-release/)

## ライセンス

MIT License

Copyright (c) 2021 hankei6km



