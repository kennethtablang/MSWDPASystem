import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Loader2, RefreshCw, SwitchCamera } from 'lucide-react';
import { parseClientNumber } from '../utils/clientNumber';

/** FR-3.3: live camera QR scanning for beneficiary verification. */
const CAMERA_ERROR_HINTS = {
  NotAllowedError: 'Camera access was blocked. Allow camera permission in your browser, then try again.',
  NotFoundError: 'No camera was found on this device. Use manual entry instead.',
  NotReadableError: 'The camera is already in use by another application. Close it and try again.',
  SecurityError: 'Camera access needs a secure connection (HTTPS) or localhost.',
};

export default function QrScanner({ onScan, disabled = false, autoStart = false, className = '' }) {
  const regionId = `qr-region-${useId().replace(/:/g, '')}`;
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ text: null, at: 0 });

  const [status, setStatus] = useState('idle'); // idle | starting | scanning | error
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cameraIndex, setCameraIndex] = useState(0);

  const stop = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      // isScanning guards against stopping an instance that never started,
      // which html5-qrcode treats as an error.
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      // teardown failures are not actionable for the operator
    } finally {
      scannerRef.current = null;
    }
  }, []);

  const handleDecoded = useCallback((decodedText) => {
    const now = Date.now();
    const { text, at } = lastScanRef.current;
    // The camera decodes continuously; ignore the same code within 3s so one
    // physical card does not fire a burst of verifications.
    if (text === decodedText && now - at < 3000) return;
    lastScanRef.current = { text: decodedText, at: now };

    const clientNumber = parseClientNumber(decodedText);
    if (!clientNumber) {
      setError('That QR code is not a beneficiary code. Scan the code on the client card.');
      return;
    }
    setError(null);
    if (navigator.vibrate) navigator.vibrate(60);
    onScan(clientNumber);
  }, [onScan]);

  const start = useCallback(async (index = 0) => {
    setStatus('starting');
    setError(null);
    await stop();

    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices?.length) {
        setStatus('error');
        setError(CAMERA_ERROR_HINTS.NotFoundError);
        return;
      }
      setCameras(devices);

      // Prefer a rear-facing camera: on field tablets the front camera cannot
      // see the card the operator is holding out.
      let chosen = index;
      if (index === 0) {
        const rear = devices.findIndex((d) => /back|rear|environment/i.test(d.label));
        if (rear >= 0) chosen = rear;
      }
      setCameraIndex(chosen);

      const scanner = new Html5Qrcode(regionId, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        devices[chosen].id,
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        handleDecoded,
        () => {
          // Fires on every frame without a QR code — expected, not an error.
        },
      );
      setStatus('scanning');
    } catch (err) {
      setStatus('error');
      const name = err?.name ?? '';
      setError(CAMERA_ERROR_HINTS[name] ?? 'Could not start the camera. Use manual entry instead.');
      scannerRef.current = null;
    }
  }, [handleDecoded, regionId, stop]);

  // Always release the camera when the page unmounts, otherwise the device
  // light stays on and the camera stays locked for other applications.
  useEffect(() => () => { stop(); }, [stop]);

  // Opt-in auto-start, for a dedicated verification terminal where pressing a
  // button between every client is pure friction. Runs once on mount; a failure
  // surfaces the same permission hints as the manual path.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!autoStart || disabled || autoStartedRef.current) return;
    autoStartedRef.current = true;
    start(0);
  }, [autoStart, disabled, start]);

  const switchCamera = () => start((cameraIndex + 1) % cameras.length);

  return (
    <div className={className}>
      {/*
        The viewfinder is deliberately dark in BOTH themes — it frames a camera
        image. The gray scale inverts for dark mode, so each token here is pinned
        to its mirror step (900↔100, 300↔700, 400↔600) to stay dark.
      */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-gray-100 aspect-square">
        <div id={regionId} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {status === 'scanning' && (
          <>
            {/* Reticle — purely decorative, the decode region is set via qrbox. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-60 w-60 max-w-[70%] max-h-[70%]">
                {['top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                ].map((pos) => (
                  <span key={pos} className={`absolute h-8 w-8 border-gold-400 ${pos}`} />
                ))}
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gold-400/90 shadow-[0_0_12px_2px] shadow-gold-400/60 motion-safe:animate-[qr-sweep_2.4s_ease-in-out_infinite]" />
              </div>
            </div>
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-center text-xs font-medium text-white">
              Hold the client card steady inside the frame
            </p>
          </>
        )}

        {status !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {status === 'starting' ? (
              <>
                <Loader2 size={30} className="animate-spin text-gray-300" />
                <p className="text-sm text-gray-300">Starting camera…</p>
              </>
            ) : status === 'error' ? (
              <>
                <CameraOff size={30} className="text-accent-400" />
                <p className="max-w-xs text-sm text-gray-300">{error}</p>
                <button
                  type="button"
                  onClick={() => start(0)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  <RefreshCw size={13} /> Try again
                </button>
              </>
            ) : (
              <>
                <Camera size={30} className="text-gray-400" />
                <p className="max-w-xs text-sm text-gray-300">
                  Use the camera to scan a beneficiary QR code
                </p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => start(0)}
                  className="mt-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
                >
                  Start camera
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {status === 'scanning' && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
            Camera active
          </span>
          <div className="flex gap-2">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={switchCamera}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
              >
                <SwitchCamera size={13} /> Switch
              </button>
            )}
            <button
              type="button"
              onClick={() => { stop(); setStatus('idle'); }}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {status === 'scanning' && error && (
        <p className="mt-2 rounded-lg bg-accent-50 px-3 py-2 text-xs text-accent-700">{error}</p>
      )}
    </div>
  );
}
