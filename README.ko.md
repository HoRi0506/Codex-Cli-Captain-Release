# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.png" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

현재 공개 버전: `0.0.3`.

Codex CLI는 이미 똑똑합니다. 그 똑똑함을 조금 더 잘 활용하고 싶으신가요? 100달러 요금제도 나왔고, 이제는 모델을 더 막연히 쓰기보다 합리적인 과정으로 쓰고 싶을 때입니다. CCC에 오신 것을 환영합니다. 이제 요청 앞에 `$cap`만 붙이면, Codex-Cli-Captain이 captain-led 흐름으로 작업을 정리하고 적절한 에이전트를 거쳐 결과를 돌려줍니다.

## 설치 및 업데이트

Codex CLI에 아래 문구를 붙여넣으세요.

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

업데이트할 때도 같은 install 명령을 다시 실행하세요. 현재 릴리즈 asset을 내려받아 `current` symlink와 `ccc` binary를 갱신하고, setup과 `ccc check-install`을 다시 실행합니다. 이후 Codex CLI를 완전히 재시작해야 갱신된 `$cap` skill과 custom agent가 로드됩니다.

## 설정 변경 반영

`~/.config/ccc/ccc-config.toml`을 수정한 뒤 Codex CLI에 아래 문구를 붙여넣으세요. 기존 `~/.config/foreman/ccc-config.toml` 설치는 fallback으로 읽고 `ccc setup`이 새 위치로 마이그레이션합니다.

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## 활성 Run과 병렬 작업

이전 run이나 subagent가 아직 active 상태일 때 새 `$cap` 요청이 들어오면, CCC는 기존 active run을 보여주고 merge, replan, reclaim 중 어떤 처리가 필요한지 권고합니다. 호스트 custom subagent는 CCC가 항상 강제로 취소할 수 있는 대상이 아니므로, captain이 stale 작업을 기록하고 최신 요청과 합쳐서 이어갑니다.

- scout는 넓은 조사에서 기본 2개의 읽기 전용 lane을 사용하고 최대 4개까지 확장합니다
- raider는 넓거나 여러 파일을 수정하는 작업에서 기본 2개 lane을 사용하고 최대 4개까지 확장합니다
- 단일 파일 또는 공유 범위 수정은 순차 실행을 유지합니다

`--text`와 quiet lifecycle 출력에는 토큰 게이지가 항상 표시됩니다. Raw usage 이벤트가 있으면 CCC는 토큰 합계와 stacked gauge를 출력하고, host custom subagent가 usage 이벤트를 노출하지 않으면 추정 없이 placeholder gauge와 unavailable reason을 함께 출력합니다.

등록된 custom subagent가 기본 실행 경로입니다. host Codex는 captain으로서 LongWay, routing, lifecycle, fan-in, review, validation, commit boundary를 책임집니다. ordinary `$cap` 작업은 먼저 맞는 specialist에게 넘겨야 하며, read-only 조사는 `ccc_scout`, docs/operator text는 `ccc_scribe`, code/config 변경은 `ccc_raider`, review 판단은 `ccc_arbiter`가 맡습니다. captain이 직접 작업하는 경우는 명시적 fallback, 정말 사소한 operator-side 수정, 또는 CCC가 눈에 띄게 degraded 되었다고 기록할 수 있는 경우로만 제한합니다.

사용 가능한 custom subagent가 있는 동안에는 명시적 fallback 또는 codex override가 기록되지 않는 한 직접 `codex exec` fallback을 막습니다.

## 추천 역할 설정

| CCC role | Agent | 추천 모델 | Reasoning | 용도 |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.5` | `high` | LongWay 관리와 최종 라우팅 판단 |
| `way` | `tactician` | `gpt-5.5` | `medium` | 계획 수립과 다음 작업 선택 |
| `explorer` | `scout` | `gpt-5.4-mini` | `medium` | 읽기 전용 repo 조사 |
| `code specialist` | `raider` | `gpt-5.5` | `high` | 코드/config 수정과 복구 |
| `documenter` | `scribe` | `gpt-5.4-mini` | `medium` | README, 릴리즈 노트, 사용자 문구 |
| `verifier` | `arbiter` | `gpt-5.5` | `medium` | 리뷰, 리스크, 회귀 확인 |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `medium` | 저비용 filesystem/docs/web/git/gh 읽기 작업 |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `medium` | 저비용 git/gh 변경 및 좁은 도구 실행 |

`gpt-5.5`는 ChatGPT 인증 Codex에서 고가치 역할에 권장되는 모델입니다. 현재 계정이나 실행 경로에서 아직 사용할 수 없다면 해당 역할은 rollout이 도달할 때까지 `gpt-5.4`를 사용합니다.
