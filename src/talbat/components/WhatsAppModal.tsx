import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Copy, Check, Sparkles, AlertTriangle, PackageCheck } from 'lucide-react';
import { Order } from '../types';
import { createWhatsAppUrl } from '../utils/helpers';

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

    let message = '';
    if (selectedTemplate === 'confirmation') {
      message = `مرحباً يا فندم (${order.customerName})، تم تسجيل طلبك بنجاح في المحل:\n🛍️ الصنف: ${itemDetails}\nسنقوم بإبلاغك فور وصول الطلبية إن شاء الله.`;
    } else if (selectedTemplate === 'unavailable') {
      message = `مرحباً يا فندم (${order.customerName})، بخصوص طلبك:\n(${itemDetails})\nللأسف الموديل باللون المحدد غير متوفر حالياً لدى المورد في السوق.\n${
        order.alternativeColor
          ? `هل يناسبك نأخذ اللون البديل المتفق عليه (${order.alternativeColor})؟`
          : 'هل تفضل اختيار لون بديل أم ننتظر توفره؟'
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
      <div className="bg-white rounded-[16px] w-full max-w-lg border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-done text-white px-5 py-4 flex items-center justify-between">
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
            <label className="block text-xs font-bold text-ink mb-2">
              اختر قالب الرسالة الجاهزة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('confirmation')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'confirmation'
                    ? 'bg-done-soft border-done text-ink font-bold ring-1 ring-done'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                <Sparkles className="w-4 h-4 text-done shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">تأكيد تسجيل الطلب</div>
                  <div className="text-[10px] text-copy-muted font-normal">عند تسجيل طلب العميل</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('ready')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'ready'
                    ? 'bg-done-soft border-done text-ink font-bold ring-1 ring-done'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-done shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">الطلب جاهز للاستلام</div>
                  <div className="text-[10px] text-copy-muted font-normal">إشعار فور وصول القطعة للمحل</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('unavailable')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'unavailable'
                    ? 'bg-pending-soft border-pending text-ink font-bold ring-1 ring-pending'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-pending shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">اعتذار أو اقتراح بديل</div>
                  <div className="text-[10px] text-copy-muted font-normal">إذا لم يتوفر اللون أو الموديل بالسوق</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('reminder')}
                className={`p-2.5 rounded-[9px] border text-right text-xs transition-all flex items-start gap-2 ${
                  selectedTemplate === 'reminder'
                    ? 'bg-done-soft border-done text-ink font-bold ring-1 ring-done'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-done shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">متابعة وتحديث</div>
                  <div className="text-[10px] text-copy-muted font-normal">رسالة تواصل ومتابعة عامة</div>
                </div>
              </button>
            </div>
          </div>

          {/* Editable Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink">
                نص الرسالة (يمكنك التعديل عليه بحرية قبل الإرسال):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-semibold text-copy-muted hover:text-ink flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-[10px] border border-line bg-canvas-subtle focus:bg-white focus:outline-none focus:border-done leading-relaxed"
            />
          </div>

          {!order.customerPhone && (
            <div className="p-2.5 bg-late-soft border border-late-soft rounded-[9px] text-xs text-late">
              تنبيه: لم يتم تسجيل رقم هاتف لهذا العميل. يمكنك نسخ النص وإرساله يدوياً.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-copy-muted hover:bg-paper rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!order.customerPhone}
              className="px-5 py-2.5 bg-done hover:bg-done disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all flex items-center gap-2"
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
