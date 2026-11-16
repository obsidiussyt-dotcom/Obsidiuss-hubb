import React from 'react';
import { Crown, Shield, ShieldCheck, Sparkles, User, Code2 } from 'lucide-react';

export type RoleType = 'Creator' | 'Admin' | 'VIP' | 'Moderator' | 'Member' | string;

interface RoleBadgeProps {
  role?: RoleType;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role = 'Member',
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const norm = (role || 'Member').trim().toLowerCase();

  const getConfig = () => {
    switch (norm) {
      case 'creator':
      case 'owner':
        return {
          label: 'Creator',
          icon: Crown,
          container:
            'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 text-amber-800 border-amber-300/90 ring-1 ring-amber-400/30 shadow-xs font-black',
          iconColor: 'text-amber-600',
        };
      case 'admin':
      case 'administrator':
        return {
          label: 'Admin',
          icon: Shield,
          container:
            'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300/30 shadow-xs font-bold',
          iconColor: 'text-rose-600',
        };
      case 'moderator':
      case 'mod':
        return {
          label: 'Moderator',
          icon: ShieldCheck,
          container:
            'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/30 shadow-xs font-bold',
          iconColor: 'text-emerald-600',
        };
      case 'developer':
      case 'dev':
        return {
          label: 'Developer',
          icon: Code2,
          container:
            'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-300/30 shadow-xs font-bold',
          iconColor: 'text-indigo-600',
        };
      case 'vip':
      case 'booster':
        return {
          label: 'VIP',
          icon: Sparkles,
          container:
            'bg-pink-50 text-pink-700 border-pink-200 ring-1 ring-pink-300/30 shadow-xs font-bold',
          iconColor: 'text-pink-600',
        };
      case 'member':
      default:
        return {
          label: 'Member',
          icon: User,
          container:
            'bg-blue-50/90 text-blue-700 border-blue-200/90 shadow-xs font-medium',
          iconColor: 'text-blue-500',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeStyle =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0.5 gap-1'
      : size === 'md'
      ? 'text-xs px-2.5 py-1 gap-1.5'
      : 'text-[11px] px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center tracking-tight border rounded-lg uppercase ${config.container} ${sizeStyle} ${className}`}
    >
      {showIcon && <Icon className={`w-3 h-3 shrink-0 ${config.iconColor}`} />}
      <span>{config.label}</span>
    </span>
  );
};
