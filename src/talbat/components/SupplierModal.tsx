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
      <div className="bg-white rounded-[16px] w-full max-w-md border border-[#DED8CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#1B2E4A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B08948] text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cairo">
                {initialSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
              </h2>
              <p className="text-xs text-[#D9DEE7]">بيانات المصنع أو محل الجملة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#D9DEE7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#B08948]" />
              <span>اسم المورد / المحل / المصنع</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محل الجملة — العتبة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6C6A63]" />
              <span>العنوان / المنطقة</span>
              <span className="text-[10px] text-[#6C6A63] font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع الجمهورية، العتبة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#6C6A63]" />
              <span>رقم هاتف المورد للتواصل</span>
              <span className="text-[10px] text-[#6C6A63] font-normal">(اختياري)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeToEnglishDigits(e.target.value))}
              placeholder="01XXXXXXXXX"
              dir="ltr"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948] text-right font-cairo font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#6C6A63]" />
              <span>ملاحظات حول المورد / الأصناف المميز بها</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بنطلونات جينز تركي، الدفع كاش عند الاستلام"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
            />
          </div>

          <div className="pt-3 border-t border-[#DED8CC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6C6A63] hover:bg-[#F6F4EF] rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B08948] hover:bg-[#9E783B] text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all"
            >
              {initialSupplier ? 'حفظ التعديل' : 'إضافة المورد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
