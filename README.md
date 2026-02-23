# AI Workstation & GPU Performance Report (2026)

A single-page reference tool for choosing the best hardware for running local AI models.

## What it does

The site has four tabs:

**Pre-built Systems** — A sortable, filterable table of real-world AI workstations and laptops ranked by performance. Filter by OS, form factor (desktop/laptop), or the largest model size the machine can run. Columns are clickable to sort by VRAM, tokens/sec, price, and more.

**DIY vs. Pre-built** — Side-by-side cost comparisons between building your own PC and buying a comparable pre-built. Shows realistic savings, component breakdowns, and guidance on when a pre-built is the smarter choice.

**GPU Rankings** — A dedicated GPU comparison table sorted by AI inference effectiveness (tokens/sec per dollar, raw bandwidth, VRAM). Filter and contrast GPUs by manufacturer (NVIDIA, AMD, Apple) to see the tradeoffs between speed, memory capacity, and ecosystem.

**Best Match Finder** — An interactive recommender. Pick your preferred OS (macOS or Windows/Linux), set a budget, and choose the largest model size you want to run. The tool narrows the list to the single best-matched system for your requirements.

## Data sources

Community benchmarks from r/LocalLLaMA, measured with llama.cpp (`llama-bench`) and Apple MLX. All pricing reflects February 2026 market rates.

## Usage

Open `index.html` directly in any modern browser — no build step or server required.
