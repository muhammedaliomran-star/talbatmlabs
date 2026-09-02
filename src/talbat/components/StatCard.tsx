import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: 'default' | 'pending' | 'late' | 'done' | 'brass';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  icon,
  onClick,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'pending':
        return {
          numColor: 'text-[#B8792A]',
          bg: 'bg-white',
          border: 'border-[#EED7BA]',
          accent: 'bg-[#F6ECDC]',
        };
      case 'late':
        return {
          numColor: 'text-[#B4463A]',
          bg: 'bg-[#FFF7F6]',
          border: 'border-[#F4D1CD]',
          accent: 'bg-[#F6E3E0]',
        };
      case 'done':
        return {
          numColor: 'text-[#3F7A5D]',
          bg: 'bg-white',
          border: 'border-[#CDE3D5]',
          accent: 'bg-[#E7F0EA]',
        };
      case 'brass':
        return {
          numColor: 'text-[#B08948]',
          bg: 'bg-white',
          border: 'border-[#EAE1D2]',
          accent: 'bg-[#FAF6EF]',
        };
      default:
        return {
          numColor: 'text-[#1B2E4A]',
          bg: 'bg-white',
          border: 'border-[#DED8CC]',
          accent: 'bg-[#F6F4EF]',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      onClick={onClick}
      className={`rounded-[14px] p-4 sm:p-5 border transition-all duration-200 shadow-xs ${colors.bg} ${colors.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs sm:text-sm font-medium text-[#6C6A63]">{title}</span>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.accent}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl sm:text-3xl font-extrabold font-cairo tracking-tight ${colors.numColor}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[#6C6A63] mt-1.5 font-medium">{subtitle}</div>
      )}
    </div>
  );
};
