import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Boxes, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  ReceiptText, 
  BarChart3, 
  ClipboardCheck, 
  FileCheck
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    activeBranchId, 
    branches, 
    materials, 
    importSlips, 
    exportSlips, 
    approvals, 
    setCurrentNav, 
    setActiveTab, 
    setViewDetailsId 
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';
  const isManager = currentUser.role === 'quanly';
  const isAccountant = currentUser.role === 'ketoan';
  const isStaff = currentUser.role === 'nhanvien';

  // Compute key metrics based on activeBranchId
  const getBranchStock = (mat: typeof materials[0]) => {
    if (activeBranchId === 'all') {
      return Object.values(mat.stocks).reduce((sum, s) => sum + (s || 0), 0);
    }
    return mat.stocks[activeBranchId] || 0;
  };

  const getBranchMinStock = (mat: typeof materials[0]) => {
    if (activeBranchId === 'all') {
      return Object.values(mat.minStocks).reduce((sum, s) => sum + (s || 0), 0);
    }
    return mat.minStocks[activeBranchId] || 0;
  };

  // Low stock materials
  const lowStockMaterials = materials.filter(m => {
    const stock = getBranchStock(m);
    const min = getBranchMinStock(m);
    return stock <= min && m.status === 'active';
  });

  // Pending actions
  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const awaitingDeliveryImports = importSlips.filter(s => 
    s.status === 'approved' && (activeBranchId === 'all' || s.branchId === activeBranchId)
  );
  const awaitingExportConfirmations = exportSlips.filter(s => 
    s.status === 'pending_confirmation' && (activeBranchId === 'all' || s.branchId === activeBranchId)
  );

  // Total inventory estimated value
  const totalStockValue = materials.reduce((acc, m) => {
    return acc + (getBranchStock(m) * m.standardPrice);
  }, 0);

  return (
    <div className="space-y-6">
      {/* 3-4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {isAccountant ? 'Doanh thu ghi nhận gần nhất' : 'Giá trị tồn kho ước tính'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900">
            {isAccountant ? '68,450,000 đ' : `${totalStockValue.toLocaleString('vi-VN')} đ`}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {activeBranchId === 'all' ? 'Tổng 3 chi nhánh' : branches.find(b => b.id === activeBranchId)?.name}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cảnh báo tồn dưới mức an toàn</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockMaterials.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900 flex items-baseline gap-2">
            <span>{lowStockMaterials.length}</span>
            <span className="text-xs font-normal text-slate-500">nguyên vật liệu</span>
          </div>
          <div className="mt-1 text-xs text-amber-700 font-medium">
            {lowStockMaterials.length > 0 ? 'Cần lập kế hoạch bổ sung' : 'Tồn kho đảm bảo an toàn'}
          </div>
        </div>

        {/* Metric 3: Depends on Role */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {isOwner ? 'Yêu cầu chờ phê duyệt' : isStaff ? 'Đơn hàng chờ kiểm nhận' : 'Phiếu nhập chờ giao hàng'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900">
            {isOwner ? pendingApprovals.length : awaitingDeliveryImports.length}
          </div>
          <div className="mt-1 text-xs text-blue-700 font-medium">
            {isOwner ? 'Cần Chủ xem xét duyệt' : 'Sẵn sàng kiểm nhận hàng'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Phiếu xuất chờ thực xuất</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900">
            {awaitingExportConfirmations.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Cấp quầy & luân chuyển nội bộ
          </div>
        </div>
      </div>

      {/* Main Action-Needed Section & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Action-Needed Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Nhiệm vụ cần xử lý ngay</h2>
              <p className="text-xs text-slate-500">Các hạng mục yêu cầu sự can thiệp của bạn trong phiên làm việc</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800">
              {isOwner ? pendingApprovals.length + awaitingExportConfirmations.length : awaitingDeliveryImports.length + awaitingExportConfirmations.length} việc
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {/* Owner Approvals Queue */}
            {isOwner && pendingApprovals.length > 0 && (
              pendingApprovals.map(appr => (
                <div key={appr.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors rounded-lg px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {appr.type === 'stock_adjustment' ? 'Điều chỉnh tồn' : appr.type === 'import_plan' ? 'Kế hoạch nhập' : 'Công thức/định mức'}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{appr.title}</span>
                    </div>
                    <p className="text-xs text-slate-500">{appr.branchName} • Đề xuất bởi {appr.requesterName} ({appr.requestedAt})</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentNav('phe-duyet');
                      setActiveTab(
                        appr.type === 'stock_adjustment' ? 'dieu-chinh-ton' :
                        appr.type === 'import_plan' ? 'ke-hoach-nhap' : 'cong-thuc'
                      );
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    <span>Xem duyệt</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}

            {/* Awaiting Delivery Imports (for Staff, Manager, Owner) */}
            {awaitingDeliveryImports.map(slip => (
              <div key={slip.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors rounded-lg px-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Chờ nhận hàng
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{slip.code} — {slip.supplier}</span>
                  </div>
                  <p className="text-xs text-slate-500">{slip.branchName} • Dự kiến nhận: {slip.expectedDate} • Trị giá: {slip.totalAmount.toLocaleString('vi-VN')} đ</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentNav('nhap-kho');
                    setViewDetailsId(slip.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-medium transition-colors shrink-0"
                >
                  <span>Kiểm nhận</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Awaiting Export Confirmations */}
            {awaitingExportConfirmations.map(slip => (
              <div key={slip.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors rounded-lg px-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                      Chờ thực xuất
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{slip.code} — {slip.reason}</span>
                  </div>
                  <p className="text-xs text-slate-500">{slip.branchName} • Người tạo: {slip.creatorName}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentNav('xuat-kho');
                    setViewDetailsId(slip.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-600 text-orange-800 hover:bg-orange-50 text-xs font-medium transition-colors shrink-0"
                >
                  <span>Xác nhận xuất</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {pendingApprovals.length === 0 && awaitingDeliveryImports.length === 0 && awaitingExportConfirmations.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <span>Không có việc tồn đọng. Tất cả quy trình đang hoạt động bình thường!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Shortcuts (Theo vai trò) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Lối tắt thao tác nhanh</h2>
            <div className="mt-3 space-y-2">
              {(isOwner || isManager) && (
                <>
                  <button
                    onClick={() => {
                      setCurrentNav('nhap-kho');
                      setViewDetailsId('new');
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowDownToLine className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">Lập kế hoạch nhập hàng</div>
                        <div className="text-[11px] text-slate-400">Tạo phiếu nhập trình duyệt</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentNav('xuat-kho');
                      setViewDetailsId('new');
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpFromLine className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">Tạo phiếu xuất cấp quầy</div>
                        <div className="text-[11px] text-slate-400">Luân chuyển nội bộ kho - quầy</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                  </button>
                </>
              )}

              {(isOwner || isStaff || isManager) && (
                <button
                  onClick={() => {
                    setCurrentNav('kiem-ke');
                    setViewDetailsId('new');
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">Kiểm kê thực tế</div>
                      <div className="text-[11px] text-slate-400">Ghi nhận số lượng đếm tại kho</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                </button>
              )}

              {(isOwner || isAccountant) && (
                <>
                  <button
                    onClick={() => setCurrentNav('du-lieu-ban-hang')}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ReceiptText className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">Nhập dữ liệu bán hàng POS</div>
                        <div className="text-[11px] text-slate-400">Quy trình 3 bước từ Excel</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentNav('bao-cao');
                      setActiveTab('hao-hut');
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">Báo cáo đối chiếu hao hụt</div>
                        <div className="text-[11px] text-slate-400">Sổ sách vs Thực tế vs Tiêu hao</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Low Stock Warning Mini-list */}
          {lowStockMaterials.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Cần nhập thêm:
              </div>
              <div className="space-y-1">
                {lowStockMaterials.slice(0, 2).map(m => (
                  <div key={m.id} className="text-[11px] text-slate-600 flex justify-between bg-amber-50/60 px-2 py-1 rounded">
                    <span className="truncate pr-1">{m.name}</span>
                    <span className="font-semibold text-amber-800 whitespace-nowrap">
                      {getBranchStock(m)} / tối thiểu {getBranchMinStock(m)} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
