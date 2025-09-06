// frontend/src/App.tsx
import { useState } from 'react';
import './index.css'; // Make sure your Tailwind CSS import is here
import axios from 'axios';
import Plot from 'react-plotly.js';
import RealTimeAnalyzer from './components/RealTimeAnalyser';

// Define types for our data for better organization
interface Signal {
  id: string;
  name: string;
  samples: number[];
  sampleRate: number;
}
interface StftResult {
  f: number[];
  t: number[];
  Zxx: number[][];
}


interface FftResult {
  freq: number[];
  magnitude: number[];
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]); // <-- From single signal to a list
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]); // <-- IDs for convolution
  const [fftResult, setFftResult] = useState<FftResult | null>(null);
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [viewingSignal, setViewingSignal] = useState<Signal | null>(null);
  const [activeTab, setActiveTab] = useState<'time' | 'frequency' | 'spectrogram'>('time');
  const [stftResult, setStftResult] = useState<StftResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleSignalSelection = (signalId: string) => {
    setSelectedSignalIds(prevSelectedIds => {
      if (prevSelectedIds.includes(signalId)) {
        // If already selected, unselect it
        return prevSelectedIds.filter(id => id !== signalId);
      } else {
        // If not selected, add it (if less than 2 are already selected)
        if (prevSelectedIds.length < 2) {
          return [...prevSelectedIds, signalId];
        }
      }
      // If 2 are already selected and we are trying to add a new one, do nothing
      return prevSelectedIds;
    });
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
    await axios.post('http://localhost:3001/api/upload', formData, {
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

    setSignals(prevSignals => [...prevSignals, newSignal]);
    setFftResult(null); // Clear previous FFT result
    alert(`Successfully processed ${samples.length} samples from the file!`);

  } catch (error) {
    console.error('Error during upload or parse:', error);
    alert('An error occurred.');
  }
};

const handleComputeFft = async () => {
  // 1. Check if there are any signals in the list
  if (signals.length === 0) {
    alert('Please upload and process a signal first.');
    return;
  }

  // 2. Get the most recent signal (the last one in the array)
  const lastSignal = signals[signals.length - 1];

  try {
    const response = await axios.post('http://localhost:3001/api/dsp/fft', {
      // 3. Use the data from the most recent signal
      samples: lastSignal.samples,
      sampleRate: lastSignal.sampleRate,
    });
    setFftResult(response.data);
    console.log('FFT Result:', response.data);
  } catch (error) {
    console.error('Error computing FFT:', error);
    alert('Error computing FFT.');
  }
};

const handleConvolve = async () => {
  if (selectedSignalIds.length !== 2) {
    alert('Please select exactly two signals to convolve.');
    return;
  }

  const signalA = signals.find(s => s.id === selectedSignalIds[0]);
  const signalB = signals.find(s => s.id === selectedSignalIds[1]);

  if (!signalA || !signalB) {
    alert('One or more selected signals could not be found.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:3001/api/dsp/convolve', {
      signalA: signalA.samples,
      signalB: signalB.samples,
    });

    const convolvedSignal: Signal = {
      id: new Date().toISOString(),
      name: `conv(${signalA.name}, ${signalB.name})`,
      samples: response.data.samples,
      sampleRate: signalA.sampleRate, // Assume same sample rate for now
    };

    // Add the new convolved signal to the list and clear selections
    setSignals(prev => [...prev, convolvedSignal]);
    setSelectedSignalIds([]);

  } catch (error) {
    console.error('Error during convolution:', error);
    alert('Error during convolution.');
  }
};


const handleExportSignal = (signal: Signal) => {
  // Convert the array of samples into a single string with each sample on a new line
  const csvContent = signal.samples.join('\n');
  
  // Create a "blob" which is a file-like object in memory
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t-8;' });
  
  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${signal.name}.csv`);
  
  // Append the link to the document, click it, and then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleComputeStft = async () => {
  // Use the currently viewed signal for the STFT
  if (!viewingSignal) {
    alert('Please select a signal and click "View" first.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:3001/api/dsp/stft', {
      samples: viewingSignal.samples,
      sampleRate: viewingSignal.sampleRate,
    });
    setStftResult(response.data);
  } catch (error) {
    console.error('Error computing STFT:', error);
    alert('Error computing STFT.');
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
          <RealTimeAnalyzer/>
          
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
<section className="flex-1 bg-gray-800 p-4 rounded-lg flex flex-col">
  {/* Tab Buttons */}
  <div className="flex border-b border-gray-600 mb-4">
    <button
      onClick={() => setActiveTab('time')}
      className={`py-2 px-4 font-semibold ${activeTab === 'time' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
    >
      Time Domain
    </button>
    <button
      onClick={() => setActiveTab('frequency')}
      className={`py-2 px-4 font-semibold ${activeTab === 'frequency' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
    >
      Frequency Domain
    </button>
    <button
      onClick={() => {
        setActiveTab('spectrogram');
        handleComputeStft(); // Compute STFT when tab is clicked
      }}
      className={`py-2 px-4 font-semibold ${activeTab === 'spectrogram' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
    >
      Spectrogram
    </button>
  </div>

  {/* Plotting Area */}
  <div className="w-full h-96 bg-black rounded-md flex-1">
    {/* Conditional Rendering based on the activeTab */}
    
    {/* TIME DOMAIN VIEW */}
    {activeTab === 'time' && (
      viewingSignal ? (
        <Plot
          data={[
            {
              y: viewingSignal.samples,
              type: 'scatter',
              mode: 'lines',
              marker: { color: 'lime' },
            },
          ]}
          layout={{
            autosize: true,
            plot_bgcolor: '#000',
            paper_bgcolor: '#1f2937',
            font: { color: '#fff' },
            title: { text: viewingSignal.name, font: {size: 14}},
            xaxis: { title: { text: 'Sample Index' } },
            yaxis: { title: { text: 'Amplitude' } },
          }}
          useResizeHandler={true}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Select a signal and click "View" to see its waveform</p>
        </div>
      )
    )}

    {/* FREQUENCY DOMAIN VIEW */}
    {activeTab === 'frequency' && (
      fftResult ? (
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
            title: { text: 'FFT Result', font: {size: 14}},
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
      )
    )}

    {/* SPECTROGRAM VIEW */}
    {activeTab === 'spectrogram' && (
      stftResult ? (
        <Plot
          data={[
            {
              z: stftResult.Zxx,
              x: stftResult.t,
              y: stftResult.f,
              type: 'heatmap',
              colorscale: 'Jet',
            },
          ]}
          layout={{
            autosize: true,
            plot_bgcolor: '#000',
            paper_bgcolor: '#1f2937',
            font: { color: '#fff' },
            title: { text: `Spectrogram: ${viewingSignal?.name}`, font: { size: 14 } },
            xaxis: { title: { text: 'Time (s)' } },
            yaxis: { title: { text: 'Frequency (Hz)' } },
          }}
          useResizeHandler={true}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Click the Spectrogram tab to compute and view</p>
        </div>
      )
    )}

  </div>
</section>
        {/* Right Panel: Signal List */}
        <aside className="w-1/4 bg-gray-800 p-4 rounded-lg flex flex-col">
  <h2 className="text-xl mb-4 border-b border-gray-600 pb-2">Signal List</h2>
  <div className="space-y-2 flex-1 overflow-y-auto">
    {signals.map(signal => (
      <div key={signal.id} className="bg-gray-700 p-2 rounded flex items-center gap-4">
        <input
          type="checkbox"
          checked={selectedSignalIds.includes(signal.id)}
          onChange={() => handleSignalSelection(signal.id)}
          className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-indigo-600 focus:ring-indigo-500"
        />
        <div className='flex-1'>
          <p className="font-bold">{signal.name}</p>
          <p className="text-sm text-gray-400">{signal.samples.length} samples</p>
        </div>
        <button
            onClick={() => setViewingSignal(signal)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            View
          </button>
        <button
          onClick={() => handleExportSignal(signal)}
          className="bg-blue-600 hover:bg-teal-700 text-white font-bold py-1 px-2 rounded-md text-xs"
        >
          Export
        </button>
      </div>
    ))}
  </div>
  <div className="mt-4 pt-4 border-t border-gray-600">
    <button
      onClick={handleConvolve}
      disabled={selectedSignalIds.length !== 2} // Disable button unless exactly 2 are selected
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      Convolve Selected
    </button>
  </div>
</aside>
      </main>
    </div>
  );
}

export default App;