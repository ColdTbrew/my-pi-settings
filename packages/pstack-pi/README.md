# pstack for Pi 로컬 어댑터

설치된 `pstack-codex` 0.15.6의 스킬 48개를 Pi 패키지로 복사한 스킬 전용 어댑터입니다. Codex 원본과 에이전트 설정은 변경하지 않습니다. 원본 버전과 스킬 해시는 `source-lock.json`에 기록합니다.

## 사용

현재 Pi 세션에서 `/reload`를 실행하거나 새 세션을 시작하세요. 다음 명령으로 스킬을 명시적으로 호출하세요.

```text
/skill:poteto-mode 이 버그를 재현하고 원인을 수정한 뒤 검증해줘
/skill:how 이 모듈의 구조와 실행 흐름을 설명해줘
/skill:tdd 이 기능을 테스트부터 구현해줘
/skill:unslop 현재 변경사항을 검토해줘
/skill:setup-pstack
```

모든 스킬에 `disable-model-invocation: true`를 설정했습니다. 명시적으로 호출한 워크플로가 관련 스킬을 읽을 수는 있지만, 일반 대화에서는 자동 적용되지 않습니다. 현재 모델과 추론 수준은 유지합니다.

## 지원 범위

스킬, 플레이북, 참조 문서, 보조 스크립트를 복사했습니다. 보조 스크립트에 필요한 실행 환경은 별도로 확인해야 합니다. 전체 워크플로의 실행 검증은 수행하지 않았습니다.

이 패키지는 서브에이전트 실행기를 제공하지 않습니다. Codex TOML 프로필과 spawn/wait 도구는 Pi에서 실행되지 않습니다. 일반 작업은 현재 세션에서 순차적으로 수행하도록 안내합니다. 자체 검토는 독립 검토로 표시하지 않습니다. `arena`, `interrogate`, 독립 검토가 필수인 배포 절차는 호환 에이전트 확장 없이 검증 조건을 충족할 수 없습니다. 예약 실행, 영구 모니터링, Codex 목표 관리도 제공하지 않습니다.

`setup-pstack`과 모델 라우팅 문서는 Pi용으로 교체했습니다. 각 스킬의 Pi 런타임 안내가 본문의 Codex 전용 실행 지시보다 우선합니다.

## 검증

```bash
node ~/.pi/agent/packages/pstack-pi/scripts/validate.mjs
```

검증 스크립트는 Pi 1.0.1 로더로 스킬 48개를 읽고, 실제 사용자 설정의 패키지 검색, 명시적 호출 설정, 경고와 이름 충돌, 기존 스킬 유지, Codex 원본 스킬 해시를 확인합니다. 모델 요청이나 서브에이전트 실행은 테스트하지 않습니다.

## 갱신

Codex 플러그인 업데이트는 이 복사본에 자동 반영되지 않습니다. 새 버전의 변경사항을 검토한 후 다음 명령을 실행하세요.

```bash
python3 ~/.pi/agent/packages/pstack-pi/scripts/sync-from-codex.py
node ~/.pi/agent/packages/pstack-pi/scripts/validate.mjs
```

현재 변환기는 스킬 48개를 전제로 합니다. 스킬 수가 바뀌면 검토를 위해 중단합니다. 변환 결과에는 기존 로컬 스킬 수정이 보존되지 않습니다. 갱신 전에 로컬 수정이 있으면 별도로 백업하세요. 갱신 후 Pi에서 `/reload`를 실행하세요.

## 제거

```bash
pi remove /home/seunghyuk/.pi/agent/packages/pstack-pi
```

로컬 패키지 등록을 제거합니다. Codex 설치에는 영향을 주지 않습니다.

## 라이선스

원본 pstack은 Lauren Tan의 MIT 라이선스 프로젝트입니다. Codex 포트는 <https://github.com/ColdTbrew/pstack-codex>에서 관리합니다. `LICENSE`를 함께 보존했습니다.
