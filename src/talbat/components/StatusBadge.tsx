import React from 'react';
import { Order } from '../types';
import { isOrderLate } from '../utils/helpers';

interface StatusBadgeProps {
  status: 'pending' | 'done';
  order?: Order;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, order, className = '' }) => {
  const late = order ? isOrderLate(order) : false;

  if (late) {
    return (
      <span
        className={`hang-tag bg-[#F6E3E0] text-[#B4463A] border border-[#F0CDC8] ${className}`}
        title="تجاوز ميعاد السفر المحدد وما زال معلقاً"
      >
        متأخر
      </span>
    );
  }

  if (status === 'done') {
    return (
      <span
        className={`hang-tag bg-[#E7F0EA] text-[#3F7A5D] border border-[#CDE3D5] ${className}`}
      >
        تم التنفيذ
      </span>
    );
  }

  return (
    <span
      className={`hang-tag bg-[#F6ECDC] text-[#B8792A] border border-[#EED7BA] ${className}`}
    >
      قيد الانتظار
    </span>
  );
};
