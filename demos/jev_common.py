"""Small shared helpers for the Jev talk demos.

Uses the plain HTTP API (POST /v1/systemone) so the request/response
you see in the terminal is exactly what goes over the wire.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CAPTURES = ROOT / "captures"
DATA = ROOT / "data"


def _load_dotenv() -> None:
    """Read KEY=value lines from the repo's .env (gitignored). Real environment variables win."""
    path = ROOT / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()

API_URL = os.environ.get("TYPESAFE_BASE_URL", "https://api.typesafe.ai").rstrip("/") + "/v1/systemone"
# Pinned version: the "jev-latest" alias can move to a new model without notice.
MODEL = os.environ.get("JEV_MODEL", "jev-1.13.0")
PRICE_PER_INPUT_TOKEN = 42 / 1_000_000_000  # $42 per billion input tokens; output is free

# Windows terminals: make sure UTF-8 and ANSI colours work.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
if os.name == "nt":
    os.system("")  # enables ANSI escape codes in the Windows console


def api_key() -> str:
    key = os.environ.get("TYPESAFE_API_KEY")
    if not key:
        sys.exit("TYPESAFE_API_KEY is not set. Copy .env.example to .env and add your key.")
    return key


def build_payload(state, questions) -> dict:
    return {"state": state, "model": MODEL, "questions": questions}


_client: httpx.Client | None = None


def _sync_client() -> httpx.Client:
    """One shared client, so TLS setup is not counted in every call's latency."""
    global _client
    if _client is None:
        _client = httpx.Client(headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"})
    return _client


def server_ms(r: httpx.Response) -> int | None:
    """Time spent inside TypeSafe's servers, from the proxy's response header (not a documented field)."""
    v = r.headers.get("x-envoy-upstream-service-time")
    return int(v) if v and v.isdigit() else None


def call_jev(state, questions, timeout: float = 10.0) -> dict:
    """One synchronous call. Returns {'request', 'response', 'latency_ms', 'server_ms'}.

    latency_ms is the full round trip as seen from this machine.
    """
    payload = build_payload(state, questions)
    client = _sync_client()
    t0 = time.perf_counter()
    r = client.post(API_URL, json=payload, timeout=timeout)
    latency_ms = (time.perf_counter() - t0) * 1000
    if r.status_code != 200:
        raise RuntimeError(f"Jev API error {r.status_code}: {r.text[:500]}")
    return {"request": payload, "response": r.json(), "latency_ms": round(latency_ms, 1), "server_ms": server_ms(r)}


async def call_jev_async(client: httpx.AsyncClient, state, questions, retries: int = 6) -> dict:
    payload = build_payload(state, questions)
    delay = 0.5
    for attempt in range(retries):
        t0 = time.perf_counter()
        try:
            r = await client.post(API_URL, json=payload)
        except (httpx.TransportError,) as e:
            if attempt == retries - 1:
                raise
            await asyncio.sleep(delay)
            delay = min(delay * 2, 8)
            continue
        latency_ms = (time.perf_counter() - t0) * 1000
        if r.status_code in (429, 529, 500, 502, 503, 504):
            retry_after = r.headers.get("retry-after", "")
            await asyncio.sleep(float(retry_after) if retry_after.replace(".", "", 1).isdigit() else delay)
            delay = min(delay * 2, 8)
            continue
        if r.status_code != 200:
            raise RuntimeError(f"Jev API error {r.status_code}: {r.text[:500]}")
        return {"response": r.json(), "latency_ms": round(latency_ms, 1), "server_ms": server_ms(r)}
    raise RuntimeError("Jev API: too many retries")


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


# ---- tiny colour helpers -------------------------------------------------
def c(text, code):
    return f"\033[{code}m{text}\033[0m"

BOLD, DIM = "1", "2"
