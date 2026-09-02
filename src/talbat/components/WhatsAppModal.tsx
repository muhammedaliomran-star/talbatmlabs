import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Copy, Check, Sparkles, AlertTriangle, PackageCheck } from 'lucide-react';
import { Order } from '../types';
import { formatArabicDate, createWhatsAppUrl } from '../utils/helpers';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'confirmation' | 'unavailable' | 'ready' | 'reminder'>('confirmation');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order) return;

    const itemDetails = [
      order.description,
      order.size ? `مقاس (${order.size})` : '',
      order.color ? `لون (${order.color})` : '',
      order.quantity && order.quantity > 1 ? `عدد (${order.quantity})` : '',
    ].filter(Boolean).join(' - ');

    const travelDateStr = formatArabicDate(order.travelDate);

    let message = '';
    if (selectedTemplate === 'confirmation') {
      message = `مرحباً يا فندم (${order.customerName})، تم تسجيل طلبك بنجاح في المحل:\n🛍️ الصنف: ${itemDetails}\n📅 ميعاد التوريد المتوقع: ${travelDateStr}\nسنقوم بإبلاغك فور وصول الطلبية إن شاء الله.`;
    } else if (selectedTemplate === 'unavailable') {
      message = `مرحباً يا فندم (${order.customerName})، بخصوص طلبك:\n(${itemDetails})\nللأسف الموديل باللون المحدد غير متوفر حالياً لدى المورد في السوق.\n${
        order.alternativeColor
          ? `هل يناسبك نأخذ اللون البديل المتفق عليه (${order.alternativeColor})؟`
          : 'هل تفضل اختيار لون بديل أم ننتظر توفره في الرحلة القادمة؟'
      }`;
    } else if (selectedTemplate === 'ready') {
      message = `مرحباً يا فندم (${order.customerName})،\n🎉 طلبك (${itemDetails}) وصل المحل وجاهز للاستلام الآن!\nفي انتظار تشريفك في أي وقت للمعاينة والاستلام. أهلاً بك دائماً!`;
    } else if (selectedTemplate === 'reminder') {
      message = `مرحباً يا فندم (${order.customerName})،\nنود إحاطتك علماً بآخر مستجدات طلبك (${itemDetails})، ونحن حريصون على تجهيزه لك في أفضل صورة.`;
    }

    setCustomText(message);
  }, [order, selectedTemplate]);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = createWhatsAppUrl(order.customerPhone, customText);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-lg border border-[#DED8CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1F6E43] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-cairo">
                إرسال رسالة واتساب للعميل
              </h2>
              <p className="text-xs text-white/80">
                {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Template Choices */}
          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-2">
              اختر قالب الرسالة الجاهزة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('confirmation')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'confirmation'
                    ? 'bg-[#E7F0EA] border-[#3F7A5D] text-[#1B2E4A] font-bold ring-1 ring-[#3F7A5D]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#3F7A5D] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">تأكيد الحجز وميعاد التوريد</div>
                  <div className="text-[10px] text-[#6C6A63] font-normal">عند تسجيل الطلب وتحديد السفر</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('ready')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'ready'
                    ? 'bg-[#E7F0EA] border-[#3F7A5D] text-[#1B2E4A] font-bold ring-1 ring-[#3F7A5D]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-[#3F7A5D] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">الطلب جاهز للاستلام</div>
                  <div className="text-[10px] text-[#6C6A63] font-normal">إشعار فور وصول القطعة للمحل</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('unavailable')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'unavailable'
                    ? 'bg-[#F6ECDC] border-[#B8792A] text-[#1B2E4A] font-bold ring-1 ring-[#B8792A]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-[#B8792A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">اعتذار أو اقتراح بديل</div>
                  <div className="text-[10px] text-[#6C6A63] font-normal">إذا لم يتوفر اللون أو الموديل بالسوق</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('reminder')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'reminder'
                    ? 'bg-[#E7F0EA] border-[#3F7A5D] text-[#1B2E4A] font-bold ring-1 ring-[#3F7A5D]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-[#3F7A5D] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">متابعة وتحديث</div>
                  <div className="text-[10px] text-[#6C6A63] font-normal">رسالة تواصل ومتابعة عامة</div>
                </div>
              </button>
            </div>
          </div>

          {/* Editable Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1B2E4A]">
                نص الرسالة (يمكنك التعديل عليه بحرية قبل الإرسال):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-semibold text-[#6C6A63] hover:text-[#1B2E4A] flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-[10px] border border-[#DED8CC] bg-[#FBF9F5] focus:bg-white focus:outline-none focus:border-[#1F6E43] leading-relaxed"
            />
          </div>

          {!order.customerPhone && (
            <div className="p-2.5 bg-[#FFF4F2] border border-[#F4D1CD] rounded-[9px] text-xs text-[#B4463A]">
              تنبيه: لم يتم تسجيل رقم هاتف لهذا العميل. يمكنك نسخ النص وإرساله يدوياً.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#DED8CC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6C6A63] hover:bg-[#F6F4EF] rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!order.customerPhone}
              className="px-5 py-2.5 bg-[#1F6E43] hover:bg-[#185534] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر واتساب الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
