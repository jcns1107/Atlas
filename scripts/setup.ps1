# Atlas — one-time setup for Windows / PowerShell.
# Usage:  ./scripts/setup.ps1

Write-Host "==> Creating virtual environment (.venv)" -ForegroundColor Cyan
python -m venv .venv

Write-Host "==> Activating venv" -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

Write-Host "==> Upgrading pip + installing requirements" -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r requirements.txt

if (-not (Test-Path .env)) {
    Write-Host "==> Creating .env from template" -ForegroundColor Cyan
    Copy-Item .env.example .env
}

Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Green
Write-Host "  1. Install Ollama:  https://ollama.com/download"
Write-Host "  2. Pull a model:    ollama pull llama3.2"
Write-Host "  3. Start Atlas:     python run.py"
Write-Host "  4. Open:            http://127.0.0.1:8000"
