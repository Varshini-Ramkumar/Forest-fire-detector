import React from 'react';
import { RiskLevel, AlertSeverity, SensorStatus } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | AlertSeverity | SensorStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showDot = true,
}) => {
  const getStyles = () => {
    switch (level) {
      case 'Critical':
        return {
          bg: 'bg-red-500/15 border-red-500/30 text-red-400',
          dot: 'bg-red-500 animate-pulse',
          symbol: '🔴',
        };
      case 'High':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-500',
          symbol: '🟠',
        };
      case 'Moderate':
      case 'Warning':
        return {
          bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
          dot: 'bg-yellow-400',
          symbol: '🟡',
        };
      case 'Low':
      case 'Online':
      case 'Info':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          symbol: '🟢',
        };
      case 'Offline':
        return {
          bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-500',
          symbol: '⚪',
        };
      default:
        return {
          bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
          dot: 'bg-slate-400',
          symbol: '⚪',
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style.bg} ${sizeClasses[size]} select-none`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      )}
      <span>{level}</span>
    </span>
  );
};
