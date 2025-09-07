# Signal Processing Visualizer (SPV) 📊

An interactive, web-based Digital Signal Processing (DSP) tool built for students, educators, and engineers. This application allows users to upload or generate signals and interactively explore time-domain and frequency-domain representations. Perform real-time analysis, apply filters, compute convolutions, and visualize spectrograms with a clean and intuitive interface.

**Live Demo: [https://signal-processor.me](https://signal-processor.me)**

---

## ✨ Key Features

* **Interactive Visualizations**: Pan, zoom, and inspect signals in both the time and frequency domains (Time, FFT, Spectrogram) using Plotly.js.
* **Comprehensive DSP Toolkit**: Compute FFTs, convolve signals, and generate spectrograms using a powerful Python backend with SciPy and NumPy.
* **Real-Time Analysis**: Capture live audio from your microphone and see the frequency spectrum update in real-time (requires HTTPS).
* **File Handling**: Upload signals in CSV format, specify custom sample rates, and export processed signals back to your computer.
* **Modern Tech Stack**: Built with a React/TypeScript frontend, a Node.js/Express API gateway, and a Python/FastAPI microservice for DSP tasks.
* **Production Ready**: The entire application is containerized with Docker and orchestrated with Docker Compose for easy deployment and scalability.

---

## 🏗️ System Architecture

This project uses a microservice architecture to separate concerns:

* **React Frontend (with Nginx)**: Handles all UI rendering and user interaction. Nginx acts as the web server and a reverse proxy to the API.
* **Express API**: Acts as a gateway, routing requests from the frontend to the appropriate backend service.
* **FastAPI DSP Service**: A dedicated Python service for performing numerically intensive DSP calculations.



---

## 🛠️ Tech Stack

| Category      | Technology                               |
| :------------ | :--------------------------------------- |
| **Frontend** | React, TypeScript, Vite, Plotly.js, Tailwind CSS |
| **API Gateway** | Node.js, Express, TypeScript, Axios      |
| **DSP Service** | Python, FastAPI, NumPy, SciPy            |
| **Deployment**| Docker, Docker Compose, Nginx, Microsoft Azure |

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v20.x or higher)
* Python (v3.11 or higher)
* Docker & Docker Compose

### Running Locally with Docker (Recommended)

This is the easiest way to run the entire application on your local machine.

1.  Clone the repository:
    ```bash
    git clone [https://github.com/nishkun/Digital-Signal-Processing-Visualizer.git](https://github.com/nishkun/Digital-Signal-Processing-Visualizer.git)
    ```
2.  Navigate to the project root:
    ```bash
    cd Digital-Signal-Processing-Visualizer
    ```
3.  Build and run the containers:
    ```bash
    docker-compose up --build
    ```
4.  Open your browser and navigate to `http://localhost:8080`.

---

## ☁️ Deployment on Microsoft Azure

This application is deployed on an Azure Virtual Machine. Here is a summary of the deployment process:

1.  **Create an Azure VM**:
    * An Azure B-Series VM (like `B2ats_v2`) running Ubuntu Server 22.04 LTS was provisioned.
    * Inbound port rules were configured in the Network Security Group (NSG) to allow public traffic on ports **22 (SSH)**, **80 (HTTP)**, and **443 (HTTPS)**.

2.  **Server Setup**:
    * Connected to the VM via SSH.
    * Installed Docker, Docker Compose, and Git on the server.

3.  **Application Launch**:
    * The project repository was cloned onto the VM.
    * The application was launched using `docker-compose up --build -d` to run the containers in the background.

4.  **Domain & SSL Configuration**:
    * A custom domain (`signal-processor.me`) was registered and pointed to the VM's public IP address using `A` records.
    * A free SSL certificate was obtained from Let's Encrypt using the `certbot` tool in standalone mode.
    * The Nginx service was configured to handle HTTPS traffic and redirect all HTTP requests to HTTPS for a secure connection.

This setup ensures the application is scalable, secure, and easily reproducible on any cloud platform.
