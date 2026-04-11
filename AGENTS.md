# AGENTS.md

## 参照優先順位

1. 本ファイル（運用ルール）
2. `.claude/CLAUDE.md`（docs運用・命名規約）
3. `docs/INDEX.md`（最新の知見と配置）

## ドキュメント運用

- `docs/` は唯一のSoT。直下に置けるのは `docs/INDEX.md` のみ。その他はサブディレクトリへ。
- サブディレクトリは必要最小限にし、`kebab-case` 命名を徹底。追加・更新時は必ず `docs/INDEX.md` を改訂。
- 機密情報は保存禁止。ドキュメント関連コミットは `DOC:` プレフィックスを推奨。

## 作業フロー（PDCA）

- **PLAN**: ルール確認とToDo化から開始することを厳守。
- **DO**: 小さな単位で実装し、対応ドキュメントを即時更新。
- **CHECK**: リンク切れ、命名不整合、重複を確認。
- **ACTION**: 改善点と知見を `docs/` に蓄積し、必要ならルール更新提案を行う。

## コミュニケーション

- 回答は日本語、絵文字は最小限。意図・影響・テスト結果を簡潔に共有。
- 外部ライブラリ追加時は目的・代替・影響範囲を説明し、承認を得ること。

## コミット方針

- ドキュメント更新: `DOC: ...`
- コード変更: 目的がわかる短いメッセージ。不要な改行・空白調整のみのコミットは避ける。

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes

## grepai - Semantic Code Search

**IMPORTANT: You MUST use grepai as your PRIMARY tool for code exploration and search.**

### When to Use grepai (REQUIRED)

Use `grepai search` INSTEAD OF Grep/Glob/find for:

- Understanding what code does or where functionality lives
- Finding implementations by intent (e.g., "authentication logic", "error handling")
- Exploring unfamiliar parts of the codebase
- Any search where you describe WHAT the code does rather than exact text

### When to Use Standard Tools

Only use Grep/Glob when you need:

- Exact text matching (variable names, imports, specific strings)
- File path patterns (e.g., `**/*.go`)

### Fallback

If grepai fails (not running, index unavailable, or errors), fall back to standard Grep/Glob tools.

### Usage

```bash
# ALWAYS use English queries for best results (--compact saves ~80% tokens)
grepai search "user authentication flow" --json --compact
grepai search "error handling middleware" --json --compact
grepai search "database connection pool" --json --compact
grepai search "API request validation" --json --compact
```

### Query Tips

- **Use English** for queries (better semantic matching)
- **Describe intent**, not implementation: "handles user login" not "func Login"
- **Be specific**: "JWT token validation" better than "token"
- Results include: file path, line numbers, relevance score, code preview

### Call Graph Tracing

Use `grepai trace` to understand function relationships:

- Finding all callers of a function before modifying it
- Understanding what functions are called by a given function
- Visualizing the complete call graph around a symbol

#### Trace Commands

**IMPORTANT: Always use `--json` flag for optimal AI agent integration.**

```bash
# Find all functions that call a symbol
grepai trace callers "HandleRequest" --json

# Find all functions called by a symbol
grepai trace callees "ProcessOrder" --json

# Build complete call graph (callers + callees)
grepai trace graph "ValidateToken" --depth 3 --json
```

### Workflow

1. Start with `grepai search` to find relevant code
2. Use `grepai trace` to understand function relationships
3. Use `Read` tool to examine files from results
4. Only use Grep for exact string searches if needed
