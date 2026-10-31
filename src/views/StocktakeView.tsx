import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stocktake, StocktakeItem } from '../types';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  ClipboardCheck, 
  Printer, 
  Save, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Send,
  Building2,
  FileCheck
} from 'lucide-react';

export const StocktakeView: React.FC = () => {
  const { 
    stocktakes, 
    materials, 
    branches, 
    activeBranchId, 
    currentUser, 
    createStocktake, 
    proposeStockAdjustment,
    viewDetailsId,
    setViewDetailsId,
    showToast 
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';
  const isManager = currentUser.role === 'quanly';
  const isStaff = currentUser.role === 'nhanvien';

  const [searchTerm, setSearchTerm] = useState('');

  // Form mode: 'new' or editing existing stocktake ID
  const isCreating = viewDetailsId === 'new';
  const selectedStocktake = isCreating ? null : stocktakes.find(s => s.id === viewDetailsId);

  // Form State for counting
  const [stocktakeBranchId, setStocktakeBranchId] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [stocktakeNote, setStocktakeNote] = useState('');
  const [countInputs, setCountInputs] = useState<Record<string, number>>({});
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});

  // Initialize countInputs when creating new
  React.useEffect(() => {
    if (isCreating) {
      const initial: Record<string, number> = {};
      materials.filter(m => m.status === 'active').forEach(m => {
        initial[m.id] = isStaff ? 0 : (m.stocks[stocktakeBranchId] || 0);
      });
      setCountInputs(initial);
      setReasonInputs({});
    }
  }, [isCreating, stocktakeBranchId, materials, isStaff]);

  const handleSaveCount = (isDraft: boolean) => {
    if (activeBranchId === 'all' && !stocktakeBranchId) {
      showToast('Vui lòng chọn chi nhánh cần kiểm kê!', 'error');
      return;
    }

    const activeMats = materials.filter(m => m.status === 'active');
    const items = activeMats.map(mat => ({
      materialId: mat.id,
      actualStock: Number(countInputs[mat.id] || 0),
      differenceReason: reasonInputs[mat.id] || '',
    }));

    createStocktake(stocktakeBranchId, items, stocktakeNote || (isDraft ? 'Lưu nháp kiểm kê' : 'Kiểm kê định kỳ'));
    setViewDetailsId(null);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  const filteredStocktakes = stocktakes.filter(s => {
    const matchesBranch = activeBranchId === 'all' || s.branchId === activeBranchId;
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // --- SUBVIEW: COUNTING FORM (TẠO MỚI HOẶC XEM PHIẾU ĐÃ KIỂM) ---
  if (isCreating || selectedStocktake) {
    const isReadOnly = !!selectedStocktake;
    const targetBranchId = isCreating ? stocktakeBranchId : selectedStocktake!.branchId;
    const targetBranchName = branches.find(b => b.id === targetBranchId)?.name || targetBranchId;

    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-w-4xl mx-auto animate-in fade-in">
        {/* Header with Title and Actions */}
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
                <h2 className="text-base font-bold text-slate-900">
                  {isCreating ? 'Phiếu kiểm kê nguyên vật liệu thực tế' : `Phiếu kiểm kê ${selectedStocktake!.code}`}
                </h2>
                {selectedStocktake?.status === 'adjusted' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    Đã điều chỉnh tồn
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Đã lưu kết quả
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {targetBranchName} • Ngày: {isCreating ? new Date().toLocaleDateString('vi-VN') : selectedStocktake!.stocktakeDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSheet}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In mẫu kiểm</span>
            </button>

            {isCreating && (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveCount(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu nháp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCount(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Xác nhận kết quả</span>
                </button>
              </>
            )}

            {/* If viewed by Owner or Manager and has discrepancies, can propose adjustment */}
            {selectedStocktake && !selectedStocktake.hasAdjustmentProposed && (isOwner || isManager) && (
              <button
                type="button"
                onClick={() => proposeStockAdjustment(selectedStocktake.id, 'Đề xuất cân chỉnh sổ kho theo kết quả kiểm kê')}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi đề xuất điều chỉnh tồn</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice for Staff: Theoretical balance is hidden */}
        {isStaff && isCreating && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
            <strong>Nguyên tắc kiểm đếm mù:</strong> Biểu mẫu chỉ hiển thị tên nguyên liệu và đơn vị tính. Vui lòng đếm chính xác số lượng thực tế hiện hữu tại quầy và kho để ghi nhận vào cột <em>Số lượng thực tế</em>.
          </div>
        )}

        {/* Branch Selector if Creating and Owner */}
        {isCreating && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chi nhánh kiểm kê *</label>
              <select
                value={stocktakeBranchId}
                onChange={(e) => setStocktakeBranchId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi chú đợt kiểm kê</label>
              <input
                type="text"
                placeholder="Ghi chú người cùng kiểm, thời điểm ca..."
                value={stocktakeNote}
                onChange={(e) => setStocktakeNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              />
            </div>
          </div>
        )}

        {/* Items Table: Biểu mẫu kiểm đếm đơn giản */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Tên nguyên vật liệu</th>
                <th className="py-2.5 px-3 text-center w-24">Đơn vị tính</th>
                {/* ẨN TỒN LÝ THUYẾT ĐỐI VỚI NHÂN VIÊN */}
                {!isStaff && (
                  <th className="py-2.5 px-3 text-center w-28">Tồn sổ sách</th>
                )}
                <th className="py-2.5 px-3 text-center w-36">Số lượng thực tế *</th>
                {!isStaff && (
                  <>
                    <th className="py-2.5 px-3 text-center w-28">Chênh lệch</th>
                    <th className="py-2.5 px-3">Giải trình chênh lệch</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isCreating ? (
                materials.filter(m => m.status === 'active').map((mat, idx) => {
                  const currentStock = mat.stocks[stocktakeBranchId] || 0;
                  const actualVal = countInputs[mat.id] ?? 0;
                  const diff = actualVal - currentStock;

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{mat.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{mat.unit}</td>

                      {/* Tồn sổ sách chỉ hiện với Chủ / Quản lý */}
                      {!isStaff && (
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{currentStock}</td>
                      )}

                      {/* Nhập số lượng thực tế */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={actualVal}
                          onChange={(e) => {
                            setCountInputs({
                              ...countInputs,
                              [mat.id]: Number(e.target.value),
                            });
                          }}
                          className="w-28 p-1.5 border border-slate-300 rounded text-center font-bold text-xs bg-white focus:outline-hidden focus:border-emerald-700"
                        />
                      </td>

                      {!isStaff && (
                        <>
                          <td className={`py-2.5 px-3 text-center font-bold ${
                            diff < 0 ? 'text-rose-700' : diff > 0 ? 'text-blue-700' : 'text-slate-400'
                          }`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                          <td className="py-2 px-3">
                            {diff !== 0 ? (
                              <input
                                type="text"
                                placeholder="Ghi nhận nguyên nhân..."
                                value={reasonInputs[mat.id] || ''}
                                onChange={(e) => {
                                  setReasonInputs({
                                    ...reasonInputs,
                                    [mat.id]: e.target.value,
                                  });
                                }}
                                className="w-full p-1.5 border border-slate-200 rounded text-xs"
                              />
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Khớp sổ sách</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                selectedStocktake!.items.map((item, idx) => (
                  <tr key={item.materialId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.materialName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>

                    {!isStaff && (
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.systemStock}</td>
                    )}

                    <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{item.actualStock}</td>

                    {!isStaff && (
                      <>
                        <td className={`py-2.5 px-3 text-center font-bold ${
                          item.difference < 0 ? 'text-rose-700' : item.difference > 0 ? 'text-blue-700' : 'text-slate-400'
                        }`}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {item.differenceReason || (item.difference === 0 ? 'Khớp sổ sách' : 'Chưa có giải trình')}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-center justify-between">
          <span>
            * <strong>Quy tắc nghiệp vụ:</strong> Dữ liệu kiểm kê lưu kết quả đếm đối chiếu, không tự ý ghi đè số dư sổ kho cho đến khi Chủ cửa hàng duyệt điều chỉnh.
          </span>
          <button
            onClick={() => setViewDetailsId(null)}
            className="text-emerald-800 hover:underline font-semibold"
          >
            Quay lại danh sách phiếu
          </button>
        </div>
      </div>
    );
  }

  // --- SUBVIEW: LIST VIEW OF STOCKTAKES ---
  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu kiểm kê, người tạo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-700"
          />
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setViewDetailsId('new')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo kiểm kê</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-32">Mã đợt kiểm</th>
                <th className="py-3 px-4">Ngày kiểm kê</th>
                <th className="py-3 px-4">Chi nhánh</th>
                <th className="py-3 px-4">Người kiểm đếm</th>
                <th className="py-3 px-4 text-center">Số mặt hàng</th>
                <th className="py-3 px-4">Ghi chú</th>
                <th className="py-3 px-4 text-center">Tình trạng điều chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocktakes.map(st => (
                <tr
                  key={st.id}
                  onClick={() => setViewDetailsId(st.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800 group-hover:underline">
                    {st.code}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{st.stocktakeDate}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{st.branchName.split('—')[0]}</td>
                  <td className="py-3 px-4 text-slate-600">{st.creatorName}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{st.items.length}</td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{st.note || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    {st.status === 'adjusted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        <CheckCircle className="w-3 h-3 text-purple-600" />
                        Đã cập nhật tồn
                      </span>
                    ) : st.hasAdjustmentProposed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Đang chờ duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Đã lưu kết quả
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredStocktakes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy đợt kiểm kê nào.
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
