import React, { useMemo } from 'react';
import { DiscountTier } from '../../lib/supabase';

interface DiscountCalculatorProps {
  basePrice: number;
  discountTiers: DiscountTier[];
}

interface CalculationRow {
  quantity: number;
  discount: number;
  discount2?: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  savings: number;
  isExact: boolean;
}

export const DiscountCalculator: React.FC<DiscountCalculatorProps> = ({
  basePrice,
  discountTiers,
}) => {
  const calculations = useMemo(() => {
    if (!basePrice || basePrice <= 0) return [];

    const sortedTiers = [...discountTiers].sort(
      (a, b) => a.minQuantity - b.minQuantity
    );
    const results: CalculationRow[] = [];

    sortedTiers.forEach((tier) => {
      const { discount, discount2, minQuantity, unit, isExact } = tier;

      let pricePerUnit = basePrice - (basePrice * discount) / 100;
      if (discount2 && discount2 > 0) {
        pricePerUnit = pricePerUnit - (pricePerUnit * discount2) / 100;
      }

      const total = pricePerUnit * minQuantity;
      const originalTotal = basePrice * minQuantity;
      const savings = originalTotal - total;

      results.push({
        quantity: minQuantity,
        discount,
        discount2,
        unit,
        pricePerUnit,
        total,
        savings,
        isExact: isExact || false,
      });
    });

    return results;
  }, [basePrice, discountTiers]);

  if (!basePrice || basePrice <= 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Masukkan harga dasar untuk melihat perhitungan diskon.
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Tambahkan tier diskon untuk melihat perhitungan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
              Qty
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
              Unit
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">
              Diskon
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">
              Harga/Unit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {calculations.map((calc, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-black">
                {calc.isExact ? `= ${calc.quantity}` : `≥ ${calc.quantity}`}
              </td>
              <td className="px-4 py-3 text-sm text-left text-gray-700 capitalize">
                {calc.unit}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                  {calc.discount}% {calc.discount2 ? `+ ${calc.discount2}%` : ''}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-black">
                Rp{' '}
                {calc.pricePerUnit.toLocaleString('id-ID', {
                  maximumFractionDigits: 0,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
