# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.png" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

現在の公開バージョン: `0.0.4`.

> Beta notice: `0.0.4` はまだベータ版です。macOS が主な検証済み経路です。Linux と Windows のインストール/実行経路も含まれていますが、環境によってはまだ正常に動作しない場合があります。

Codex CLI はすでに賢いツールです。その賢さをもう少し構造的に使いたいと思いませんか。より大きな利用枠のプランも登場し、ただ試行錯誤するだけではなく、納得できる手順で結果を得たい場面が増えています。CCC へようこそ。リクエストの先頭に `$cap` を付けるだけで、Codex-Cli-Captain が captain-led の流れで作業を整理し、適切なエージェントを通して結果を返します。

## インストールと更新

macOS/Linux では Codex CLI に次を貼り付けてください。

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

Windows PowerShell では次を使ってください。

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
iwr -UseB https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.ps1 | iex

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

更新時も同じ install コマンドをもう一度実行してください。現在の release asset を取得し、現在の install 先と `ccc` command shim/binary を更新し、setup と `ccc check-install` を再実行します。その後、Codex CLI を完全に再起動すると、更新された `$cap` skill と custom agent が読み込まれます。

## 設定変更の反映

`~/.config/ccc/ccc-config.toml` を編集した後、Codex CLI に次を貼り付けてください。既存の `~/.config/foreman/ccc-config.toml` は fallback として読み込まれ、`ccc setup` が新しい場所へ migration します。新しく生成されるインストール用 `~/.config/ccc/ccc-config.toml` はすべての `gpt-5.4-mini` mini role に reasoning `variant = "high"` と `fast_mode = true` を使い、`ccc setup` は既存のユーザー変更済み値を保持したまま不足している生成デフォルトを補完し、古い CCC 生成デフォルトをアップグレードします。

生成デフォルトは captain の reasoning 品質を維持し、設定済みの mini/specialist role は fast service を使い、delegated worker の scope/acceptance/task prompt excerpt を 420/280/900 文字に制限し、`$cap`/custom-agent instructions を短くして token overhead を抑えます。

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## Active Run と並列作業

以前の run や subagent がまだ active な状態で新しい `$cap` リクエストが届くと、CCC は既存の active run を表示し、merge、replan、reclaim のどれで扱うべきかを示します。ホスト側 custom subagent は CCC から常に強制キャンセルできるとは限らないため、captain が stale な作業を記録し、最新リクエストと統合して続行します。

Codex が `Too many open files (os error 24)` のような file descriptor 圧迫を報告した場合、新しい reviewer や specialist を追加で開かないでください。各 active host agent を terminal lifecycle update として記録し、captain が merge または reclaim したうえで、host session でその agent を close し、thread/file handle が解放されるまで単一経路で進めます。

- scout は広い調査で既定 2 本の読み取り専用 lane を使い、最大 4 本まで広げます
- raider は広い変更や複数ファイルの変更で既定 2 本の lane を使い、最大 4 本まで広げます
- 単一ファイルまたは共有スコープの変更は sequential のままです

`--text` と quiet lifecycle 出力では token ゲージを常に表示します。raw usage event がある場合、CCC は token 合計と stacked gauge を表示し、host custom subagent が usage event を公開しない場合は推測せず placeholder gauge と unavailable reason を表示します。structured status/activity payload も `token_usage_visibility.status` と `token_usage_visibility.unavailable_reason_code` を公開します。review pressure は active run、stale/reclaim-needed worker、file-handle pressure、token soft limit、低い OS memory availability、single-thread CPU pressure も考慮します。

登録済み custom subagent が既定の実行経路です。host Codex は captain として LongWay、routing、lifecycle、fan-in、review、validation、commit boundary を担当します。ordinary `$cap` の作業はまず適切な specialist に委任し、read-only 調査は `ccc_scout`、docs/operator text は `ccc_scribe`、code/config 変更は `ccc_raider`、review 判断は `ccc_arbiter` が担当します。route-backed lightweight filesystem/docs/fetch/git/gh 作業は設定済みの companion owner を使う必要があります。git と `gh` の読み取りは `companion_reader`、git または `gh` の変更は captain が fallback/degradation を記録しない限り `companion_operator` が担当します。captain が直接作業するのは、明示的な fallback、些細な operator-side 修正、または CCC が明確に degraded したと記録できる場合に限ります。

利用可能な custom subagent がある間は、明示的な fallback または codex override が記録されていない限り、直接の `codex exec` fallback をブロックします。

## 推奨ロール設定

| CCC role | Agent | 推奨モデル | Reasoning | 用途 |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.5` | `high` | LongWay 管理と最終ルーティング判断 |
| `way` | `tactician` | `gpt-5.5` | `medium` | 計画と次の作業選択 |
| `explorer` | `scout` | `gpt-5.4-mini` | `high` | 読み取り専用の repo 調査 |
| `code specialist` | `raider` | `gpt-5.5` | `high` | コード/config の変更と修復 |
| `documenter` | `scribe` | `gpt-5.4-mini` | `high` | README、リリースノート、利用者向け文言 |
| `verifier` | `arbiter` | `gpt-5.5` | `medium` | レビュー、リスク、回帰確認 |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `high` | 低コストの filesystem/docs/web/git/gh 読み取り作業 |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `high` | 低コストの git/gh 変更と狭い tool 実行 |

`gpt-5.5` は ChatGPT 認証の Codex で高価値ロールに推奨されるモデルです。現在のアカウントや実行経路でまだ利用できない場合、そのロールは rollout が届くまで `gpt-5.4` を使います。
