import React, { useState, useRef } from 'react';
import { Camera, Smartphone, Eye, RotateCcw, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ARPreviewProps {
  paperId: string;
  paperTitle: string;
  className?: string;
}

const ARPreview: React.FC<ARPreviewProps> = ({ paperId, paperTitle, className = '' }) => {
  const [isARActive, setIsARActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setCameraPermission('granted');
      setIsARActive(true);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
  };

  const captureScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Add AR overlay (paper preview)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(50, 50, canvas.width - 100, 200);
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.fillText(paperTitle, 70, 100);
        ctx.font = '16px Arial';
        ctx.fillText('AR Preview - SciencePapers', 70, 130);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `ar-preview-${paperId}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const shareAR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AR Preview: ${paperTitle}`,
          text: 'Check out this AR preview of a science paper!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AR Paper Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View papers in augmented reality</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              BETA
            </div>
          </div>
        </div>
      </div>

      {/* AR Interface */}
      <div className="relative">
        {!isARActive ? (
          /* AR Start Screen */
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Experience Papers in AR
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                Place and view "{paperTitle}" in your physical space using augmented reality. 
                Perfect for studying complex diagrams and formulas.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={requestCameraPermission}
                disabled={isLoading || cameraPermission === 'denied'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Starting AR...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span>Start AR Experience</span>
                  </>
                )}
              </button>

              {cameraPermission === 'denied' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Camera access is required for AR features. Please enable camera permissions and try again.
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Point your camera at a flat surface</p>
                <p>• Ensure good lighting for best results</p>
                <p>• Works best on mobile devices</p>
              </div>
            </div>
          </div>
        ) : (
          /* AR Camera View */
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-96 object-cover bg-black"
              playsInline
              muted
            />
            
            {/* AR Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Crosshair for targeting */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border-2 border-white rounded-full opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Paper Preview Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-16 bg-gradient-to-b from-blue-500 to-purple-600 rounded shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm truncate">{paperTitle}</h5>
                    <p className="text-xs text-gray-600">Tap to place in AR space</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white rounded-lg p-3">
                <p className="text-sm text-center">
                  Move your device to find a flat surface, then tap to place the paper
                </p>
              </div>
            </div>

            {/* AR Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={captureScreenshot}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                title="Capture AR Screenshot"
              >
                <Download className="h-5 w-5 text-gray-700" />
              </button>
              
              <button
                onClick={shareAR}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                title="Share AR Experience"
              >
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
              
              <button
                onClick={stopAR}
                className="p-3 bg-red-500 bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                title="Stop AR"
              >
                <RotateCcw className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Feature Info */}
      {!isARActive && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm">3D Placement</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Position papers in real space</div>
            </div>
            <div>
              <div className="text-pink-600 dark:text-pink-400 font-semibold text-sm">Interactive</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Zoom and rotate content</div>
            </div>
            <div>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">Share</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Capture and share AR views</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ARPreview;