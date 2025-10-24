import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { supabase, Product, Customer } from '../lib/supabase';
import { Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface CreateNotaProps {
  items: Array<{ product: Product; quantity: number; unit: string }>;
  onBack: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const CreateNota: React.FC<CreateNotaProps> = ({
  items,
  onBack,
  onSuccess,
  onError,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    notes: '',
    paymentTermsDays: '',
  });
  const [generatedTransactionNumber, setGeneratedTransactionNumber] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
    generateNextTransactionNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      onError('Gagal memuat data customer');
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          customerName: customer.name,
          customerAddress: customer.address,
        });
      }
    }
  };

  const getDiscountInfo = (product: Product, quantity: number, unit?: string) => {
    if (!product.discount_tiers || product.discount_tiers.length === 0) {
      return {
        finalPrice: product.price,
        hasDiscount: false,
        tier: null,
        discounts: []
      };
    }

    const exactTier = product.discount_tiers.find(
      tier => tier.isExact && tier.minQuantity === quantity && (!unit || tier.unit === unit)
    );

    if (exactTier) {
      const basePrice = product.base_price || product.price;
      let pricePerUnit = basePrice;
      const discounts = [];

      pricePerUnit = pricePerUnit - (pricePerUnit * exactTier.discount) / 100;
      discounts.push(exactTier.discount);

      if (exactTier.discount2 && exactTier.discount2 > 0) {
        pricePerUnit = pricePerUnit - (pricePerUnit * exactTier.discount2) / 100;
        discounts.push(exactTier.discount2);
      }

      return {
        finalPrice: pricePerUnit,
        hasDiscount: true,
        tier: exactTier,
        discounts
      };
    }

    const sortedTiers = [...product.discount_tiers]
      .filter(tier => !tier.isExact && (!unit || tier.unit === unit))
      .sort((a, b) => b.minQuantity - a.minQuantity);

    const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);

    if (!applicableTier) {
      return {
        finalPrice: product.price,
        hasDiscount: false,
        tier: null,
        discounts: []
      };
    }

    const basePrice = product.base_price || product.price;
    let pricePerUnit = basePrice;
    const discounts = [];

    pricePerUnit = pricePerUnit - (pricePerUnit * applicableTier.discount) / 100;
    discounts.push(applicableTier.discount);

    if (applicableTier.discount2 && applicableTier.discount2 > 0) {
      pricePerUnit = pricePerUnit - (pricePerUnit * applicableTier.discount2) / 100;
      discounts.push(applicableTier.discount2);
    }

    return {
      finalPrice: pricePerUnit,
      hasDiscount: true,
      tier: applicableTier,
      discounts
    };
  };

  const getPriceForQuantity = (product: Product, quantity: number, unit?: string): number => {
    return getDiscountInfo(product, quantity, unit).finalPrice;
  };

  const totalAmount = items.reduce(
    (sum, item) => {
      const finalPrice = getPriceForQuantity(item.product, item.quantity, item.unit);
      return sum + finalPrice * item.quantity;
    },
    0
  );

  const generateNextTransactionNumber = async () => {
    try {
      const { data: setting, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'transaction_counter')
        .maybeSingle();

      if (error) throw error;

      const currentCounter = setting?.value || '2504040159';
      const nextNumber = `RJA/APT/${currentCounter}`;
      setGeneratedTransactionNumber(nextNumber);
    } catch (error: any) {
      onError('Gagal generate nomor transaksi');
      setGeneratedTransactionNumber('RJA/APT/2504040159');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      onError('Silakan pilih customer');
      return;
    }

    setLoading(true);
    try {
      const { data: setting, error: settingError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'transaction_counter')
        .maybeSingle();

      if (settingError) throw settingError;

      const currentCounter = setting?.value || '2504040159';
      const transactionNumber = `RJA/APT/${currentCounter}`;

      const nextCounter = (parseInt(currentCounter) + 1).toString();
      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: nextCounter, updated_at: new Date().toISOString() })
        .eq('key', 'transaction_counter');

      if (updateError) throw updateError;

      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert({
          transaction_number: transactionNumber,
          customer_name: formData.customerName,
          customer_phone: '',
          customer_address: formData.customerAddress,
          total_amount: totalAmount,
          notes: formData.notes,
          payment_terms_days: formData.paymentTermsDays || null,
          created_by: user?.id,
          status: 'completed',
        })
        .select()
        .single();

      if (transError) throw transError;

      const transactionItems = items.map((item) => {
        const basePrice = item.product.base_price || item.product.price;
        const discountInfo = getDiscountInfo(item.product, item.quantity, item.unit);
        const finalPrice = discountInfo.finalPrice;

        const discountAmount = basePrice - finalPrice;
        const discountPercent = basePrice > 0 ? ((discountAmount / basePrice) * 100) : 0;

        let discountDetails = null;
        if (discountInfo.discounts.length > 0) {
          discountDetails = {
            discount1: discountInfo.discounts[0] || 0,
            discount2: discountInfo.discounts[1] || 0,
          };
        }

        return {
          transaction_id: transaction.id,
          product_id: item.product.id,
          product_name: `${item.product.name} (${item.quantity} ${item.unit})`,
          quantity: item.quantity,
          unit_price: finalPrice,
          subtotal: finalPrice * item.quantity,
          unit: item.unit,
          discount_amount: discountAmount,
          discount_percent: Math.round(discountPercent * 100) / 100,
          discount_details: discountDetails,
        };
      });

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      onSuccess(`Nota berhasil dibuat dengan nomor ${transactionNumber}`);
      onBack();
    } catch (error: any) {
      const errorMessage = error.message?.includes('duplicate key')
        ? 'Nomor transaksi sudah digunakan'
        : error.message?.includes('violates')
        ? 'Terjadi kesalahan validasi data'
        : 'Gagal membuat nota';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-black mb-6">Buat Nota Penjualan</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-black">Informasi Transaksi</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Nomor Transaksi</p>
              <p className="text-lg font-semibold text-black">{generatedTransactionNumber || 'Memuat...'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-black">Informasi Pelanggan</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCustomerId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Nama Customer</p>
                  <p className="font-medium text-black">{formData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Alamat</p>
                  <p className="text-sm text-gray-700">{formData.customerAddress || '-'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-black">Detail Produk</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-black">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-black">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const basePrice = item.product.base_price || item.product.price;
                    const discountInfo = getDiscountInfo(item.product, item.quantity, item.unit);
                    const finalPrice = discountInfo.finalPrice;
                    const subtotal = finalPrice * item.quantity;
                    const hasDiscount = discountInfo.hasDiscount;

                    return (
                      <tr key={`${item.product.id}-${item.unit}-${index}`}>
                        <td className="px-4 py-3 text-sm text-black">
                          {item.product.name}
                          {hasDiscount && discountInfo.discounts.length > 0 && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <span>Diskon diterapkan:</span>
                              {discountInfo.discounts.map((discount, idx) => (
                                <span key={idx} className="inline-block bg-green-600 text-white px-1.5 py-0.5 rounded font-medium">
                                  -{discount}%
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {hasDiscount ? (
                            <div>
                              <div className="text-xs text-gray-400 line-through">
                                Rp {basePrice.toLocaleString('id-ID')}
                              </div>
                              <div className="font-semibold text-green-600">
                                Rp {finalPrice.toLocaleString('id-ID')}
                              </div>
                            </div>
                          ) : (
                            <span>Rp {finalPrice.toLocaleString('id-ID')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-black">
                          Rp {subtotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-right font-semibold text-black"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-black">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-black">Informasi Pembayaran</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term of Payment
              </label>
              <input
                type="text"
                value={formData.paymentTermsDays}
                onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <Textarea
            label="Catatan (Opsional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" loading={loading}>
              <Download className="w-4 h-4" />
              Buat dan Simpan Nota
            </Button>
            <Button type="button" variant="secondary" onClick={onBack}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
