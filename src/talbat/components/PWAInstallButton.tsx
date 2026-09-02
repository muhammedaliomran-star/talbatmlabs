import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Share2, PlusSquare, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Status Warning Bar if disconnected */}
      {!isOnline && (
        <div className="bg-[#B4463A] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>العمل دون اتصال (Offline Mode) - البيانات محفوظة محلياً</span>
        </div>
      )}

      {/* Installed Badge */}
      {isInstalled && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#3F7A5D] bg-[#E7F0EA] px-2.5 py-1.5 rounded-lg border border-[#CDE3D5]">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>تطبيق مثبت</span>
        </div>
      )}

      {/* Android / Chrome / Desktop Install Button */}
      {isInstallable && !isInstalled && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 bg-[#B08948] hover:bg-[#977338] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all animate-pulse"
          title="تثبيت التطبيق على جهازك للعمل بدون إنترنت وبسرعة فائقة"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق</span>
        </button>
      )}

      {/* iOS Safari Guided Install Button */}
      {isIOS && !isInstalled && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 bg-[#FAF6EF] hover:bg-[#EFEBE2] text-[#1B2E4A] border border-[#DED8CC] px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all"
          title="طريقة تثبيت التطبيق على الآيفون"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#B08948]" />
          <span>تثبيت على iPhone</span>
        </button>
      )}

      {/* iOS Safari Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-xl border border-[#DED8CC] text-right font-cairo">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE2]">
              <h3 className="text-base font-extrabold text-[#1B2E4A] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#B08948]" />
                <span>تثبيت التطبيق على iPhone / iPad</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-[#6C6A63] hover:text-[#1B2E4A] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-[#24262B]">
              <div className="flex items-start gap-3 bg-[#FAF6EF] p-3 rounded-xl border border-[#EAE1D2]">
                <div className="w-7 h-7 rounded-lg bg-[#1B2E4A] text-white flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-bold text-[#1B2E4A]">اضغط على زر المشاركة (Share)</p>
                  <p className="text-[#6C6A63] mt-0.5">موجود في شريط متصفح Safari بالأسفل (رمز المربع بسهم لأعلى <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#1B2E4A]" />).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF6EF] p-3 rounded-xl border border-[#EAE1D2]">
                <div className="w-7 h-7 rounded-lg bg-[#B08948] text-white flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-bold text-[#1B2E4A]">اختر إضافة إلى الصفحة الرئيسية</p>
                  <p className="text-[#6C6A63] mt-0.5">مرر لأسفل واضغط على <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#B08948]" />.</p>
                </div>
              </div>

              <div className="bg-[#E7F0EA] p-3 rounded-xl border border-[#CDE3D5] text-[#3F7A5D] text-[11px]">
                سيظهر التطبيق كأيقونة مستقلة على شاشتك الرئيسية ويعمل بكامل الشاشة حتى بدون إنترنت!
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-[#1B2E4A] py-2.5 text-xs font-bold text-white hover:bg-[#2C4568] transition"
            >
              فهمت، حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
