# Cloudflare Worker — 대학 AI 프록시

남악고 성적표 앱에서 **API 키를 브라우저에 노출하지 않고** Groq 등 무료 LLM을 쓰기 위한 프록시입니다.

## 1. Groq API 키 발급 (무료)

1. [Groq Console](https://console.groq.com/keys)에서 API 키 생성
2. 무료 티어로 `llama-3.1-8b-instant` 등 사용 가능

## 2. Worker 배포

```bash
cd cloudflare-worker
npm install -g wrangler   # 또는 npx wrangler
wrangler login
wrangler secret put GROQ_API_KEY
wrangler deploy
```

배포 후 표시되는 URL 예: `https://namak-univ-ai.your-subdomain.workers.dev`

## 3. 앱에 연결

1. 성적 조회 후 **「보고서 출력 · 초기화」** 영역
2. **Cloudflare Worker URL** 입력란에 위 URL 붙여넣기
3. 학생 조회 시 **Worker → (실패 시) DuckDuckGo → 로컬 폴백** 순으로 자동 분석

## 4. Perplexity (선택)

- **「Perplexity 고급 분석」** 버튼: 클릭 시에만 Puter 로그인 팝업 1회
- 팝업 없이 쓰려면 Worker URL만 설정하고 Perplexity 버튼은 사용하지 않으면 됩니다.

## CORS

Worker는 `Access-Control-Allow-Origin: *` 로 GitHub Pages에서 호출할 수 있습니다.
