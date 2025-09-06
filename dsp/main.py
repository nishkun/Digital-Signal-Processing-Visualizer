# dsp/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from scipy import signal

app = FastAPI()


class ConvolveData(BaseModel):
    signalA: list[float]
    signalB: list[float]


# Define the structure of the incoming request body
class SignalData(BaseModel):
    samples: list[float]
    sampleRate: int


# 2. Add the new convolution endpoint
@app.post("/api/dsp/convolve")
def compute_convolution(data: ConvolveData):
    # Use NumPy to perform the convolution
    result = np.convolve(data.signalA, data.signalB, mode='full').tolist()
    return {"samples": result}


@app.post("/api/dsp/stft")
def compute_stft(data: SignalData):
    samples_array = np.array(data.samples)

    # Perform the Short-Time Fourier Transform
    f, t, Zxx = signal.stft(samples_array, fs=data.sampleRate)

    magnitude = np.abs(Zxx)

    # Return the frequencies, time segments, and magnitude data
    return {
        "f": f.tolist(),
        "t": t.tolist(),
        "Zxx": magnitude.tolist()
    }


@app.post("/api/dsp/fft")
def compute_fft(data: SignalData):
    # Convert the list of samples to a NumPy array
    samples_array = np.array(data.samples)

    # Perform the Fast Fourier Transform
    fft_result = np.fft.fft(samples_array)
    # Get the corresponding frequencies
    freq = np.fft.fftfreq(len(samples_array), 1 / data.sampleRate)

    positive_freq_indices = np.where(freq >= 0)

    freq_out = freq[positive_freq_indices].tolist()
    magnitude_out = np.abs(fft_result[positive_freq_indices]).tolist()

    return {"freq": freq_out, "magnitude": magnitude_out}


@app.get("/")
def read_root():
    return {"message": "DSP Service is running"}
