import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ImportSlip, ImportSlipItem, ImportSlipStatus } from '../types';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Building2, 
  Truck, 
  Calendar, 
  User, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export const ImportSlipsView: React.FC = () => {
  const { 
    importSlips, 
    materials, 
    branches, 
    activeBranchId, 
    currentUser, 
    createImportSlip, 
    receiveImportGoods, 
    cancelImportSlip,
    viewDetailsId,
    setViewDetailsId,
    showToast
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';
  const isStaff = currentUser.role === 'nhanvien';

  // Filters for list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detailed view / Create mode
  const isCreating = viewDetailsId === 'new';
  const selectedSlip = isCreating ? null : importSlips.find(s => s.id === viewDetailsId);

  // Form for New Import Slip
  const [createBranchId, setCreateBranchId] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');
  const [items, setItems] = useState<{
    materialId: string;
    plannedQuantity: number;
    unitPrice: number;
  }[]>([
    { materialId: materials[0]?.id || '', plannedQuantity: 50, unitPrice: materials[0]?.standardPrice || 100000 },
  ]);

  // Receiving Goods State (Khi kiểm nhận hàng)
  const [receivingInputs, setReceivingInputs] = useState<Record<string, {
    receivedQuantity: number;
    defectQuantity: number;
    defectReason: string;
  }>>({});
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Initialize receiving inputs when opening an approved slip
  React.useEffect(() => {
    if (selectedSlip && (selectedSlip.status === 'approved' || selectedSlip.status === 'receiving')) {
      const initial: Record<string, { receivedQuantity: number; defectQuantity: number; defectReason: string }> = {};
      selectedSlip.items.forEach(item => {
        initial[item.materialId] = {
          receivedQuantity: item.plannedQuantity, // default to planned
          defectQuantity: 0,
          defectReason: '',
        };
      });
      setReceivingInputs(initial);
    }
  }, [selectedSlip]);

  const handleAddItemRow = () => {
    const firstMat = materials[0];
    if (!firstMat) return;
    setItems(prev => [
      ...prev,
      { materialId: firstMat.id, plannedQuantity: 10, unitPrice: firstMat.standardPrice },
    ]);
  };

  const handleItemChange = (index: number, matId: string, qty: number, price: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { materialId: matId, plannedQuantity: qty, unitPrice: price };
      return next;
    });
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      showToast('Vui lòng nhập tên nhà cung cấp!', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Phiếu nhập phải có ít nhất 1 nguyên vật liệu!', 'error');
      return;
    }

    const branch = branches.find(b => b.id === createBranchId);
    let totalAmount = 0;

    const enrichedItems: ImportSlipItem[] = items.map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      const subtotal = item.plannedQuantity * item.unitPrice;
      totalAmount += subtotal;
      return {
        materialId: item.materialId,
        materialName: mat?.name || 'Nguyên vật liệu',
        unit: mat?.unit || 'kg',
        plannedQuantity: item.plannedQuantity,
        unitPrice: item.unitPrice,
        totalPrice: subtotal,
      };
    });

    createImportSlip({
      branchId: createBranchId,
      branchName: branch?.name || 'Chi nhánh 1',
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      supplier,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate,
      items: enrichedItems,
      totalAmount,
      note,
    });

    setViewDetailsId(null);
  };

  const handleConfirmReceive = () => {
    if (!selectedSlip) return;

    const payload = selectedSlip.items.map(item => {
      const input = receivingInputs[item.materialId] || {
        receivedQuantity: item.plannedQuantity,
        defectQuantity: 0,
        defectReason: '',
      };
      return {
        materialId: item.materialId,
        receivedQuantity: Number(input.receivedQuantity),
        defectQuantity: Number(input.defectQuantity || 0),
        defectReason: input.defectReason,
      };
    });

    receiveImportGoods(selectedSlip.id, payload);
  };

  // Helper status badge
  const renderStatusBadge = (status: ImportSlipStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Đã hoàn thành</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Chờ nhận hàng</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Từ chối duyệt</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Filter list
  const filteredSlips = importSlips.filter(s => {
    const matchesBranch = activeBranchId === 'all' || s.branchId === activeBranchId;
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesBranch && matchesSearch && matchesStatus;
  });

  // --- SUBVIEW 1: CREATE NEW IMPORT SLIP ---
  if (isCreating) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewDetailsId(null)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lập kế hoạch mua hàng (Tạo phiếu nhập)</h2>
              <p className="text-xs text-slate-500">
                Phiếu nhập sau khi lập sẽ chuyển sang trạng thái chờ Chủ cửa hàng phê duyệt
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chi nhánh nhận hàng *</label>
              <select
                value={createBranchId}
                onChange={(e) => setCreateBranchId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nhà cung cấp *</label>
              <input
                type="text"
                required
                placeholder="Tên đối tác / nhà cung ứng..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày dự kiến giao hàng *</label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú kế hoạch / Lý do mua</label>
            <input
              type="text"
              placeholder="Ví dụ: Bổ sung nguyên liệu chuẩn bị cho tuần cao điểm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">Danh mục nguyên vật liệu cần nhập:</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {items.map((row, idx) => {
                const mat = materials.find(m => m.id === row.materialId);
                return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <select
                      value={row.materialId}
                      onChange={(e) => {
                        const m = materials.find(mat => mat.id === e.target.value);
                        handleItemChange(idx, e.target.value, row.plannedQuantity, m?.standardPrice || 0);
                      }}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded text-xs"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={row.plannedQuantity}
                        onChange={(e) => handleItemChange(idx, row.materialId, Number(e.target.value), row.unitPrice)}
                        className="w-24 p-2 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                        placeholder="Số lượng"
                      />
                      <span className="text-slate-500 text-xs w-10">{mat?.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={row.unitPrice}
                        onChange={(e) => handleItemChange(idx, row.materialId, row.plannedQuantity, Number(e.target.value))}
                        className="w-28 p-2 bg-white border border-slate-200 rounded text-xs text-right font-medium"
                        placeholder="Đơn giá"
                      />
                      <span className="text-slate-500 text-xs">đ</span>
                    </div>

                    <span className="w-28 text-right font-bold text-slate-800 text-xs">
                      {(row.plannedQuantity * row.unitPrice).toLocaleString('vi-VN')} đ
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-3 bg-emerald-50 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-950">Tổng giá trị đơn hàng dự kiến:</span>
              <span className="font-bold text-emerald-900 text-sm">
                {items.reduce((sum, i) => sum + (i.plannedQuantity * i.unitPrice), 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setViewDetailsId(null)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 font-semibold shadow-xs"
            >
              {isOwner ? 'Lập và Phê duyệt ngay' : 'Tạo và Trình duyệt'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- SUBVIEW 2: SLIP DETAIL / RECEIVING VIEW ---
  if (selectedSlip) {
    const isApprovedWaitingReceive = selectedSlip.status === 'approved' || selectedSlip.status === 'receiving';
    const isCompleted = selectedSlip.status === 'completed';

    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-w-4xl mx-auto animate-in fade-in">
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewDetailsId(null)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900">{selectedSlip.code}</span>
                {renderStatusBadge(selectedSlip.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSlip.branchName} • Nhà cung cấp: <strong>{selectedSlip.supplier}</strong>
              </p>
            </div>
          </div>

          {/* Action Zone for Approved Slip */}
          {isApprovedWaitingReceive && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => cancelImportSlip(selectedSlip.id, 'Hủy bởi người quản lý')}
                className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Hủy phiếu
              </button>
              <button
                onClick={handleConfirmReceive}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Xác nhận nhận hàng & Nhập kho
              </button>
            </div>
          )}
        </div>

        {/* General Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Ngày đặt hàng:</span>
            <span className="font-bold text-slate-800">{selectedSlip.orderDate}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Dự kiến nhận:</span>
            <span className="font-bold text-slate-800">{selectedSlip.expectedDate}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Người tạo phiếu:</span>
            <span className="font-bold text-slate-800">{selectedSlip.creatorName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng tiền:</span>
            <span className="font-bold text-emerald-800">{selectedSlip.totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {selectedSlip.note && (
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>Ghi chú:</strong> {selectedSlip.note}
          </div>
        )}

        {/* Receiving Instruction if Approved */}
        {isApprovedWaitingReceive && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong>Quy trình kiểm hàng & nhận hàng thực tế:</strong>
              <p className="text-blue-800/90 mt-0.5">
                Vui lòng kiểm tra kỹ chất lượng, quy cách đóng gói và hạn sử dụng. Nếu phát sinh hàng hỏng/lỗi, hãy nhập số lượng lỗi. <em>Hệ thống chỉ cộng số lượng đạt chất lượng vào tồn kho!</em>
              </p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tên nguyên vật liệu</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-center">SL kế hoạch</th>
                {/* Chỉ hiện trường nhận hàng thực tế khi ở trạng thái kiểm nhận hoặc đã hoàn thành */}
                {(isApprovedWaitingReceive || isCompleted) && (
                  <>
                    <th className="py-2.5 px-3 text-center">SL thực nhận</th>
                    <th className="py-2.5 px-3 text-center">Hàng lỗi/hỏng</th>
                    <th className="py-2.5 px-3 text-center">SL đạt (cộng tồn)</th>
                  </>
                )}
                <th className="py-2.5 px-3 text-right">Đơn giá</th>
                <th className="py-2.5 px-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedSlip.items.map(item => {
                const input = receivingInputs[item.materialId] || {
                  receivedQuantity: item.plannedQuantity,
                  defectQuantity: 0,
                  defectReason: '',
                };
                const actualReceived = isCompleted ? (item.receivedQuantity || item.plannedQuantity) : input.receivedQuantity;
                const actualDefect = isCompleted ? (item.defectQuantity || 0) : input.defectQuantity;
                const validStock = Math.max(0, actualReceived - actualDefect);

                return (
                  <tr key={item.materialId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.materialName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.plannedQuantity}</td>

                    {/* Receiving editable inputs */}
                    {isApprovedWaitingReceive && (
                      <>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={input.receivedQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setReceivingInputs({
                                ...receivingInputs,
                                [item.materialId]: { ...input, receivedQuantity: val },
                              });
                            }}
                            className="w-16 p-1.5 border border-slate-300 rounded text-center font-bold text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={input.defectQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setReceivingInputs({
                                ...receivingInputs,
                                [item.materialId]: { ...input, defectQuantity: val },
                              });
                            }}
                            className="w-16 p-1.5 border border-rose-300 text-rose-700 rounded text-center font-bold text-xs bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-extrabold text-emerald-800">
                          {validStock}
                        </td>
                      </>
                    )}

                    {/* Completed read-only values */}
                    {isCompleted && (
                      <>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{actualReceived}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-700">{actualDefect}</td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-emerald-800">{validStock}</td>
                      </>
                    )}

                    <td className="py-2.5 px-3 text-right text-slate-600">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.totalPrice.toLocaleString('vi-VN')} đ</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Collapsible History Timeline */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Lịch sử xử lý phiếu ({selectedSlip.history.length} mốc sự kiện)</span>
            </div>
            {isHistoryExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isHistoryExpanded && (
            <div className="p-4 divide-y divide-slate-100 space-y-3 bg-white text-xs">
              {selectedSlip.history.map((h, i) => (
                <div key={i} className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{h.action}</span>
                    <span className="text-[11px] text-slate-400">{h.timestamp}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Thực hiện bởi: {h.performer}</div>
                  {h.note && <div className="text-slate-600 text-xs italic mt-1">"{h.note}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SUBVIEW 3: LIST VIEW ---
  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, nhà cung cấp, người lập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Chờ nhận hàng</option>
            <option value="pending_approval">Chờ duyệt</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="rejected">Từ chối duyệt</option>
          </select>
        </div>

        {/* Primary Action Button (Chủ & Quản lý) */}
        {!isStaff && (
          <button
            onClick={() => setViewDetailsId('new')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu nhập</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-32">Mã phiếu</th>
                <th className="py-3 px-4">Ngày đặt</th>
                <th className="py-3 px-4">Nhà cung cấp</th>
                <th className="py-3 px-4">Chi nhánh</th>
                <th className="py-3 px-4">Người lập</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlips.map(slip => (
                <tr
                  key={slip.id}
                  onClick={() => setViewDetailsId(slip.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 group-hover:underline">
                    {slip.code}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{slip.orderDate}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{slip.supplier}</td>
                  <td className="py-3 px-4 text-slate-600">{slip.branchName.split('—')[0]}</td>
                  <td className="py-3 px-4 text-slate-600">{slip.creatorName}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {slip.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-center">
                    {renderStatusBadge(slip.status)}
                  </td>
                </tr>
              ))}

              {filteredSlips.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu nhập nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
