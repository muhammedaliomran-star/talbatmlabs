import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Phone, FileText } from 'lucide-react';
import { Supplier } from '../types';
import { normalizeToEnglishDigits } from '../utils/helpers';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: Partial<Supplier>) => void;
  initialSupplier?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSupplier,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSupplier) {
      setName(initialSupplier.name || '');
      setAddress(initialSupplier.address || '');
      setPhone(initialSupplier.phone || '');
      setNotes(initialSupplier.notes || '');
    } else {
      setName('');
      setAddress('');
      setPhone('');
      setNotes('');
    }
  }, [initialSupplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى كتابة اسم المورد');
      return;
    }
    onSave({
      name: name.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-md border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cairo">
                {initialSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </h2>
              <p className="text-xs text-ink-muted">بيانات المصنع أو محل الجملة</p>
            </div>
          </div>
          <button type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-brass" />
              <span>اسم المورد / المحل / المصنع</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محل الجملة — العتبة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-copy-muted" />
              <span>العنوان / المنطقة</span>
              <span className="text-[10px] text-copy-muted font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع الجمهورية، العتبة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-copy-muted" />
              <span>رقم هاتف المورد للتواصل</span>
              <span className="text-[10px] text-copy-muted font-normal">(اختياري)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeToEnglishDigits(e.target.value))}
              placeholder="01XXXXXXXXX"
              dir="ltr"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass text-right font-cairo font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-copy-muted" />
              <span>ملاحظات حول المورد / الأصناف المميز بها</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بنطلونات جينز تركي، الدفع كاش عند الاستلام"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-copy-muted hover:bg-paper rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brass hover:bg-brass text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all"
            >
              {initialSupplier ? 'حفظ التعديل' : 'إضافة المورد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
