// api/src/index.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(express.json());
const port = 3001;

app.use(cors()); // <-- 2. USE cors middleware
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: any) { // <-- ADD : any
    cb(null, './uploads');
  },
  filename: function (_req: Request, file: Express.Multer.File, cb: any) { // <-- ADD : any
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file.' });
  }

  res.status(200).send({
    fileId: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    samples: 0,
    sampleRate: 0,
    channels: 0,
  });
});

app.post('/api/dsp/fft', async (req: Request, res: Response) => {
  try {
    // The Python service is running on port 8000
    const dspServiceUrl = 'http://dsp-service:8000/api/dsp/fft';

    // Forward the request body to the Python service
    const response = await axios.post(dspServiceUrl, req.body);

    // Send the response from the Python service back to the client
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error calling DSP service:', error);
    res.status(500).send({ message: 'Error processing FFT request' });
  }
});

app.post('/api/dsp/convolve', async (req: Request, res: Response) => {
  try {
    const dspServiceUrl = 'http://dsp-service:8000/api/dsp/convolve';
    // Forward the request body (containing signalA and signalB) to Python
    const response = await axios.post(dspServiceUrl, req.body);
    // Send the result back to the client
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error calling DSP service for convolution:', error);
    res.status(500).send({ message: 'Error processing convolution request' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});