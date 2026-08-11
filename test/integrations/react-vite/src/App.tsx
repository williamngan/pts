import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasSpace, Pt } from "pts";

type PtsCanvasProps = {
  onDisposed: (disposed: boolean) => void;
};

function PtsCanvas({ onDisposed }: PtsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    let frames = 0;
    const space = new CanvasSpace(canvas, () => {
      if (!active) return;
      const form = space.getForm();
      space.add({
        animate: () => {
          frames += 1;
          canvas.dataset.frames = String(frames);
          form.fillOnly("#f97316").point([160, 90], 14, "circle");
        },
      });
      space.play();
    }).setup({ bgcolor: "#0f172a", resize: false, retina: false });

    return () => {
      active = false;
      space.stop();
      space.dispose();
      setTimeout(() => onDisposed(!space.isPlaying), 50);
    };
  }, [onDisposed]);

  return (
    <div className="stage">
      <canvas
        ref={canvasRef}
        data-pts-canvas
        data-frames="0"
        width="320"
        height="180"
      />
    </div>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(true);
  const [disposed, setDisposed] = useState(false);
  const point = new Pt(1, 2).add(3).toString();
  const handleDisposed = useCallback((value: boolean) => {
    setDisposed(value);
  }, []);
  const toggleCanvas = () => {
    if (!mounted) setDisposed(false);
    setMounted((value) => !value);
  };

  return (
    <main
      id="status"
      data-environment="react-vite"
      data-point={point}
      data-disposed={String(disposed)}
    >
      <h1>Pts + React + Vite</h1>
      {mounted ? <PtsCanvas onDisposed={handleDisposed} /> : null}
      <button id="toggle" type="button" onClick={toggleCanvas}>
        {mounted ? "Unmount canvas" : "Remount canvas"}
      </button>
    </main>
  );
}
