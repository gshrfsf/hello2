
import React, { useState, useRef, useCallback } from 'react';
import { DigitCanvas, CanvasHandle } from './components/DigitCanvas';
import { recognizeDigit } from './services/geminiService';

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
    const canvasRef = useRef<CanvasHandle>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRecognize = useCallback(async () => {
        if (!canvasRef.current) return;

        if (canvasRef.current.isCanvasBlank()) {
            setError('Canvas is empty. Please draw a digit first.');
            setResult(null);
            return;
        }

        const imageDataUrl = canvasRef.current.getImageData();
        if (!imageDataUrl) {
            setError('Could not get image data from canvas.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const digit = await recognizeDigit(imageDataUrl);
            setResult(digit);
        } catch (err) {
            console.error(err);
            setError('Failed to recognize the digit. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleClear = useCallback(() => {
        canvasRef.current?.clear();
        setResult(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto text-center">
                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        AI Digit Recognizer
                    </h1>
                    <p className="text-slate-400 mt-2">Draw a number (0-9) and let Gemini identify it.</p>
                </header>

                <main className="flex flex-col items-center gap-6">
                    <DigitCanvas ref={canvasRef} width={280} height={280} />

                    <div className="flex space-x-4 w-full">
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="w-1/2 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleRecognize}
                            disabled={isLoading}
                            className="w-1/2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Recognize
                        </button>
                    </div>

                    <div className="w-full h-24 mt-4 bg-slate-800 rounded-lg flex items-center justify-center p-4 border border-slate-700">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result && (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm">Recognized Digit:</p>
                                <p className="text-6xl font-bold text-green-400">{result}</p>
                            </div>
                        )}
                        {!isLoading && !error && !result && (
                            <p className="text-slate-500">The result will be shown here.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
