/**
 * Hardware Data Service
 * Loads and provides access to centralized hardware specifications
 * from data/hardware.json
 */

const HardwareData = (function() {
  let _data = null;
  let _loaded = false;
  let _loadPromise = null;

  /**
   * Load hardware data from JSON file
   * @returns {Promise<Object>} Hardware data object
   */
  async function load() {
    if (_loaded) return _data;
    if (_loadPromise) return _loadPromise;

    _loadPromise = fetch('data/hardware.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load hardware data: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        _data = data;
        _loaded = true;
        console.log('[HardwareData] Loaded successfully. Last updated:', data.metadata?.lastUpdated);
        return _data;
      })
      .catch(error => {
        console.error('[HardwareData] Failed to load:', error);
        throw error;
      });

    return _loadPromise;
  }

  /**
   * Get all data (must call load() first)
   */
  function getData() {
    return _data;
  }

  /**
   * Get metadata
   */
  function getMetadata() {
    return _data?.metadata;
  }

  /**
   * Get Apple configurations
   */
  function getAppleData() {
    return _data?.apple;
  }

  /**
   * Get NVIDIA GPU data
   */
  function getNvidiaData() {
    return _data?.nvidia;
  }

  /**
   * Get AMD GPU data
   */
  function getAmdData() {
    return _data?.amd;
  }

  /**
   * Get GPU rankings
   */
  function getGpuRankings() {
    return _data?.gpuRankings;
  }

  /**
   * Get use case requirements
   */
  function getUseCases() {
    return _data?.useCases;
  }

  /**
   * Get DIY build recommendations
   */
  function getDiyRecommendations() {
    return _data?.diyRecommendations;
  }

  /**
   * Get prebuilt systems
   */
  function getPrebuiltSystems() {
    return _data?.prebuiltSystems;
  }

  /**
   * Convert GPU data to the format expected by the existing GPU_DATA array
   * @returns {Array} GPU data in legacy format
   */
  function getGpuDataArray() {
    if (!_data) return [];

    const gpus = [];

    // Add NVIDIA consumer GPUs
    const nvidia50 = _data.nvidia?.consumer?.['50series']?.cards || {};
    const nvidia40 = _data.nvidia?.consumer?.['40series']?.cards || {};
    const nvidia30 = _data.nvidia?.consumer?.['30series']?.cards || {};

    Object.values(nvidia50).forEach(gpu => {
      gpus.push({
        name: gpu.name,
        mfr: 'NVIDIA',
        vram: parseInt(gpu.vram),
        bw: parseInt(gpu.memoryBandwidth),
        tg7b: estimateTg7b(gpu),
        tg70b: null,
        price: gpu.price,
        tier: 'consumer',
        bestFor: getBestForText(gpu)
      });
    });

    Object.values(nvidia40).forEach(gpu => {
      gpus.push({
        name: gpu.name,
        mfr: 'NVIDIA',
        vram: parseInt(gpu.vram),
        bw: parseInt(gpu.memoryBandwidth),
        tg7b: estimateTg7b(gpu),
        tg70b: null,
        price: gpu.price,
        tier: 'consumer',
        bestFor: getBestForText(gpu)
      });
    });

    // Add AMD GPUs
    const amd7000 = _data.amd?.radeon?.['7000series']?.cards || {};
    Object.values(amd7000).forEach(gpu => {
      gpus.push({
        name: gpu.name,
        mfr: 'AMD',
        vram: parseInt(gpu.vram),
        bw: parseInt(gpu.memoryBandwidth),
        tg7b: estimateTg7bAmd(gpu),
        tg70b: null,
        price: gpu.price,
        tier: 'consumer',
        bestFor: getBestForText(gpu)
      });
    });

    // Add Apple Silicon
    const macStudio = _data.apple?.macStudio?.configurations || {};
    Object.entries(macStudio).forEach(([key, config]) => {
      if (key.includes('ultra')) {
        const memGB = parseInt(config.memory);
        gpus.push({
          name: `${config.chip} (${config.memory})`,
          mfr: 'Apple',
          vram: memGB,
          bw: 800,
          tg7b: 120,
          tg70b: memGB >= 128 ? (memGB >= 256 ? 20 : 16) : null,
          price: config.price,
          tier: 'desktop',
          bestFor: `Up to ${estimateMaxModelSize(memGB)}B models; silent & efficient`
        });
      }
    });

    return gpus;
  }

  /**
   * Get systems data for the Best Match finder
   * @returns {Array} Systems in legacy format
   */
  function getSystemsArray() {
    if (!_data) return [];

    const systems = [];

    // Add Mac Studio configurations
    const macStudio = _data.apple?.macStudio?.configurations || {};
    Object.entries(macStudio).forEach(([key, config]) => {
      const memGB = parseInt(config.memory);
      systems.push({
        name: `Apple Mac Studio (${config.chip} ${config.memory})`,
        mfr: 'apple',
        os: ['macos'],
        ff: 'desktop',
        unified: true,
        memGB: memGB,
        vramGB: memGB,
        bwGBs: 800,
        minPrice: config.price,
        maxPrice: config.price + 1000,
        maxModel: estimateMaxModelSize(memGB),
        tg7b: 120,
        tg13b: 72,
        tg70b: memGB >= 128 ? (memGB >= 256 ? 20 : 16) : null,
        priority: ['capacity', 'value']
      });
    });

    // Add MacBook Pro configurations
    const macBookPro = _data.apple?.macBookPro?.configurations || {};
    Object.entries(macBookPro).forEach(([key, config]) => {
      const memGB = parseInt(config.memory);
      systems.push({
        name: `Apple ${config.name}`,
        mfr: 'apple',
        os: ['macos'],
        ff: 'laptop',
        unified: true,
        memGB: memGB,
        vramGB: memGB,
        bwGBs: 410,
        minPrice: config.price,
        maxPrice: config.price + 500,
        maxModel: estimateMaxModelSize(memGB),
        tg7b: 75,
        tg13b: 45,
        tg70b: memGB >= 128 ? 6 : null,
        priority: ['capacity', 'portable']
      });
    });

    return systems;
  }

  /**
   * Get compare data for system comparison
   * @returns {Object} Compare data in legacy format
   */
  function getCompareData() {
    if (!_data) return {};

    const cmpData = {};

    // Add Mac Studio configurations
    const macStudio = _data.apple?.macStudio?.configurations || {};
    Object.entries(macStudio).forEach(([key, config]) => {
      const memGB = parseInt(config.memory);
      const cpuCores = parseInt(config.cpu);
      const gpuCores = parseInt(config.gpu);

      cmpData[key] = {
        name: `Mac Studio ${config.chip}`,
        sub: `${config.cpu} CPU / ${config.gpu} GPU / ${config.memory}`,
        mfr: 'apple',
        memGB: memGB,
        bwGBs: 800,
        cpuCores: cpuCores,
        gpuCores: gpuCores,
        unified: true,
        tg7b: 120,
        tg13b: 72,
        tg70b: memGB >= 128 ? (memGB >= 256 ? 20 : 16) : null,
        tg120b: memGB >= 256 ? 10 : null,
        price: config.price,
        framework: 'MLX / llama.cpp Metal',
        vramGB: memGB,
        notes: generateNotes(config)
      };
    });

    // Add NVIDIA GPUs
    const nvidia50 = _data.nvidia?.consumer?.['50series']?.cards || {};
    Object.entries(nvidia50).forEach(([key, gpu]) => {
      const vramGB = parseInt(gpu.vram);
      cmpData[key] = {
        name: gpu.name,
        sub: `${gpu.vram} ${gpu.vramType} — ${gpu.memoryBandwidth}`,
        mfr: 'nvidia',
        memGB: vramGB,
        bwGBs: parseInt(gpu.memoryBandwidth),
        cpuCores: null,
        gpuCores: null,
        unified: false,
        tg7b: estimateTg7b(gpu),
        tg13b: Math.round(estimateTg7b(gpu) * 0.68),
        tg70b: null,
        tg120b: null,
        price: gpu.price,
        framework: 'CUDA / llama.cpp / ExLlamaV2',
        vramGB: vramGB,
        notes: `${gpu.name}. ${vramGB}GB VRAM supports up to ~${estimateMaxModelSizeFromVram(vramGB)}B Q4 models.`
      };
    });

    return cmpData;
  }

  // ─────────────────────────────────────────────────────────────
  // Helper Functions
  // ─────────────────────────────────────────────────────────────

  function estimateTg7b(gpu) {
    // Estimate tokens/sec for 7B based on bandwidth
    const bw = parseInt(gpu.memoryBandwidth);
    if (bw >= 1500) return 250;
    if (bw >= 1000) return 140;
    if (bw >= 800) return 130;
    if (bw >= 600) return 100;
    return 80;
  }

  function estimateTg7bAmd(gpu) {
    const bw = parseInt(gpu.memoryBandwidth);
    if (bw >= 900) return 135;
    if (bw >= 700) return 115;
    return 90;
  }

  function estimateMaxModelSize(memGB) {
    // Rough estimate of max Q4 model size
    if (memGB >= 512) return 200;
    if (memGB >= 256) return 120;
    if (memGB >= 128) return 70;
    if (memGB >= 64) return 30;
    if (memGB >= 32) return 20;
    if (memGB >= 24) return 13;
    return 7;
  }

  function estimateMaxModelSizeFromVram(vramGB) {
    if (vramGB >= 80) return 70;
    if (vramGB >= 48) return 30;
    if (vramGB >= 32) return 26;
    if (vramGB >= 24) return 20;
    if (vramGB >= 16) return 13;
    return 7;
  }

  function getBestForText(gpu) {
    const vram = parseInt(gpu.vram);
    const bw = parseInt(gpu.memoryBandwidth);
    
    if (vram >= 32 && bw >= 1500) return 'Fastest consumer GPU for ≤30B models';
    if (vram >= 24 && bw >= 900) return 'Best value for 7B–24B models';
    if (vram >= 16) return 'Good for 7B–13B models';
    if (vram >= 12) return 'Entry-level for 7B models';
    return 'Basic inference capable';
  }

  function generateNotes(config) {
    const memGB = parseInt(config.memory);
    const chip = config.chip;

    if (chip.includes('Ultra')) {
      if (memGB >= 512) return '512 GB unified. Enables 405B and MoE 671B (quantised).';
      if (memGB >= 256) return '256 GB enables 120B Q4 comfortably.';
      return 'Entry Ultra config. 70B Q4 runs with limited context.';
    }
    if (chip.includes('Max')) {
      if (memGB >= 128) return '128 GB enables 70B Q4 with headroom.';
      return '64 GB allows 30B Q4 comfortably.';
    }
    return '';
  }

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────

  return {
    load,
    getData,
    getMetadata,
    getAppleData,
    getNvidiaData,
    getAmdData,
    getGpuRankings,
    getUseCases,
    getDiyRecommendations,
    getPrebuiltSystems,
    getGpuDataArray,
    getSystemsArray,
    getCompareData
  };

})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HardwareData;
}
