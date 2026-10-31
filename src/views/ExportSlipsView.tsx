import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExportSlip, ExportSlipType, ExportSlipStatus } from '../types';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Building2, 
  ArrowUpFromLine, 
  Coffee, 
  Flame, 
  Share2, 
  Check
} from 'lucide-react';

export const ExportSlipsView: React.FC = () => {
  const { 
    exportSlips, 
    materials, 
    branches, 
    activeBranchId, 
    currentUser, 
    createExportSlip, 
    confirmActualExport, 
    cancelExportSlip,
    viewDetailsId,
    setViewDetailsId,
    showToast
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';
  const isStaff = currentUser.role === 'nhanvien';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isCreating = viewDetailsId === 'new';
  const selectedSlip = isCreating ? null : exportSlips.find(s => s.id === viewDetailsId);

  // Form State for New Export Slip
  const [createBranchId, setCreateBranchId] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [exportType, setExportType] = useState<ExportSlipType>('cap_quay');
  const [reason, setReason] = useState('Cấp quầy pha chế ca sáng (Luân chuyển nội bộ)');
  const [items, setItems] = useState<{
    materialId: string;
    requestedQuantity: number;
  }[]>([
    { materialId: materials[0]?.id || '', requestedQuantity: 5 },
  ]);

  // Actual export values for confirmation
  const [actualExportInputs, setActualExportInputs] = useState<Record<string, number>>({});
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  React.useEffect(() => {
    if (selectedSlip && selectedSlip.status === 'pending_confirmation') {
      const initial: Record<string, number> = {};
      selectedSlip.items.forEach(item => {
        initial[item.materialId] = item.requestedQuantity;
      });
      setActualExportInputs(initial);
    }
  }, [selectedSlip]);

  const handleAddItemRow = () => {
    const firstMat = materials[0];
    if (!firstMat) return;
    setItems(prev => [
      ...prev,
      { materialId: firstMat.id, requestedQuantity: 1 },
    ]);
  };

  const handleItemChange = (index: number, matId: string, qty: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { materialId: matId, requestedQuantity: qty };
      return next;
    });
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Vui lòng nhập lý do xuất kho!', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Phiếu xuất phải có ít nhất 1 nguyên vật liệu!', 'error');
      return;
    }

    const branch = branches.find(b => b.id === createBranchId);
    let totalAmount = 0;

    const enrichedItems = items.map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      const unitCost = mat?.standardPrice || 0;
      const subtotal = item.requestedQuantity * unitCost;
      totalAmount += subtotal;
      return {
        materialId: item.materialId,
        materialName: mat?.name || 'Nguyên vật liệu',
        unit: mat?.unit || 'kg',
        requestedQuantity: item.requestedQuantity,
        unitCost,
        totalCost: subtotal,
      };
    });

    const success = createExportSlip({
      branchId: createBranchId,
      branchName: branch?.name || 'Chi nhánh 1',
      type: exportType,
      isInternalTransfer: exportType === 'cap_quay',
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      requestDate: new Date().toISOString().split('T')[0],
      items: enrichedItems,
      totalAmount,
      reason,
    });

    if (success) {
      setViewDetailsId(null);
    }
  };

  const handleConfirmExport = () => {
    if (!selectedSlip) return;

    const payload = selectedSlip.items.map(item => ({
      materialId: item.materialId,
      actualQuantity: Number(actualExportInputs[item.materialId] ?? item.requestedQuantity),
    }));

    const success = confirmActualExport(selectedSlip.id, payload);
    if (success) {
      // Completed, reload or stay in view
    }
  };

  const renderTypeBadge = (type: ExportSlipType) => {
    switch (type) {
      case 'cap_quay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Coffee className="w-3 h-3 text-blue-600" />
            <span>Cấp quầy (Nội bộ)</span>
          </span>
        );
      case 'huy_hong':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>Hủy hỏng / Hết hạn</span>
          </span>
        );
      case 'chuyen_kho':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Share2 className="w-3 h-3 text-purple-600" />
            <span>Chuyển kho</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            <span>Khác</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: ExportSlipStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Đã thực xuất</span>
          </span>
        );
      case 'pending_confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Chờ thực xuất</span>
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

  const filteredSlips = exportSlips.filter(s => {
    const matchesBranch = activeBranchId === 'all' || s.branchId === activeBranchId;
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesBranch && matchesSearch && matchesType && matchesStatus;
  });

  // --- SUBVIEW 1: CREATE EXPORT SLIP ---
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
              <h2 className="text-base font-bold text-slate-900">Tạo phiếu xuất kho</h2>
              <p className="text-xs text-slate-500">
                Lập phiếu chưa trừ tồn; tồn kho chỉ được trừ một lần sau khi bấm Xác nhận thực xuất.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chi nhánh xuất kho *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Loại xuất kho *</label>
              <select
                value={exportType}
                onChange={(e) => {
                  const t = e.target.value as ExportSlipType;
                  setExportType(t);
                  if (t === 'cap_quay') setReason('Cấp quầy pha chế ca sáng (Luân chuyển nội bộ)');
                  else if (t === 'huy_hong') setReason('Xuất hủy nguyên liệu hết hạn / hỏng');
                  else if (t === 'chuyen_kho') setReason('Điều chuyển sang chi nhánh khác');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              >
                <option value="cap_quay">Cấp quầy pha chế (Luân chuyển nội bộ)</option>
                <option value="huy_hong">Xuất hủy hỏng / hết hạn</option>
                <option value="chuyen_kho">Luân chuyển sang chi nhánh khác</option>
                <option value="khac">Xuất mục đích khác</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày yêu cầu *</label>
              <input
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lý do xuất kho *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">Danh mục nguyên vật liệu yêu cầu xuất:</label>
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
                const currentStock = mat ? (mat.stocks[createBranchId] || 0) : 0;
                const isOverStock = row.requestedQuantity > currentStock;

                return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <select
                      value={row.materialId}
                      onChange={(e) => handleItemChange(idx, e.target.value, row.requestedQuantity)}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded text-xs"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} (Tồn hiện tại: {m.stocks[createBranchId] || 0} {m.unit})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={row.requestedQuantity}
                        onChange={(e) => handleItemChange(idx, row.materialId, Number(e.target.value))}
                        className={`w-24 p-2 border rounded text-xs text-center font-bold ${
                          isOverStock ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white'
                        }`}
                        placeholder="Số lượng"
                      />
                      <span className="text-slate-500 text-xs w-10">{mat?.unit}</span>
                    </div>

                    <span className="w-28 text-right font-medium text-slate-700 text-xs">
                      {((row.requestedQuantity || 0) * (mat?.standardPrice || 0)).toLocaleString('vi-VN')} đ
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
              Tạo phiếu xuất
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- SUBVIEW 2: SLIP DETAIL / CONFIRMATION VIEW ---
  if (selectedSlip) {
    const isPending = selectedSlip.status === 'pending_confirmation';
    const isCompleted = selectedSlip.status === 'completed';

    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-w-4xl mx-auto animate-in fade-in">
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
                {renderTypeBadge(selectedSlip.type)}
                {renderStatusBadge(selectedSlip.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedSlip.branchName} • Lý do: <strong>{selectedSlip.reason}</strong>
              </p>
            </div>
          </div>

          {/* Action Button: Confirm actual export */}
          {isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => cancelExportSlip(selectedSlip.id, 'Hủy bởi người phụ trách')}
                className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Hủy phiếu
              </button>
              <button
                onClick={handleConfirmExport}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Xác nhận thực xuất & Trừ tồn
              </button>
            </div>
          )}
        </div>

        {/* General Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Ngày yêu cầu:</span>
            <span className="font-bold text-slate-800">{selectedSlip.requestDate}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Người tạo phiếu:</span>
            <span className="font-bold text-slate-800">{selectedSlip.creatorName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Phân loại:</span>
            <span className="font-bold text-slate-800">
              {selectedSlip.isInternalTransfer ? 'Luân chuyển nội bộ' : 'Xuất kho tiêu hao / hủy'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng giá trị xuất:</span>
            <span className="font-bold text-emerald-800">{selectedSlip.totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tên nguyên vật liệu</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-center">SL yêu cầu</th>
                <th className="py-2.5 px-3 text-center">SL thực xuất</th>
                <th className="py-2.5 px-3 text-right">Đơn giá vốn</th>
                <th className="py-2.5 px-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedSlip.items.map(item => {
                const actualVal = isCompleted 
                  ? (item.actualQuantity ?? item.requestedQuantity)
                  : (actualExportInputs[item.materialId] ?? item.requestedQuantity);

                return (
                  <tr key={item.materialId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.materialName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.requestedQuantity}</td>
                    
                    {isPending ? (
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={actualVal}
                          onChange={(e) => {
                            setActualExportInputs({
                              ...actualExportInputs,
                              [item.materialId]: Number(e.target.value),
                            });
                          }}
                          className="w-20 p-1.5 border border-slate-300 rounded text-center font-bold text-xs bg-white"
                        />
                      </td>
                    ) : (
                      <td className="py-2.5 px-3 text-center font-extrabold text-emerald-800">{actualVal}</td>
                    )}

                    <td className="py-2.5 px-3 text-right text-slate-600">{item.unitCost.toLocaleString('vi-VN')} đ</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.totalCost.toLocaleString('vi-VN')} đ</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* History */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Lịch sử xử lý phiếu ({selectedSlip.history.length} mốc)</span>
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
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, lý do xuất, người lập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-700"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-700"
          >
            <option value="all">Tất cả loại xuất</option>
            <option value="cap_quay">Cấp quầy pha chế</option>
            <option value="huy_hong">Hủy hỏng / hết hạn</option>
            <option value="chuyen_kho">Chuyển kho</option>
          </select>
        </div>

        {/* Primary Action Button (Chủ & Quản lý) */}
        {!isStaff && (
          <button
            onClick={() => setViewDetailsId('new')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu xuất</span>
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
                <th className="py-3 px-4">Ngày yêu cầu</th>
                <th className="py-3 px-4">Loại xuất kho</th>
                <th className="py-3 px-4">Lý do xuất</th>
                <th className="py-3 px-4">Người lập</th>
                <th className="py-3 px-4 text-right">Tổng giá trị</th>
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
                  <td className="py-3 px-4 text-slate-700">{slip.requestDate}</td>
                  <td className="py-3 px-4">{renderTypeBadge(slip.type)}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-xs">{slip.reason}</td>
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
                    Không tìm thấy phiếu xuất nào phù hợp.
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
