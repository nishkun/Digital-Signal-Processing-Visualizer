// frontend/src/App.tsx
import { useState } from 'react';
import './index.css'; // Make sure your Tailwind CSS import is here
import axios from 'axios';
import Plot from 'react-plotly.js';

// Define types for our data for better organization
interface Signal {
  id: string;
  name: string;
  samples: number[];
  sampleRate: number;
}

interface FftResult {
  freq: number[];
  magnitude: number[];
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [fftResult, setFftResult] = useState<FftResult | null>(null);
  const [sampleRate, setSampleRate] = useState<number>(44100);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const parseCSV = (file: File): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const samples = text
          .split('\n') // Split the file into lines
          .map(line => parseFloat(line.trim())) // Convert each line to a number
          .filter(value => !isNaN(value)); // Remove any empty lines or non-numeric values
        
        resolve(samples);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsText(file);
    });
  };

  // frontend/src/App.tsx

const handleUpload = async () => {
  if (!selectedFile) {
    alert('Please select a file first!');
    return;
  }

  // --- Step 1: Upload the file to the backend (good for storage) ---
  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    // This sends the file to your Node.js server's /uploads folder
    await axios.post('http://127.0.0.1:3001/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    // --- Step 2: Parse the file on the frontend for immediate use ---
    const samples = await parseCSV(selectedFile);

    if (samples.length === 0) {
      alert('Could not parse any valid samples from the file.');
      return;
    }

    const newSignal: Signal = {
      id: new Date().toISOString(),
      name: selectedFile.name,
      samples: samples,
      sampleRate: sampleRate, // We will make this user-defined next
    };

    setActiveSignal(newSignal);
    setFftResult(null); // Clear previous FFT result
    alert(`Successfully processed ${samples.length} samples from the file!`);

  } catch (error) {
    console.error('Error during upload or parse:', error);
    alert('An error occurred.');
  }
};

  const handleComputeFft = async () => {
    if (!activeSignal) {
      alert('Please upload and process a signal first.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:3001/api/dsp/fft', {
        samples: activeSignal.samples,
        sampleRate: activeSignal.sampleRate,
      });
      setFftResult(response.data);
      console.log('FFT Result:', response.data);
    } catch (error) {
      console.error('Error computing FFT:', error);
      alert('Error computing FFT.');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold">Signal Processing Visualizer</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 p-4 gap-4">
        {/* Left Panel: Controls */}
        <aside className="w-1/4 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl mb-4 border-b border-gray-600 pb-2">Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium mb-1">
                Upload Signal File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>
            <div>
  <label htmlFor="sample-rate" className="block text-sm font-medium mb-1">
    Sample Rate (Hz)
  </label>
  <input
    id="sample-rate"
    type="number"
    value={sampleRate}
    onChange={(e) => setSampleRate(parseInt(e.target.value, 10))}
    className="block w-full bg-gray-700 border-gray-600 rounded-md p-2"
  />
</div>
            <button
              onClick={handleUpload}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Upload & Process
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-600">
            <button
                onClick={handleComputeFft}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
            >
                Compute FFT
            </button>
          </div>
        </aside>

        {/* Center Panel: Main Plot Area */}
        <section className="flex-1 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl mb-4">Frequency Domain (FFT)</h2>
          <div className="w-full h-96 bg-black rounded-md">
            {fftResult ? (
              <Plot
              data={[
                {
                  x: fftResult.freq,
                  y: fftResult.magnitude,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: 'cyan' },
                },
              ]}
              layout={{
                autosize: true,
                plot_bgcolor: '#000',
                paper_bgcolor: '#1f2937',
                font: { color: '#fff' },
                // v-- CORRECTED STRUCTURE FOR AXIS TITLES --v
                xaxis: { title: { text: 'Frequency (Hz)' } },
                yaxis: { title: { text: 'Magnitude' } },
              }}
              useResizeHandler={true}
              className="w-full h-full"
            />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Compute FFT to see the plot</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Signal List */}
        <aside className="w-1/4 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl mb-4 border-b border-gray-600 pb-2">Signal List</h2>
          {activeSignal && (
            <div className="bg-gray-700 p-2 rounded">
                <p className="font-bold">{activeSignal.name}</p>
                <p className="text-sm text-gray-400">{activeSignal.samples.length} samples @ {activeSignal.sampleRate} Hz</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;