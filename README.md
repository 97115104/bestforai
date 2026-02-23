# AI Workstation and GPU Performance Report (2026)

A browser-based reference tool for choosing the right hardware to run local AI models. No build step, server, or signup required.

Released under the [MIT License](https://opensource.org/licenses/MIT). Free to use, fork, and modify.

## Quick Start

1. Clone or download this repository
2. Open `index.html` in any browser to explore hardware options
3. Open `benchmark.html` to test your current system

## What This Tool Does

Running large language models locally requires matching your hardware to the model you want to run. The wrong system either cannot load the model at all, or runs it so slowly it becomes unusable. This tool surfaces the data you need to make a good decision before spending money.

### Hardware Reference (`index.html`)

The main page covers eight areas:

**Pre-built Systems** is a sortable, filterable table of real workstations and laptops tested for local AI inference. Filter by operating system, form factor, or the largest model the system can handle. Every row includes notes on real-world tradeoffs observed in the community.

**DIY vs. Pre-built** breaks down the cost and performance difference between building a system yourself and buying a finished product. It covers 11 build configurations from budget 7B machines around $850 up to extreme 120B workstations, with guidance on when pre-built is the smarter choice.

**GPU Rankings** is a dedicated comparison table that scores graphics cards by inference effectiveness, combining raw token speed, memory bandwidth, and VRAM capacity into a single index. Filter by manufacturer (NVIDIA, AMD, Apple) and sort by value, bandwidth, or outright speed.

**Best Match Finder** is an interactive recommender. Set your OS preference, budget, target model size, and priority (speed, value, capacity, or portability) and it selects the best-matched system from the database with an explanation of why that system fits your criteria. Click any result to open a detail panel showing model compatibility, RAM configuration options, and recommended inference software.

**Compare Systems** lets you place up to three systems side by side and generates a comparison covering specs, token generation speed across model sizes, memory bandwidth, and an analysis of what limits each system's performance.

**Optimization Guide** covers the software and configuration changes that measurably improve inference speed: quantization formats, framework choices, GPU offloading strategies, and parameter tuning.

**Operating Systems** compares macOS, Windows, and Linux for local AI inference, covering driver availability, framework support, and practical setup steps for each platform.

**Software** gives an overview of inference engines (llama.cpp, Ollama, LM Studio, vLLM), fine-tuning tools (Axolotl, Unsloth), AI coding assistants (Cursor, GitHub Copilot, Aider), and model sources.

### System Benchmark (`benchmark.html`)

The benchmark tool tests your actual hardware and provides personalized recommendations:

- **Hardware Detection** — Automatically detects CPU, GPU, RAM, and VRAM via browser APIs
- **Model Compatibility** — Shows which model sizes your system can run (1B through 405B)
- **Performance Estimates** — Estimates tokens/second for each model tier based on your hardware
- **Upgrade Recommendations** — Mac-aware suggestions that understand Apple Silicon limitations (soldered RAM, not upgradeable) and provide appropriate next-tier recommendations
- **Budget Tiers** — Upgrade paths from $0 optimizations through $5,000+ workstation builds

For Mac users, the tool detects Apple Silicon and shows Mac-specific upgrade paths (Mac mini → MacBook Pro → Mac Studio) rather than suggesting GPU upgrades that don't apply.

## Data Sources

Community benchmarks from r/LocalLLaMA, measured with llama.cpp (`llama-bench`) and Apple MLX. All pricing reflects February 2026 market rates. Token speed figures are estimates at Q4 quantization unless otherwise noted.

See [research.md](research.md) for detailed methodology, benchmark sources, and technical references.

## License

MIT License. See [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT) for the full text.
