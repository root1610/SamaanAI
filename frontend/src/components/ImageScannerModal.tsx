import React, { useState, useRef } from 'react';
import { X, UploadCloud, Camera, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { api } from '../services/api';
import { AIOCRResult, Category } from '../types';

interface ImageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onProductSaved: () => void;
}

export const ImageScannerModal: React.FC<ImageScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onProductSaved
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<AIOCRResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: 1,
    expiry_date: '',
    mfd_date: '',
    quantity: 1,
    unit: 'pcs',
    batch_number: '',
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setError(null);
    }
  };

  const startCamera = async () => {
    setUseCamera(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Unable to access camera. Please upload an image file instead.");
      setUseCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setUseCamera(false);
          }
        }, "image/jpeg");
      }
    }
  };

  const handleRunAIScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);

    const fileData = new FormData();
    fileData.append('file', selectedFile);

    try {
      const response = await api.post<AIOCRResult>('/products/upload-image', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const res = response.data;
      setOcrResult(res);

      setFormData({
        name: res.product_name || 'Product',
        brand: res.brand || '',
        category_id: res.category_id || 1,
        expiry_date: res.expiry_date || new Date().toISOString().split('T')[0],
        mfd_date: res.mfd_date || '',
        quantity: 1,
        unit: 'pcs',
        batch_number: res.batch_number || '',
        notes: res.explanation || ''
      });
    } catch (err: any) {
      console.error("AI Scan failed", err);
      setError(err.response?.data?.detail || "AI text extraction failed. You can still fill in details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await api.post('/products', {
        name: formData.name,
        brand: formData.brand || null,
        category_id: Number(formData.category_id),
        expiry_date: formData.expiry_date,
        mfd_date: formData.mfd_date || null,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        batch_number: formData.batch_number || null,
        ocr_confidence: ocrResult?.confidence_score || 1.0,
        image_url: ocrResult?.image_url || null,
        notes: formData.notes || null
      });

      onProductSaved();
      handleResetModal();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save product. Please check form fields.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
    setUseCamera(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">AI Product Scanner</h2>
          </div>
          <button
            onClick={() => { handleResetModal(); onClose(); }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Image Upload & Viewport */}
          <div className="space-y-4">
            
            {useCamera ? (
              <div className="relative h-64 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-300">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="absolute bottom-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
              </div>
            ) : previewUrl ? (
              <div className="relative h-64 rounded-xl bg-slate-100 overflow-hidden border border-slate-300 flex items-center justify-center">
                <img src={previewUrl} alt="Product package" className="w-full h-full object-contain p-2" />
                
                {isScanning && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Image Text...
                    </div>
                  </div>
                )}

                <button
                  onClick={handleResetModal}
                  className="absolute top-3 right-3 px-3 py-1 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Change Image
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-64 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">Upload Product Packaging Image</p>
                <p className="text-xs text-slate-500 mb-4">Must show MFD, Expiry, or Best Before text</p>
                
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold">
                    Select File
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    className="px-3.5 py-1.5 rounded-md bg-white text-slate-700 border border-slate-300 text-xs font-bold hover:bg-slate-50 shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5 inline mr-1" /> Use Camera
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Run AI Scan CTA */}
            {selectedFile && !ocrResult && (
              <button
                type="button"
                onClick={handleRunAIScan}
                disabled={isScanning}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" /> Extract Details with AI
                  </>
                )}
              </button>
            )}

            {/* Raw OCR snippet */}
            {ocrResult && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 font-bold uppercase text-[10px]">
                  <span>OCR Raw Text</span>
                  <span className="text-green-700">Confidence: {(ocrResult.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <p className="font-mono text-[11px] text-slate-700 line-clamp-2 bg-white p-2 rounded border border-slate-200">
                  {ocrResult.raw_ocr_text}
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Editable Confirmation Form */}
          <form onSubmit={handleSaveProduct} className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Confirm Extracted Fields
              </h3>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Whole Wheat Bread"
                className="w-full px-3 py-2 rounded-md app-input text-sm"
              />
            </div>

            {/* Brand & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Britania"
                  className="w-full px-3 py-2 rounded-md app-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-md app-input text-sm bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry Date & MFD Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-md app-input text-sm font-mono border-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mfg Date</label>
                <input
                  type="date"
                  value={formData.mfd_date}
                  onChange={(e) => setFormData({ ...formData, mfd_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-md app-input text-sm font-mono"
                />
              </div>
            </div>

            {/* Quantity, Unit & Batch */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-md app-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs"
                  className="w-full px-2.5 py-2 rounded-md app-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch #</label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="B-100"
                  className="w-full px-2.5 py-2 rounded-md app-input text-sm font-mono"
                />
              </div>
            </div>

            {/* Save Button (Primary Green) */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-2 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" /> Save Product to Pantry
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
