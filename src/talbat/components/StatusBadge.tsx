import React from 'react';
import { Order } from '../types';

interface StatusBadgeProps {
  status: 'pending' | 'done';
  order?: Order;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, order, className = '' }) => {
  if (status === 'done') {
    return (
      <span
        className={`hang-tag bg-done-soft text-done border border-done-soft ${className}`}
      >
        تم التنفيذ
      </span>
    );
  }

  return (
    <span
      className={`hang-tag bg-pending-soft text-pending border border-pending-soft ${className}`}
    >
      قيد الانتظار
    </span>
  );
};
