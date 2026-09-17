# Research Relay

**让 ChatGPT 的研究 Worker 获得更少、更准确的上下文，而不是把整个主项目都塞过去。**

Research Relay 是一套面向 **ChatGPT Projects + Skills** 的 Master / Worker 上下文隔离研究工作流。

它解决的核心问题是：长期项目里的主 Chat 需要保留项目目标、历史与决策，但一次研究任务产生的大量搜索结果、证据、冲突、失败记录和中间材料，不应该全部长期堆积在 Master 上下文里。

```text
MASTER PROJECT
  │
  │ research-dispatcher
  │ 生成最小充分 Task Packet
  ▼
================ CONTEXT FIREWALL ================
  ▼
RESEARCH WORKER PROJECT
  │
  │ research-worker
  ├── Evidence Artifact（完整证据）
  └── Result Envelope（短结果）
          │
          ▼
MASTER PROJECT
```

## 两个 Skill

### `research-dispatcher`

放在 Master 使用。负责判断是否值得委派、抽取最小必要上下文、生成版本化 Task Packet、拆分过大的任务，以及接收 Worker 返回的 Result Envelope。

### `research-worker`

放在 Research Worker 使用。只接受当前 Task Packet，执行联网研究、核验来源、记录冲突和失败、生成完整 Evidence Artifact，并向 Master 返回短 Result Envelope。

## 核心规则

- Master 拥有项目，Worker 只拥有当前任务。
- Task Packet 是当前任务的单一真源。
- 默认不继承完整历史。
- 旧 Chat、旧 Artifact 只有被 Packet 明确点名时才能作为本轮输入。
- 长证据优先进入 Artifact。
- Master 默认只接收短 Result Envelope。
- `PARTIAL / BLOCKED / CONFLICTING / NO_EVIDENCE` 必须可以明确返回。
- 达到证据充分或研究预算上限时停止，不进行无限搜索。

## 快速使用

1. 在 ChatGPT 中安装两个 Skill。
2. 建立一个长期 **Master Project**。
3. 再建立一个单独的 **Research Worker Project**。
4. Master 中让 `research-dispatcher` 把一个局部研究问题打包为 `research-task/v1`。
5. 把 Task Packet 放入新的 Worker Chat。
6. `research-worker` 完成研究并生成 Evidence Artifact + `research-result/v1`。
7. 首先只把 Result Envelope 返回 Master。
8. 只有需要审计、处理冲突或进一步验证时，Master 才读取完整 Artifact。

示例见 [`examples/`](examples/)。

## V1 有意不做什么

- 不依赖外部 Agent Runtime；
- 不依赖 Work / Codex；
- 不把 Google Drive 作为单点依赖；
- 暂不加入独立 Auditor；
- 核心协议暂不依赖脚本。

## 欢迎反馈

特别希望收集：

- Dispatcher 是否仍然传了过多上下文；
- Worker 是否被旧聊天污染；
- 哪些 Task Packet 字段多余或缺失；
- 哪些证据规则需要加强；
- Result Envelope 是否太长或太短；
- 哪些真实长期项目会让当前协议失效。

## License

MIT License，见 [`LICENSE`](LICENSE)。
