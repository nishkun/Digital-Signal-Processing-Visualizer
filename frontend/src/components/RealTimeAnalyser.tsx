// frontend/src/components/RealTimeAnalyzer.tsx
import { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';

const RealTimeAnalyzer = () => {
  const [isListening, setIsListening] = useState(false);
  const [plotData, setPlotData] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup function to stop listening when the component unmounts
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      audioContextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);
      setIsListening(true);
      visualize();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access the microphone.');
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  const visualize = () => {
    if (analyserRef.current && audioContextRef.current) {
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const frequencies = Array.from({ length: bufferLength }, (_, i) => i * (sampleRate / analyser.fftSize));
        const magnitudes = Array.from(dataArray);

        setPlotData({ x: frequencies, y: magnitudes });
        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-600">
      <h3 className="text-lg font-semibold mb-2">Real-Time Analyzer</h3>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full font-bold py-2 px-4 rounded-md ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      {/* 1. Increased height from h-64 to h-96 */}
      <div className="w-full h-96 bg-black rounded-md mt-4">
        <Plot
          data={[{ ...plotData, type: 'scatter', mode: 'lines', marker: { color: 'magenta' } }]}
          layout={{
            autosize: true,
            plot_bgcolor: '#000',
            paper_bgcolor: '#1f2937',
            font: { color: '#fff' },
            // 2. Increased frequency range
            xaxis: { title: { text: 'Frequency (Hz)' }, range: [0, 10000] },
            // 3. Adjusted magnitude range slightly for better visibility
            yaxis: { title: { text: 'Magnitude' }, range: [0, 300] },
          }}
          useResizeHandler={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default RealTimeAnalyzer;