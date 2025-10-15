
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface DigitCanvasProps {
    width: number;
    height: number;
}

export interface CanvasHandle {
    clear: () => void;
    getImageData: () => string | null;
    isCanvasBlank: () => boolean;
}

type Point = { x: number; y: number };

export const DigitCanvas = forwardRef<CanvasHandle, DigitCanvasProps>(({ width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 20;
                ctx.strokeStyle = '#000000'; // Draw in black
                setContext(ctx);

                // Initial clear with white background for better image recognition
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
            }
        }
    }, [width, height]);

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCoordinates(event);
        if (context && coords) {
            context.beginPath();
            context.moveTo(coords.x, coords.y);
            setIsDrawing(true);
        }
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !context) return;
        const coords = getCoordinates(event);
        if (coords) {
            context.lineTo(coords.x, coords.y);
            context.stroke();
        }
    };

    const stopDrawing = () => {
        if (context) {
            context.closePath();
        }
        setIsDrawing(false);
    };
    
    useImperativeHandle(ref, () => ({
        clear: () => {
            if (context) {
                context.fillStyle = 'white';
                context.fillRect(0, 0, width, height);
            }
        },
        getImageData: () => {
            return canvasRef.current?.toDataURL('image/png') || null;
        },
        isCanvasBlank: () => {
            const canvas = canvasRef.current;
            if (!canvas || !context) return true;
        
            const pixelBuffer = new Uint32Array(
                context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
            );

            // Check if all pixels are white (0xFFFFFFFF in this buffer format)
            return !pixelBuffer.some(color => color !== 0xFFFFFFFF);
        }
    }));


    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-white rounded-lg shadow-lg cursor-crosshair border-2 border-slate-700"
        />
    );
});
