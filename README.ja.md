# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.png" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

現在の公開バージョン: `0.0.3`.

Codex CLI はすでに賢いツールです。その賢さをもう少し構造的に使いたいと思いませんか。より大きな利用枠のプランも登場し、ただ試行錯誤するだけではなく、納得できる手順で結果を得たい場面が増えています。CCC へようこそ。リクエストの先頭に `$cap` を付けるだけで、Codex-Cli-Captain が captain-led の流れで作業を整理し、適切なエージェントを通して結果を返します。

## インストール

Codex CLI に次を貼り付けてください。

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## 設定変更の反映

`~/.config/foreman/ccc-config.toml` を編集した後、Codex CLI に次を貼り付けてください。

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## 推奨ロール設定

| CCC role | Agent | 推奨モデル | Reasoning | 用途 |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.4` | `high` | LongWay 管理と最終ルーティング判断 |
| `way` | `tactician` | `gpt-5.4` | `medium` | 計画と次の作業選択 |
| `explorer` | `scout` | `gpt-5.4-mini` | `medium` | 読み取り専用の repo 調査 |
| `code specialist` | `raider` | `gpt-5.3-codex` | `high` | コード/config の変更と修復 |
| `documenter` | `scribe` | `gpt-5.4-mini` | `medium` | README、リリースノート、利用者向け文言 |
| `verifier` | `arbiter` | `gpt-5.4` | `medium` | レビュー、リスク、回帰確認 |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `medium` | 低コストの filesystem/docs/web/git/gh 読み取り作業 |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `medium` | 低コストの git/gh 変更と狭い tool 実行 |
