# Signal Processing Visualizer (SPV) 📊

An interactive, web-based Digital Signal Processing (DSP) tool built for students, educators, and engineers. This application allows users to upload or generate signals and interactively explore time-domain and frequency-domain representations. Perform real-time analysis, apply filters, compute convolutions, and visualize spectrograms with a clean and intuitive interface.

**[Link to Live Demo]** (We will add this once it's deployed)

---

## ✨ Key Features

* **Interactive Visualizations**: Pan, zoom, and inspect signals in both the time and frequency domains using Plotly.js.
* **Comprehensive DSP Toolkit**: Compute FFTs, convolve signals, and generate spectrograms using a powerful Python backend with SciPy and NumPy.
* **Real-Time Analysis**: Capture live audio from your microphone and see the frequency spectrum update in real-time.
* **File Handling**: Upload signals in CSV format, specify sample rates, and export processed signals back to your computer.
* **Modern Tech Stack**: Built with a React/TypeScript frontend, a Node.js/Express API gateway, and a Python/FastAPI microservice for DSP tasks.
* **Production Ready**: The entire application is containerized with Docker and orchestrated with Docker Compose for easy deployment and scalability.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v20.x or higher)
* Python (v3.11 or higher)
* Docker & Docker Compose

### Running with Docker (Recommended)

This is the easiest way to run the entire application.

1.  Clone the repository:
    ```bash
    git clone [your-repo-url]
    ```
2.  Navigate to the project root:
    ```bash
    cd spv
    ```
3.  Build and run the containers:
    ```bash
    docker-compose up --build
    ```
4.  Open your browser and navigate to `http://localhost:8080`.

---

## 🛠️ Tech Stack

| Category      | Technology                               |
| :------------ | :--------------------------------------- |
| **Frontend** | React, TypeScript, Vite, Plotly.js, Tailwind CSS |
| **API Gateway** | Node.js, Express, TypeScript, Axios      |
| **DSP Service** | Python, FastAPI, NumPy, SciPy            |
| **Deployment**| Docker, Docker Compose, Nginx            |

---

## 🏗️ System Architecture

This project uses a microservice architecture to separate concerns:

* **React Frontend**: Handles all UI rendering and user interaction.
* **Express API**: Acts as a gateway, routing requests from the frontend to the appropriate backend service.
* **FastAPI DSP Service**: A dedicated Python service for performing numerically intensive DSP calculations.



---