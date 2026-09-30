# context-compass

Walk a project directory and write a Markdown shape report to
`.context-map/MAP.md`. One file of logic, ~44 lines, no dependencies.

It answers three questions: how many files, which extensions, which directories.
That is the whole scope.

## Real output

Run against a directory with `src/index.js`, `src/components/index.tsx`,
`README.md`, `config.json`, and a `node_modules/index.js`:

```
$ context-compass /tmp/ccdemo
✓ 已生成 .context-map/MAP.md

$ cat /tmp/ccdemo/.context-map/MAP.md
# 代码库地图: /tmp/ccdemo
## 概览
- 文件数: 4
- 总大小: 0.0 KB
- 入口文件: src/components/index.tsx, src/index.js

## 文件类型分布
- .md: 1个
- .json: 1个
- .tsx: 1个
- .js: 1个

## 目录结构
- ./ (2文件)
- src/components/ (1文件)
- src/ (1文件)
```

`node_modules/index.js` is excluded by the ignore list. Note that
`src/components/index.tsx` and `src/index.js` are *both* listed as entry files —
matching is on suffix, not location.

## Install

```bash
npm install -g .
```

Requires Node 18+ (ESM). Installs the `context-compass` binary. No dependencies.

## Usage

```bash
context-compass [path]     # default: .
```

Writes `<path>/.context-map/MAP.md` and prints `✓ 已生成 .context-map/MAP.md`.
There is no stdout mode, no `--format`, no dry-run.

中文说明：对任意项目目录做一次递归遍历，把文件数量、扩展名分布、目录结构和
入口文件写进 `.context-map/MAP.md`。

## How it classifies

`analyze()` returns `{files, dirs, entryFiles, totalFiles, totalSize}`, and
`generateReport()` renders it:

- **Ignore list** (exact name match, any depth): `node_modules`, `.git`,
  `__pycache__`, `.venv`, `dist`, `build`, `.next`, `vendor`
- **Depth limit**: stops recursing past depth 4
- **Entry files**: paths ending in `index.js`, `index.ts`, `index.tsx`,
  `index.jsx`, `main.py`, `app.py`, `main.go`
- **Extension distribution**: `path.extname()`, files with no extension are
  bucketed as `(无)`, sorted by count descending
- **Directory structure**: deduplicated `dirname`s of each file, with a file
  count per directory

`EXT_WEIGHT.config` and `EXT_WEIGHT.doc` (`.md`, `.rst`, `.txt`, `.json`,
`.yaml`, …) are declared in the source but never read — only `EXT_WEIGHT.entry`
is used.

## What this is not

- **Not a code analysis tool.** It never opens a file's contents. No imports, no
  symbols, no dependency graph, no language awareness. A `.py` and a `.js` file
  are the same row in the table.
- **Not a call-graph or dependency map.** "思维地图" (mind map) oversells it —
  the output is a file census. `tree`, `cloc`, or `tokei` do more.
- **Not `.gitignore`-aware.** Only the eight hardcoded names are skipped. Your
  `build/`, `coverage/`, `.venv2/`, `target/`, or `*.log` files all get counted.
- **Depth 4 is a hard stop** and there is no flag to raise it. Deeper trees are
  silently truncated — the report gives no indication that anything was skipped.
- **`entryFiles` is suffix matching**, so any file named `index.js` anywhere in
  the tree is an "entry point", including inside `test/` or `examples/`.
- **Directory counts are per-parent, not recursive.** `src/` shows only its
  direct children; the tree is not hierarchical.
- **Only the top N of nothing** — large repos produce a report one line per
  directory, but the file list is not printed at all, so you cannot see which
  files were found beyond the entry list.
- **`walk()` swallows every error** with a bare `catch{}`. Permission-denied and
  broken symlinks vanish without a warning.
- **It writes into the target directory.** `.context-map/` is created inside the
  project you point at; remember to gitignore it. There is no `--out`.
- **The npm name `context-compass` is taken** by an unrelated project (an MCP
  server for Claude Code, Apache-2.0, different author). This repo is not
  published, so the `npx context-compass` line in the old README would have
  installed someone else's package. Clone and `npm install -g .` instead.
- No tests, no config, no CLI flags.

## Requirements

Node 18+. No runtime dependencies.

## License

MIT