"""Recommend Ollama models that will actually run on this machine.

This is deliberately simple and rule-based so it's easy to read and extend.
The rule of thumb: a quantized model needs roughly its parameter count in GB
of memory (a 7B Q4 model ~ 4-5 GB). We compare that against available RAM
(and VRAM if you wire up GPU detection later) and only suggest models that fit.

TODO (later phases):
  - Detect GPU VRAM (nvidia-smi / torch / wmi) and prefer it over system RAM.
  - Pull the live model catalog instead of this static list.
"""

from __future__ import annotations

import psutil

# (display name, ollama tag, approx RAM needed in GB for a Q4 quant)
_CATALOG = [
    ("Llama 3.2 1B", "llama3.2:1b", 2),
    ("Llama 3.2 3B", "llama3.2", 4),
    ("Phi-3 Mini", "phi3", 4),
    ("Mistral 7B", "mistral", 6),
    ("Llama 3.1 8B", "llama3.1", 8),
    ("Qwen2.5 14B", "qwen2.5:14b", 12),
    ("Gemma 2 27B", "gemma2:27b", 20),
    ("Llama 3.3 70B", "llama3.3", 48),
]


def system_profile() -> dict:
    """A small snapshot of the machine's memory and CPU."""
    vm = psutil.virtual_memory()
    return {
        "total_ram_gb": round(vm.total / 1024**3, 1),
        "available_ram_gb": round(vm.available / 1024**3, 1),
        "cpu_cores": psutil.cpu_count(logical=True),
        # GPU/VRAM detection is a later-phase exercise; assume none for now.
        "vram_gb": None,
    }


def recommend_models(profile: dict | None = None) -> list[dict]:
    """Return catalog entries that fit, flagged by how comfortably they run."""
    profile = profile or system_profile()
    budget = profile["vram_gb"] or profile["total_ram_gb"]

    out: list[dict] = []
    for name, tag, need in _CATALOG:
        if need <= budget * 0.6:
            fit = "comfortable"
        elif need <= budget * 0.85:
            fit = "tight"
        else:
            fit = "too_large"
        out.append({"name": name, "tag": tag, "ram_gb": need, "fit": fit})
    return out
