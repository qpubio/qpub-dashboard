# Changelog

All notable changes to QPub Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.2.2] - 2026-09-30

### Fixed

- Align LED chart tooltip hover with the cursor column across responsive widths

## [v0.2.1] - 2026-09-28

### Fixed

- Remove demo metric history seeding so Overview and Monitoring charts reflect live overview polls only
- Refresh overview documentation screenshot

## [v0.2.0] - 2026-09-28

### Features

- LED matrix charts on Overview and Monitoring (canvas diode board, stair-step traces, rolling 3m window)
- Client-side metric history from the existing 2s overview poll (rates for msg/bw, levels for conn/sub/chan)

## [v0.1.0] - 2026-09-28

### Features

- Initial OSS release of the self-hosted QPub Dashboard (Next.js + SQLite server registry)
- Control API client for tenants, API keys, queues, workers, connections, channels, and metrics
- Tenant and key IDs use hash PublicIDs (requires **qpub-server >= v1.3.0**)
- Docker image and compose for local / self-hosted runs
