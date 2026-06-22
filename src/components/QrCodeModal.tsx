import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';

export default function QrCodeModal({ value, title, onClose }: { value: string; title: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(value, { width: 240, margin: 1 }).then(setDataUrl);
  }, [value]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-xs w-full p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy text-sm">{title}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        {dataUrl ? (
          <img src={dataUrl} alt="Check-in QR code" className="mx-auto rounded-lg border border-gray-200" />
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Generating...</div>
        )}
        <p className="text-xs text-gray-500 mt-4">Show this QR code at the registration desk to check in.</p>
      </div>
    </div>
  );
}
