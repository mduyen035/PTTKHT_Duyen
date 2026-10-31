import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  BarChart3, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  FileSpreadsheet, 
  TrendingDown, 
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    materials, 
    branches, 
    activeBranchId, 
    activeTab, 
    setActiveTab, 
    salesRecords, 
    stocktakes, 
    recipes, 
    setCurrentNav, 
    currentUser,
    showToast 
  } = useApp();

  const tab = activeTab || 'ton-kho';

  // Filters State
  const [filterBranchId, setFilterBranchId] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [filterPeriod, setFilterPeriod] = useState<string>('2026-W43 (19/10 - 25/10/2026)');
  const [hasViewed, setHasViewed] = useState(true);

  // Check if data is missing for Loss / Hao hut report
  const branchSales = salesRecords.find(r => r.branchId === filterBranchId);
  const branchStocktake = stocktakes.find(s => s.branchId === filterBranchId);

  const isMissingSales = !branchSales;
  const isMissingStocktake = !branchStocktake;

  const handleExportExcel = () => {
    let csv = '';
    const bName = branches.find(b => b.id === filterBranchId)?.name || filterBranchId;

    if (tab === 'ton-kho') {
      csv = 'Ma_NVL,Ten_Nguyen_Lieu,Phan_Loai,DVT,Ton_Hien_Tai,Don_Gia,Gia_Tri_Ton\n' +
        materials.map(m => {
          const stock = m.stocks[filterBranchId] || 0;
          return `${m.code},"${m.name}","${m.category}",${m.unit},${stock},${m.standardPrice},${stock * m.standardPrice}`;
        }).join('\n');
    } else {
      csv = 'Ma_NVL,Ten_Nguyen_Lieu,DVT,Ton_So_Sach,Ton_Thuc_Te,Tieu_Hao_Ban_Hang,Chenh_Lech_Hao_Hut,Ty_Le_Hao_Hut\n' +
        materials.slice(0, 6).map(m => {
          const sys = m.stocks[filterBranchId] || 0;
          const actual = branchStocktake?.items.find(i => i.materialId === m.id)?.actualStock || sys;
          const diff = actual - sys;
          return `${m.code},"${m.name}",${m.unit},${sys},${actual},${Math.abs(diff)},${diff},"${diff === 0 ? '0%' : '1.5%'}"`;
        }).join('\n');
    }

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,\uFEFF' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_${tab === 'ton-kho' ? 'Ton_Kho' : 'Hao_Hut'}_${filterBranchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất báo cáo ra file Excel (.csv) thành công!');
  };

  return (
    <div className="space-y-4">
      {/* 2-Tab Navigation Bar & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('ton-kho')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'ton-kho'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Báo cáo Tồn kho
          </button>
          <button
            onClick={() => setActiveTab('hao-hut')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'hao-hut'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Báo cáo Hao hụt & Đối chiếu
          </button>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Xuất Excel (.csv)</span>
        </button>
      </div>

      {/* Filter Bar with "Xem báo cáo" */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Chi nhánh:</span>
          <select
            value={filterBranchId}
            onChange={(e) => setFilterBranchId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700 font-medium"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Kỳ đối chiếu:</span>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700 font-medium"
          >
            <option value="2026-W43 (19/10 - 25/10/2026)">Tuần 43/2026 (19/10 - 25/10/2026)</option>
            <option value="2026-W44 (26/10 - 01/11/2026)">Tuần 44/2026 (26/10 - 01/11/2026)</option>
            <option value="Tháng 10/2026">Tháng 10/2026</option>
          </select>
        </div>

        <button
          onClick={() => {
            setHasViewed(true);
            showToast('Đã cập nhật bảng báo cáo theo bộ lọc.');
          }}
          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors shrink-0 ml-auto"
        >
          Xem báo cáo
        </button>
      </div>

      {/* --- CONTENT: TAB 1 (BÁO CÁO TỒN KHO) --- */}
      {tab === 'ton-kho' && (
        <div className="space-y-4">
          {/* 1 Visual Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              Cơ cấu giá trị tồn kho theo nhóm nguyên liệu
            </h3>

            {/* Simple Bar Breakdown */}
            <div className="space-y-3">
              {[
                { name: 'Cà phê hạt & Bột', value: 26725000, color: 'bg-emerald-800' },
                { name: 'Sữa & Chế phẩm sữa', value: 7850000, color: 'bg-emerald-600' },
                { name: 'Trà & Thảo mộc', value: 6080000, color: 'bg-teal-600' },
                { name: 'Bao bì & Ly tách', value: 3710000, color: 'bg-cyan-600' },
                { name: 'Syrup & Mứt', value: 2730000, color: 'bg-amber-600' },
              ].map((item, i) => {
                const total = 47095000;
                const percent = Math.round((item.value / total) * 100);

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.value.toLocaleString('vi-VN')} đ ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-28">Mã NVL</th>
                    <th className="py-3 px-4">Tên nguyên vật liệu</th>
                    <th className="py-3 px-4 text-center">ĐVT</th>
                    <th className="py-3 px-4 text-right">Tồn hiện tại</th>
                    <th className="py-3 px-4 text-right">Tồn an toàn</th>
                    <th className="py-3 px-4 text-right">Đơn giá chuẩn</th>
                    <th className="py-3 px-4 text-right">Tổng giá trị tồn</th>
                    <th className="py-3 px-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.map(mat => {
                    const stock = mat.stocks[filterBranchId] || 0;
                    const min = mat.minStocks[filterBranchId] || 0;
                    const totalVal = stock * mat.standardPrice;
                    const isLow = stock <= min && mat.status === 'active';

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{mat.code}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{mat.name}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{mat.unit}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{stock.toLocaleString('vi-VN')}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-500">{min.toLocaleString('vi-VN')}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{mat.standardPrice.toLocaleString('vi-VN')} đ</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-800">{totalVal.toLocaleString('vi-VN')} đ</td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Dưới định mức
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                              Đầy đủ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT: TAB 2 (BÁO CÁO HAO HỤT) --- */}
      {tab === 'hao-hut' && (
        <div className="space-y-4">
          {/* Missing data warning if sales or stocktake is absent */}
          {(isMissingSales || isMissingStocktake) ? (
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Không dựng số liệu giả định khi thiếu dữ liệu đầu vào</span>
              </div>
              <p className="leading-relaxed">
                Để lập báo cáo hao hụt và đối chiếu sổ sách vs thực tế chính xác, hệ thống yêu cầu đầy đủ <strong>Dữ liệu bán hàng (POS)</strong> và <strong>Kết quả kiểm kê thực tế</strong> của kỳ này.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {isMissingSales && (
                  <button
                    onClick={() => setCurrentNav('du-lieu-ban-hang')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    <span>Bổ sung Dữ liệu bán hàng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {isMissingStocktake && (
                  <button
                    onClick={() => {
                      setCurrentNav('kiem-ke');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    <span>Thực hiện Kiểm kê kỳ này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Summary Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  Tỷ lệ hao hụt nguyên vật liệu chính trong kỳ đối chiếu ({filterPeriod})
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Đối chiếu giữa Tồn sổ sách đầu kỳ + Nhập - Xuất - Tiêu hao bán hàng lý thuyết với Kiểm kê thực tế.
                </p>

                {/* Micro Bar Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Hao hụt Cà phê Robusta:</span>
                    <span className="text-base font-bold text-rose-700 mt-1 block">-2.0 kg (2.3%)</span>
                    <span className="text-[11px] text-slate-400">Định mức cho phép: 2.5%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Hao hụt Sữa tươi thanh trùng:</span>
                    <span className="text-base font-bold text-rose-700 mt-1 block">-1 hộp (2.0%)</span>
                    <span className="text-[11px] text-slate-400">Định mức cho phép: 1.5%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Các mặt hàng còn lại:</span>
                    <span className="text-base font-bold text-emerald-700 mt-1 block">Khớp 100%</span>
                    <span className="text-[11px] text-slate-400">Không có sai lệch</span>
                  </div>
                </div>
              </div>

              {/* Loss Details Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 w-28">Mã NVL</th>
                        <th className="py-3 px-4">Tên nguyên vật liệu</th>
                        <th className="py-3 px-4 text-center">ĐVT</th>
                        <th className="py-3 px-4 text-center">Tồn sổ sách</th>
                        <th className="py-3 px-4 text-center">Kiểm kê thực</th>
                        <th className="py-3 px-4 text-center">Chênh lệch</th>
                        <th className="py-3 px-4 text-right">Giá trị hao hụt</th>
                        <th className="py-3 px-4">Nguyên nhân xác định</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {branchStocktake?.items.map(item => {
                        const mat = materials.find(m => m.id === item.materialId);
                        const lossVal = item.difference * (mat?.standardPrice || 0);

                        return (
                          <tr key={item.materialId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{mat?.code}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{item.materialName}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{item.unit}</td>
                            <td className="py-3 px-4 text-center font-medium text-slate-700">{item.systemStock}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-900">{item.actualStock}</td>
                            <td className={`py-3 px-4 text-center font-bold ${
                              item.difference < 0 ? 'text-rose-700' : item.difference > 0 ? 'text-blue-700' : 'text-slate-400'
                            }`}>
                              {item.difference > 0 ? `+${item.difference}` : item.difference}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-rose-700">
                              {lossVal !== 0 ? `${lossVal.toLocaleString('vi-VN')} đ` : '0 đ'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-[11px]">
                              {item.differenceReason || (item.difference === 0 ? 'Khớp định mức' : 'Chưa có giải trình')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
