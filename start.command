#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Vesper luxury 3D sword atelier server on http://localhost:8080..."

# Open browser in background
(sleep 1 && (open http://localhost:8080 || xdg-open http://localhost:8080 || start http://localhost:8080)) &

# Run python HTTP server
if command -v python3 &>/dev/null; then
    python3 -m http.server 8080
else
    python -m http.server 8080
fi
