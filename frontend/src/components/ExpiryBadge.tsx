import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ExpiryBadgeProps {
  status: 'safe' | 'expiring_soon' | 'expired';
  daysLeft: number;
  expiryDate: string;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({ status, daysLeft, expiryDate }) => {
  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3.5 h-3.5 text-red-600" />
        Expired ({Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} ago)
      </span>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        {daysLeft === 0 ? 'Expires Today!' : daysLeft === 1 ? 'Expires Tomorrow!' : `Expiring in ${daysLeft} days`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
      Safe ({daysLeft} days left)
    </span>
  );
};
