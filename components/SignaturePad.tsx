"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

export type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
};

/**
 * Lightweight, dependency-free signature pad.
 * Works with both touch (mobile) and mouse (desktop), and handles
 * high-DPI screens so the exported signature stays crisp.
 */
const SignaturePad = forwardRef<
  SignaturePadHandle,
  { className?: string; onChange?: (hasContent: boolean) => void }
>(function SignaturePad({ className, onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const hasContent = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          hasContent.current = false;
          onChange?.(false);
        },
        isEmpty: () => !hasContent.current,
        toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
      }),
      [onChange]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#231f19";
        }
      };
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    const pos = (e: PointerEvent) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);
      drawing.current = true;
      last.current = pos(e.nativeEvent);
    };

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !last.current) return;
      const p = pos(e.nativeEvent);
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last.current = p;
      if (!hasContent.current) {
        hasContent.current = true;
        onChange?.(true);
      }
    };

    const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
      drawing.current = false;
      last.current = null;
    };

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ touchAction: "none" }}
        role="img"
        aria-label="Zone de signature"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      />
    );
});

export default SignaturePad;
