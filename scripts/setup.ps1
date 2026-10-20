# Atlas — one-time setup for Windows / PowerShell.
# Usage:  ./scripts/setup.ps1
#
# Uses uv (https://docs.astral.sh/uv/) — one fast tool that installs Python,
# creates the virtual environment (.venv), and installs the dependencies listed
# in pyproject.toml, pinned exactly by uv.lock.

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "uv is not installed. Install it with:" -ForegroundColor Yellow
    Write-Host '  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
    Write-Host "Then open a new terminal and run this script again."
    exit 1
}

Write-Host "==> Creating .venv and installing dependencies (uv sync)" -ForegroundColor Cyan
uv sync

if (-not (Test-Path .env)) {
    Write-Host "==> Creating .env from template" -ForegroundColor Cyan
    Copy-Item .env.example .env
}

Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Green
Write-Host "  1. Install Ollama:  https://ollama.com/download"
Write-Host "  2. Pull a model:    ollama pull qwen3:4b      (small PC: qwen3:1.7b)"
Write-Host "  3. Start Atlas:     uv run python run.py"
Write-Host "  4. Open:            http://127.0.0.1:8000"
