# 🦅 eBay Stealth Scraper & Arbitrage Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-3178c6.svg)
![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)

**A high-performance, anti-detect scraping tool designed to uncover underpriced eBay listings in real-time.**

This project goes beyond simple HTML parsing. It implements advanced **TLS fingerprint spoofing** to bypass modern anti-bot protections, coupled with a reactive **Cyberpunk-styled dashboard** for data visualization and arbitrage analysis.

---

## 🚀 Key Features

### 🕵️‍♂️ Stealth Scraping Engine

- **TLS Fingerprint Bypassing**: Uses `curl_cffi` to impersonate legitimate Chrome browser signatures (JA3/JA4), successfully evading eBay's strict anti-bot measures where standard libraries (Requests, Selenium) fail.
- **Smart Fallbacks**: Automatically switches strategies (e.g., from "Sold" to "Active" listings) and rotates headers to maintain access.
- **Robust Parsing**: Handles dynamic CSS class obfuscation (`s-item` vs `s-card`) and locale-specific formats (French dates/prices).

### � Arbitrage Intelligence Dashboard

- **Value Radar**: A custom Recharts visualization that plots Price vs. Rating/Condition to identify the "sweet spot" deals.
- **Deal Scoring**: Automatically calculates a `Value Score` for every item to highlight profitable flips.
- **Instant Filtering**: Real-time sorting and filtering by price, condition, and date without re-fetching data.

### ⚡ Modern Tech Stack

- **Backend**: Python, Flask, BeautifulSoup4, `curl_cffi`.
- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **DevOps**: Fully Dockerized with `docker-compose` for one-command deployment.

---

## 🧠 Technical Highlights (For Recruiters)

This project solves a specific engineering challenge: **Data Extraction from Protected Targets.**

1. **The Challenge**: eBay employs advanced bot detection that analyzes the **TLS Handshake** (JA3 fingerprint). Standard Python requests have a distinct fingerprint that is immediately blocked (403/503 errors), regardless of User-Agent rotation.
2. **The Solution**: I implemented a custom HTTP client using `curl_cffi` (Foreign Function Interface for curl). This allows the Python backend to perform a TLS handshake that is **cryptographically identical** to a real Chrome 120 browser.
3. **The Result**: The scraper achieves a near-100% success rate on protected pages, extracting critical market data that standard tools cannot reach.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Core Logic** | Python 3.9+ |
| **API** | Flask (RESTful) |
| **Scraping** | `curl_cffi`, BeautifulSoup4 |
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS (Cyberpunk Theme) |
| **Viz** | Recharts, Lucide React |
| **Container** | Docker, Docker Compose |

---

## 🏁 Getting Started

### Prerequisites

- Docker & Docker Compose
- *Or* Python 3.9+ and Node.js 18+ (for local dev)

### Quick Start (Docker)

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/amazon-scraping-tool.git
   cd amazon-scraping-tool
   ```

2. **Launch the stack**

   ```bash
   docker compose up --build
   ```

3. **Access the App**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## � Screenshots

*(Add screenshots of your dashboard here)*

---

## 🔮 Future Roadmap

- [ ] **Multi-Platform Support**: Expand to Amazon and Rakuten.
- [ ] **AI Price Analysis**: Integrate OpenAI API to estimate item condition from images.
- [ ] **Notification System**: Telegram/Discord alerts for high-value snipes.

---

Made with ❤️ by [Your Name]
