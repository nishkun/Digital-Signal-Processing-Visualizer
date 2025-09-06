# dsp/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI()

# Define the structure of the incoming request body
class SignalData(BaseModel):
    samples: list[float]
    sampleRate: int

@app.post("/api/dsp/fft")
def compute_fft(data: SignalData):
    # Convert the list of samples to a NumPy array
    samples_array = np.array(data.samples)
    
    # Perform the Fast Fourier Transform
    fft_result = np.fft.fft(samples_array)
    # Get the corresponding frequencies
    freq = np.fft.fftfreq(len(samples_array), 1 / data.sampleRate)
    
    # We only need the first half of the results (positive frequencies)
    n_samples = len(samples_array)
    positive_freq_indices = np.where(freq >= 0)
    
    freq_out = freq[positive_freq_indices].tolist()
    magnitude_out = np.abs(fft_result[positive_freq_indices]).tolist()
    
    return {"freq": freq_out, "magnitude": magnitude_out}

@app.get("/")
def read_root():
    return {"message": "DSP Service is running"}