import React from 'react';

interface MetricsCardProps {
  icon: string;
  iconColor: string;
  value: string | number;
  label: string;
  bgColor?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  icon,
  iconColor,
  value,
  label,
  bgColor = 'glass-morphism-eco',
  trend
}) => {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return 'fas fa-arrow-up';
      case 'down': return 'fas fa-arrow-down';
      case 'stable': return 'fas fa-minus';
      default: return 'fas fa-minus';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-eco-primary';
      case 'down': return 'text-coral';
      case 'stable': return 'text-white/60';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow duration-300`}>
        <i className={`${icon} text-2xl ${iconColor}`} aria-hidden="true"></i>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold font-mono" aria-live="polite">
          {value}
        </div>
        <div className="text-sm text-white/60">
          {label}
        </div>
        
        {trend && (
          <div className={`text-xs flex items-center justify-center space-x-1 ${getTrendColor(trend.direction)}`}>
            <i className={getTrendIcon(trend.direction)} aria-hidden="true"></i>
            <span>{Math.abs(trend.percentage)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
