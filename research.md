# AI Workstation Research Notes
*Sourced primarily from r/LocalLLaMA (905K members) — community benchmarks, anecdotes, and real-world feedback. Benchmark tool: llama.cpp (llama-bench) or MLX unless noted. PP = prompt processing (prefill) t/s; TG = token generation t/s.*

**Note:** This document includes M3-era benchmarks as baseline references. The M3 Ultra offers ~800 GB/s memory bandwidth. The M4 Max (released 2024) offers improved GPU performance but no M4 Ultra exists yet — only the M3 Ultra is available for Mac Studio.

---

## 1. Apple Mac Studio (M3 Ultra, 128GB / 512GB)

**Key Specs:** Up to 192-core GPU, 512GB unified memory, ~800 GB/s memory bandwidth

**Community Benchmarks & Evidence:**
- **Head-to-head benchmark** (r/LocalLLaMA, 6 months ago): Qwen3-30B-A3B Q4_K_M — M3 Ultra (MLX): PP=**2,320 t/s**, TG=**97 t/s**; RTX 3090: PP=2,157 t/s, TG=**136 t/s**. M3 Ultra wins prefill with MLX; loses token generation to an older NVIDIA card.
- **"Underwhelmed" thread** (r/LocalLLaMA, 7 months ago, 74 comments): "Slow PP, and drop in TPS over longer context can really make you doubt if this is the performance you're spending a lump sum on." — u/SandboChang. Community tip: use `--cache-reuse` flag in llama.cpp; MLX is ~2x faster than LM Studio for prefill tasks.
- **Cluster benchmark** (r/LocalLLaMA, 25 days ago): 2× 512GB M3 Ultra Mac Studios running Kimi K2.5 at **24 t/s** — a practical real-world large-model deployment case.
- **Developer quote** (r/LocalLLaMA, 7 months ago): "It's doing great as a development backbone for my AI SaaS product. Excels with MoE models. Gives me 75% of the performance of a B200 server at production over reasonable context."

**Notable Pros:**
- Only consumer-purchasable system able to run 200B+ parameter models locally (e.g. Llama 3 405B at Q4) without an expensive multi-GPU rig
- Very low idle power draw; quiet fans at moderate load
- MLX framework is Apple-optimized and rapidly improving (speculative decoding can double TG speed)
- macOS: zero driver headaches; Ollama, LM Studio, MLX all work natively

**Gotchas:**
- Token generation is slower than consumer NVIDIA for models that fit in VRAM (RTX 5090 = ~1,792 GB/s bandwidth vs M3 Ultra ~800 GB/s)
- Concurrent request handling degrades more than NVIDIA: "Mac doesn't handle concurrent requests as well as NVIDIA GPU"
- Fan noise reported as significant under sustained full-load inference
- Premium pricing: 128GB config ~$3,999; 512GB config ~$9,999

**Memory Bandwidth Context:** M3 Ultra ~800 GB/s > M4 Max ~550 GB/s > Ryzen AI Max+ 395 ~256 GB/s > RTX 4090 ~1,008 GB/s > RTX 5090 ~1,792 GB/s

---

## 2. MacBook Pro 16" (M4 Max, up to 128GB)

**Key Specs:** Up to 40-core GPU, 128GB unified memory, ~410 GB/s memory bandwidth

**Community Benchmarks & Evidence:**
- **"MacBook M4 Max isn't great for LLMs"** (r/LocalLLaMA, 1 year ago, **514 upvotes**, 264 comments): "14B distilled Qwen Q4 runs at ~40 t/s for coding, with diffs frequently failing. 32B is pretty unusable via Roo Code and Cline because of low speed." — OP had M1 Max, then upgraded to M4 Max.
- **Technical breakdown** in the same thread: "M4 Max is about 50% faster than an NVIDIA P40 (both compute and memory bandwidth). About 7x slower than a 3090 in FP16 compute, ~2x slower in memory bandwidth." — u/henfiber (319 upvotes).
- **14" M4 Mac user** (same thread): "Getting 35 t/s on Qwen Q4. I never realized this was slow — it gets my job done. My whole dev stack is on my laptop now." Context: M4 Max 16" with 40-core is faster still.
- **MLX speedup**: "MLX is 20-30% faster than Ollama [for token generation]." Using MLX + speculative decoding with a 0.5B draft model can roughly triple speed.

**Notable Pros:**
- Truly portable AI workstation: runs inference on battery on a plane, bus, or coffee shop — no NVIDIA rig offers this
- MLX, Ollama, and LM Studio all work out of the box with full GPU acceleration
- 128GB variant can run 70B models (slowly) without offloading
- Long battery life for non-inference tasks; professional macOS ecosystem

**Gotchas:**
- Noticeably slower than a used RTX 3090 for token generation on models that fit in VRAM
- "32B is pretty unusable" at the speeds it generates for interactive coding via IDE plugins
- Fans spin at full speed under sustained inference load
- Price premium: 128GB M4 Max MBP 16" costs ~$4,200+; a used RTX 4090 PC setup can match inference speed at similar or lower cost
- Not suited for multi-user serving; concurrency degrades quickly

---

## 3. NVIDIA RTX 5090 Desktop (Alienware Aurora R16 / HP OMEN 45L / Lenovo Legion Tower 7i)

**Key Specs:** 32GB GDDR7, 1,792 GB/s memory bandwidth, ~575W TDP

**Community Benchmarks & Evidence:**
- **Benchmarking thread** (r/LocalLLaMA, 5 months ago): "RTX 5090 LLM Benchmarks — outperforming A100 by 2.6x" — heavily disputed. Community consensus: methodology was flawed (only 50 output tokens measured, skewing toward prefill). Realistic real-world advantage vs A100 80GB on token generation: **~10–20%** (both have ~1.6–1.8 TB/s bandwidth).
- **Real-world benchmark from laptop user with RTX 5090 (24GB, effectively same architecture)** (r/LocalLLaMA, 21 days ago, MSI Vector 17): Gemma-27B-Q4 — PP ~1,000 t/s, TG ~20 t/s; Qwen3-30B-A3B MoE IQ4 — PP ~2,700 t/s, TG ~100–140 t/s.
- **Community decision thread** (r/LocalLLaMA, 8 months ago, M3 Ultra vs 5090): "5090 will be faster, but M3 Ultra will be able to run smarter models (albeit slower)." — u/robogame_dev. Sums up the core trade-off.
- **Bandwidth vs. 4090**: RTX 5090 is ~78% faster than RTX 4090 for token generation on models that fit in VRAM (1,792 GB/s vs 1,008 GB/s).

**Notable Pros:**
- Fastest consumer GPU for token generation on models ≤30B parameters
- Best-in-class CUDA ecosystem; zero setup friction with PyTorch, vLLM, Ollama, llama.cpp
- Great for fine-tuning and training small models — full CUDA support
- Prebuilt availability: Alienware Aurora R16, HP OMEN 45L, Lenovo Legion Tower 7i

**Gotchas:**
- 32GB VRAM ceiling: can't run unquantized 34B+ models; needs at least Q4 for 34B; 70B requires CPU offloading (major slowdown)
- "Space heater" — ~575W TDP generates substantial heat; dedicated cooling recommended
- Multi-GPU P2P blocked on consumer cards by default NVIDIA drivers (workaround: `open-gpu-kernel-modules` with P2P patch)
- 1,000W+ PSU required even for single card in a full system
- Not upgradeable; if you need 64GB+ VRAM, you'd need 2× cards or professional GPU

---

## 4. NVIDIA RTX 4090 Desktop (Custom builds / Refurb prebuilts)

**Key Specs:** 24GB GDDR6X, ~1,008 GB/s memory bandwidth, ~450W TDP

**Community Benchmarks & Evidence:**
- **Community consensus across dozens of threads**: The RTX 4090 is the most-recommended single-GPU for local LLM users who primarily run 7B–30B models. It remains the r/LocalLLaMA "default recommendation" as of mid-2025.
- **Multi-GPU comparison** (mentioned in multiple threads): Dual 3090 (48GB total) sometimes preferred over single 4090 for users running 34B–70B models, but suffers same P2P bandwidth limitation; single 4090 is faster for models that fit in 24GB.
- **vs. RTX 5090**: "Tkn/s is 30% less than 5090" — confirmed in community benchmarks. For models fitting in 24GB, 4090 is fully capable; main limitation is VRAM ceiling, not speed.
- **Value position**: Used RTX 4090 on secondary market ~$1,100–$1,400; much more cost-effective than RTX 5090 ($1,999+) for most use cases.

**Notable Pros:**
- Excellent for any model fitting in 24GB (7B through ~30B at Q4_K_M quantization)
- CUDA ecosystem: works with every AI tool without configuration
- Widely available in prebuilt systems (many vendors)
- Strong second-hand market; well-understood cooling profiles

**Gotchas:**
- 24GB VRAM ceiling is the same as the 4090's predecessor (3090) — 30B+ models need careful quantization
- ~450W TDP; generates significant heat; needs good case airflow
- Not ideal for 70B+ unless you can tolerate CPU offloading
- No upgrade path to more VRAM without buying a second GPU (with P2P complications)

---

## 5. Dell Precision Workstation (AI configurations with RTX 6000 Ada / A-series GPUs)

**Key Specs (typical AI config):** Dell Precision 7960, Xeon Scalable or Threadripper PRO, RTX 6000 Ada (48GB VRAM), up to 2TB ECC RAM

**Community Benchmarks & Evidence:**
- **Low r/LocalLLaMA presence**: Dell Precision AI workstations are rarely discussed in hobbyist LLM communities. They appear in enterprise/professional AI deployment discussions.
- **RTX 6000 Ada (96GB across dual)**: Community notes that 2× RTX 6000 Ada (48GB each) "beats 4× 5090 in high-concurrency due to bandwidth" — from benchmarking thread (r/LocalLLaMA, 5 months ago). The RTX 6000 Ada has 96GB ECC VRAM and NVLink support.
- **Professional advantage noted in thread**: For multi-user inference serving, professional GPUs (A6000/RTX 6000) have no P2P blocking — unlike consumer 4090/5090 cards where NVIDIA disables peer-to-peer by default.

**Notable Pros:**
- ISV certifications (Ansys, Adobe, SolidWorks, MATLAB) for mixed professional AI and engineering workloads
- ECC VRAM on professional GPUs (RTX 6000 Ada, A6000) for reliable production deployments
- NVLink support on professional cards enables true GPU memory pooling
- Enterprise support contracts; warranty and service options unavailable on consumer builds
- Large ECC system RAM supports CPU-layer inference on very large models

**Gotchas:**
- Significant price premium: Precision 7960 + RTX 6000 Ada configs run $15,000–$30,000+
- Not a value play for hobbyist or developer use cases — community consistently recommends consumer builds instead
- Upgrade cycles are slower; configurations may not have latest consumer GPU generations immediately
- Overkill for most LLM developers; suited for corporate/enterprise environments with compliance needs

---

## 6. HP Z8 G4 with NVIDIA A100 80GB

**Key Specs:** HP Z8 G4 chassis, NVIDIA A100 80GB (PCIe variant), 2 TB/s HBM2e bandwidth, dual Xeon Scalable

**Community Benchmarks & Evidence:**
- **A100 vs. RTX 5090 thread** (r/LocalLLaMA, 10 months ago): Community consensus from the heavily-debated RunPod benchmark — A100 80GB has ~1.6–1.7 TB/s memory bandwidth vs RTX 5090's 1.792 TB/s. In practice, RTX 5090 is only ~10–20% faster at token generation on models that fit in both. **But A100 80GB can fit unquantized 70B models; RTX 5090 cannot** (32GB limit).
- **High-concurrency production advantage**: In the r/LocalLLaMA 4090/5090/PRO 6000 benchmarking thread, professional GPUs with full bandwidth and P2P dominate multi-user serving scenarios. A100 does not have consumer P2P restrictions.
- **Community context**: A100 80GB PCIe cards are available on secondary markets for ~$3,000–$8,000 (significantly down from launch prices). Multiple community members run these in repurposed Z8 G4 or Supermicro workstations.

**Notable Pros:**
- 80GB VRAM: can run unquantized Llama 3 70B, DeepSeek 67B, and similar models at full quality
- ECC HBM2e memory; designed for 24/7 production inference loads
- No P2P restrictions; multi-GPU NVLink (SXM variant only; PCIe version lacks NVLink)
- Dual Xeon platform supports massive ECC system RAM for model offloading
- Secondary market pricing makes it cost-competitive with RTX 5090

**Gotchas:**
- Z8 G4 uses older PCIe 3.0/4.0 platform (2018–2021 era); limited PCIe bandwidth vs modern Z-series
- A100 PCIe has no NVLink (NVLink only on A100 SXM); multi-GPU is PCIe bandwidth limited
- Dual Xeon Scalable CPUs are power-hungry: ~500–1,000W system TDP
- Large rackmount/tower chassis; not suitable for home office
- Requires enterprise/data center cooling; loud server-grade fans

---

## 7. Lenovo ThinkStation P620 (Threadripper PRO + multi-GPU)

**Key Specs:** AMD Threadripper PRO 5000 series (up to 5995WX, 64 cores), up to 2TB DDR4 ECC RAM, 1000W–2000W PSU options

**Community Benchmarks & Evidence:**
- **Direct r/LocalLLaMA thread** (1 year ago, 12 comments): User with P620 (5995WX / 256GB RAM / 1000W PSU) asking for GPU advice. Community response:
  - "Dual A6000 would be better than 2× 5090" for inference (more VRAM: 96GB vs 64GB)
  - "1000W PSU won't cut it for 2× 5090"
  - Can't fit two triple-width cards in the P620 chassis; recommended 2× A5000 or 2× A6000 instead
- **Memory bandwidth note**: Threadripper PRO 5995WX memory bandwidth ~200–250 GB/s (8-channel DDR4). Substantial CPU inference capability when paired with large RAM.
- **Large RAM advantage**: 256GB system RAM allows running Llama 3 405B at Q2 quantization via CPU inference (slow but functional); "with ktransformers, R1 671B IQ1 on CPU — much smarter and much slower" — community comment.

**Notable Pros:**
- Up to 2TB ECC RAM; can do CPU-layer inference on models too large for any GPU
- Threadripper PRO: workstation-grade platform with ISV support and reliability
- Expandable GPU options: dual A5000/A6000 for 48–96GB combined VRAM
- Good upgrade path: can swap GPUs without changing chassis
- Strong for model fine-tuning that needs large CPU RAM + GPU compute

**Gotchas:**
- Physical size limitation: can't fit two triple-width consumer GPUs (e.g., 5090 FE)
- 1000W PSU is insufficient for dual-GPU heavy AI loads; needs 2000W upgrade
- CPU inference on Threadripper is ~10–30 t/s on 7B models; very slow for large models
- Not competitive with dedicated GPU setups for pure inference speed
- Platform aging: Threadripper PRO 5000 (Zen 3) is a few years old; DDR4 bandwidth ceiling

---

## 8. Asus ROG Laptop with RTX 5090 (e.g., ROG Strix SCAR 18)

**Key Specs:** RTX 5090 Laptop GPU — **only 24GB VRAM** (NOT 32GB like desktop), reduced TDP (~150–175W max)

**Community Benchmarks & Evidence:**
- **"24GB VRAM on a laptop?" thread** (r/LocalLLaMA, 21 days ago): OP discovered RTX 5090 laptop listing. Community response: "It's a desktop 5080 with 24GB VRAM, hardware-wise" — u/Zealousideal_Nail288.
- **Real-world benchmark from MSI Vector 17 HX AI** (same spec class — Intel Core Ultra 9, 32GB, RTX 5090 24GB): Gemma-27B-Q4-K-M: ~15K token context at ~1,000 t/s PP, **~20 t/s TG**; Qwen3-30B-A3B MoE IQ4: PP ~2.7K t/s, TG **~100–140 t/s**.
- **Laptop GPU throttle warning** (same thread): RTX 5000 ADA 16GB laptop user: "after the first 100 or 200 tokens it throttles into a crawl" under sustained inference load.
- **Community recommendation against it for LLMs**: Multiple commenters said: "For LLMs, go with Ryzen AI 395+ 128GB — bigger models, lower cost." — u/NecnoTV, u/Cunnilingusobsessed.

**Notable Pros:**
- Portable desktop-class GPU performance for models up to ~20B parameters
- Best-in-class laptop GPU if gaming and inference are both priorities
- Full CUDA ecosystem; works with all AI tools without configuration
- 24GB VRAM beats every other laptop GPU category significantly

**Gotchas:**
- 24GB VRAM is the same as RTX 4090 desktop; no improvement in max model size
- Thermal throttling under sustained inference — fans hit max and performance drops after initial burst
- Extremely expensive ($3,000–$4,500+) for a laptop with known thermal constraints
- Community consistently recommends AMD Ryzen AI Max+ 395 128GB as better LLM laptop option
- Loud fans during inference; not practical in quiet environments
- Desktop RTX 5090 (32GB) is significantly faster and available in compact SFF prebuilts

---

## 9. Asus ROG Flow Z13 / AMD Ryzen AI Max+ 395 (128GB unified memory)

**Key Specs:** Ryzen AI Max+ 395 "Strix Halo" APU, Radeon 8060S iGPU (40 CUs), 128GB unified LPDDR5x, ~256 GB/s memory bandwidth, 70–120W TDP

**Community Benchmarks & Evidence:**
- **"True Unicorn" thread** (r/LocalLLaMA, 5 months ago, **311 upvotes**, 306 comments): Cost comparison to build equivalent: $600+ for a 4-channel DDR5 motherboard alone; "Threadripper 9955 CPU costs $1,700 — and it's still 20% slower in bandwidth (220 GB/s vs 256 GB/s)" — u/ASYMT0TIC. The chip's 4-channel LPDDR5x in a laptop APU package is architecturally unique.
- **llama-bench results** (r/LocalLLaMA, 6 days ago, from ROCm thread): DeepSeek2-30B-A3B Q4_K_M — ROCm: pp512=**2,247 t/s**, tg128=**89 t/s**; Vulkan: pp=2,632, tg=**125 t/s**. Community note: ROCm PP performance was temporarily broken by a bug (now fixed); TG is ~20% slower on ROCm vs Vulkan.
- **70B/Q4 benchmark** (community-cited in "true unicorn" thread): ~**5.5 t/s** TG for 70B Q4; GPT-OSS-20B ~50 t/s TG. With Lemonade build: GPT-OSS-120B f16 at ~800 t/s PP.
- **Official vLLM support** (r/LocalLLaMA, 3 months ago): "The official vLLM support for the Ryzen AI Max+ 395 is here! (gfx1150 and gfx1151)" — GitHub PR merged. Ecosystem maturing rapidly.

**Notable Pros:**
- Best price-to-memory ratio: 128GB unified at ~$1,500–$2,500 (mini-PC configs from Minisforum, GMKtec, Framework board)
- Only x86 laptop/mini-PC platform that can hold 70B models fully in memory (without CPU offload)
- Runs Windows and Linux (dual-boot capable); more flexible than Apple Silicon
- Very low power draw (~70–120W system) vs NVIDIA equivalents
- Rapidly improving software ecosystem (ROCm, vLLM, llama.cpp, GAIA)

**Gotchas:**
- **Critical setup gotcha**: Default GPU VRAM allocation in BIOS is only 32GB. Must manually configure to 96GB or 128GB — otherwise performance is terrible and many models won't load properly.
- Memory bandwidth (~256 GB/s) is significantly lower than M3 Ultra (~800 GB/s) or RTX 5090 (~1,792 GB/s) — so token generation speed is modest
- ROCm ecosystem is still maturing vs Apple MLX or NVIDIA CUDA; occasional bugs
- ROCm token generation ~20% slower than Vulkan backend; KV cache allocated to shared memory (not VRAM) causes performance cliff at high context lengths
- Asus ROG Flow Z13 chassis is compact but throttles at high sustained loads; mini-PC form factors (Framework, Minisforum) handle sustained loads better

---

## 10. Qualcomm Snapdragon X Elite (Surface Pro 11, Lenovo Yoga Slim 7x, Dell XPS 13 9345)

**Key Specs:** Snapdragon X Elite X1E-80-100 or X1E-84-100, up to 64GB LPDDR5x unified memory, ~136 GB/s memory bandwidth, 45 TOPS NPU (Hexagon), Adreno GPU

**Community Benchmarks & Evidence:**
- **"Does it worth it for local LLM?"** (r/LocalLLaMA, 1 year ago): Community consensus: "As enthusiastic as I was about the Snapdragon X Elite, the issues have been too many and the overall performance too disappointing." — u/FullstackSensei.
- **Best reported benchmark** (same thread): User achieved ~**6 t/s on Qwen 2.5 32B Q4 for ARM**, without optimization, with old drivers and old LM Studio. "I wouldn't recommend it but it's probably the cheapest way to get 32B on the go."
- **NPU unusable for open-source inference**: "Last I checked, the NPU was yet to be supported by any of the open-source inference solutions. You'll have Vulkan [for the Adreno GPU], but the GPU leaves a lot to be desired." — u/FullstackSensei.
- **Qualcomm driver support model**: Qualcomm offloads driver updates to OEMs, meaning security and performance patches depend on Dell/Lenovo/Microsoft — not Qualcomm directly. This leads to inconsistent driver quality across devices.

**Notable Pros:**
- Outstanding battery life for light tasks: 15–20 hours general use on many Copilot+ PCs
- Ultra-thin, light form factor; best-in-class portability
- ARM-native Windows apps running efficiently on Qualcomm ARM SoC
- NPU has potential for future AI acceleration if Qualcomm/Microsoft build open frameworks
- Cheaper than Apple MacBook options with similar RAM (64GB Snapdragon laptops ~$1,000–$1,500)

**Gotchas:**
- ~6 t/s on 32B and even slower on larger models; practically unusable for interactive coding workflows
- Hexagon NPU cannot be used by llama.cpp, Ollama, or vLLM — only Qualcomm's own QNN SDK
- GPU memory bandwidth (~136 GB/s) is less than half of AMD Ryzen AI Max+ 395 (~256 GB/s); no competition for LLM inference
- Windows on ARM application compatibility: some x64 apps run via emulation with performance penalty
- Community consistently recommends Apple M-series or AMD Ryzen AI Max instead
- 72B+ models: "too slow for real time" — would be around 2–3 t/s at best

---

## Summary Comparison Table

| System | VRAM / Memory | Bandwidth | Best TG for 7B Q4 | 70B capable? | TDP | Price Range |
|---|---|---|---|---|---|---|
| Mac Studio M3 Ultra 512GB | 512GB unified | ~800 GB/s | ~120 t/s | ✅ Yes (slowly) | ~150W | $9,999 |
| MacBook Pro M4 Max 128GB | 128GB unified | ~410 GB/s | ~75 t/s | ⚠️ Slow | ~60W | $4,200+ |
| RTX 5090 Desktop | 32GB GDDR7 | 1,792 GB/s | ~250 t/s | ❌ Needs offload | ~575W | $1,999+ (GPU) |
| RTX 4090 Desktop | 24GB GDDR6X | 1,008 GB/s | ~140 t/s | ❌ Needs offload | ~450W | $1,100–1,400 (used GPU) |
| Dell Precision + RTX 6000 Ada | 48GB VRAM ECC | ~960 GB/s | ~200 t/s | ⚠️ Q4 | ~300W | $15,000–30,000 |
| HP Z8 G4 + A100 80GB | 80GB HBM2e | 2,000 GB/s | ~220 t/s | ✅ Yes (full Q) | ~400W | $5,000–12,000 |
| Lenovo P620 + 2×A6000 | 96GB VRAM total | ~1,900 GB/s | ~200 t/s | ✅ Yes | ~600W | $8,000–15,000 |
| Asus ROG RTX 5090 Laptop | 24GB GDDR7 | ~960 GB/s* | ~150–200 t/s | ❌ Needs offload | ~175W | $3,000–4,500 |
| Ryzen AI Max+ 395 / ROG Flow Z13 | 128GB unified | ~256 GB/s | ~90 t/s | ✅ Yes (~5.5 t/s) | ~70–120W | $1,500–2,500 |
| Snapdragon X Elite (64GB) | 64GB unified | ~136 GB/s | ~25 t/s | ❌ Too slow | ~20–45W | $1,000–1,500 |

*RTX 5090 Laptop GPU bandwidth derated from desktop due to Max-Q power limits

---

## Key Themes / Talking Points for Comparison Page

1. **The memory bandwidth war**: For LLM token generation, bandwidth is king. RTX 5090 > A100 ≈ H100 (bandwidth-wise) > RTX 4090 > M3 Ultra > M4 Max > Ryzen AI Max 395 > Snapdragon X Elite.

2. **The capacity vs. speed trade-off**: Small, fast VRAM (5090: 32GB) vs. large, moderate-speed unified memory (M3 Ultra: 512GB; Ryzen AI Max: 128GB). Community splits hard on this: "5090 is faster for models that fit; M3 Ultra for larger models that can't fit elsewhere."

3. **Software ecosystem maturity ladder**: NVIDIA CUDA (best) > Apple MLX (excellent for Apple hardware) > AMD ROCm (good, improving) > Qualcomm QNN (immature for open-source inference).

4. **Power/thermal reality check**: RTX 5090 at ~575W and RTX 4090 at ~450W are "space heaters." Apple Silicon and Ryzen AI Max offer 5–10x lower power for comparable large-model capability.

5. **The "true unicorn" insight**: Ryzen AI Max+ 395 at 128GB unified memory is the most cost-effective way to run 70B+ models on x86 hardware. Nothing else at <$2,500 can do it. But it's ~3x slower than M3 Ultra for the same task.

6. **Enterprise vs. hobbyist divide**: Dell Precision, HP Z8 G4 + A100, and Lenovo ThinkStation P620 serve professional/enterprise needs (ISV certs, ECC, support contracts) that the LocalLLM community rarely needs. For pure inference value, consumer and prosumer hardware wins.

---

*Sources: r/LocalLLaMA threads (linked in notes), community benchmarks via llama-bench and MLX, February 2026.*
