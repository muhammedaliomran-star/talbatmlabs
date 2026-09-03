import React from 'react';
import { Button } from '@/components/ui/button';

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
          numColor: 'text-pending', shell: 'bg-pending-soft/55 ring-pending/15', accent: 'bg-pending-soft text-pending',
        };
      case 'late':
        return {
          numColor: 'text-late', shell: 'bg-late-soft/60 ring-late/15', accent: 'bg-late-soft text-late',
        };
      case 'done':
        return {
          numColor: 'text-done', shell: 'bg-done-soft/55 ring-done/15', accent: 'bg-done-soft text-done',
        };
      case 'brass':
        return {
          numColor: 'text-brass', shell: 'bg-paper-alt/70 ring-brass/15', accent: 'bg-color-soft text-brass',
        };
      default:
        return {
          numColor: 'text-ink', shell: 'bg-paper-alt/65 ring-ink/10', accent: 'bg-size-soft text-ink',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`h-full rounded-[1.5rem] p-1.5 ring-1 ${colors.shell}`}>
      <Button
        variant="ghost"
        onClick={onClick}
        className={`h-full min-h-36 w-full items-stretch rounded-[calc(1.5rem-0.375rem)] bg-canvas p-4 text-right shadow-[inset_0_1px_0_var(--canvas)] hover:bg-canvas sm:p-5 ${onClick ? 'group hover:-translate-y-1' : 'cursor-default'}`}
      >
      <div className="flex w-full flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-bold tracking-wide text-copy-muted uppercase">{title}</span>
        {icon && (
          <div className={`grid size-9 place-items-center rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 will-change-transform ${colors.accent}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl sm:text-3xl font-extrabold font-cairo ${colors.numColor}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-2 whitespace-normal text-xs font-medium text-copy-muted">{subtitle}</div>
      )}
      </div>
      </Button>
    </div>
  );
};
