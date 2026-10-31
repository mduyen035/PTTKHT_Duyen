import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ClipboardCheck, 
  ChefHat, 
  ReceiptText, 
  BarChart3, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    currentNav, 
    setCurrentNav, 
    setActiveTab, 
    setViewDetailsId, 
    approvals 
  } = useApp();

  const [isWarehouseExpanded, setIsWarehouseExpanded] = useState(true);

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  const handleNavClick = (navId: string, defaultTab: string = '') => {
    setCurrentNav(navId);
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
    setViewDetailsId(null);
  };

  const isWarehouseActive = ['nguyen-vat-lieu', 'nhap-kho', 'xuat-kho', 'kiem-ke'].includes(currentNav);

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200/80 bg-white flex items-center justify-center p-0.5 shrink-0 shadow-xs">
          <img
            src="/assets/aistudio/Logo_Tr_nh_2025-01_33bdceba.jpg"
            alt="Trình Cà Phê"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1">
            <span>TRÌNH CÀ PHÊ</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium truncate">Kho & Nguyên vật liệu</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* 1. Tổng quan (Chủ, Quản lý, Kế toán) */}
        {['chucuahang', 'quanly', 'ketoan'].includes(currentUser.role) && (
          <button
            onClick={() => handleNavClick('tong-quan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentNav === 'tong-quan'
                ? 'bg-emerald-800 text-white shadow-xs shadow-emerald-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Tổng quan</span>
          </button>
        )}

        {/* 2. Kho hàng (Nhóm mẹ có collapsible) */}
        {/* Chủ, Quản lý: full 4 mục. Nhân viên: Nhập kho, Xuất kho, Kiểm kê */}
        {['chucuahang', 'quanly', 'nhanvien'].includes(currentUser.role) && (
          <div className="pt-1">
            <button
              onClick={() => setIsWarehouseExpanded(!isWarehouseExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isWarehouseActive
                  ? 'text-emerald-900 font-bold bg-emerald-50/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>Kho hàng</span>
              </div>
              {isWarehouseExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isWarehouseExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-200/80 space-y-0.5">
                {/* Nguyên vật liệu (Chủ, Quản lý) */}
                {['chucuahang', 'quanly'].includes(currentUser.role) && (
                  <button
                    onClick={() => handleNavClick('nguyen-vat-lieu')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentNav === 'nguyen-vat-lieu'
                        ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    <span>Nguyên vật liệu</span>
                  </button>
                )}

                {/* Nhập kho (Chủ, Quản lý, Nhân viên) */}
                <button
                  onClick={() => handleNavClick('nhap-kho')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentNav === 'nhap-kho'
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 shrink-0" />
                  <span>Nhập kho</span>
                </button>

                {/* Xuất kho (Chủ, Quản lý, Nhân viên) */}
                <button
                  onClick={() => handleNavClick('xuat-kho')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentNav === 'xuat-kho'
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất kho</span>
                </button>

                {/* Kiểm kê (Chủ, Quản lý, Nhân viên) */}
                <button
                  onClick={() => handleNavClick('kiem-ke')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentNav === 'kiem-ke'
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Kiểm kê</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Công thức và định mức (Chủ, Quản lý) */}
        {['chucuahang', 'quanly'].includes(currentUser.role) && (
          <button
            onClick={() => handleNavClick('cong-thuc-dinh-muc', 'cong-thuc')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentNav === 'cong-thuc-dinh-muc'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ChefHat className="w-4 h-4 shrink-0" />
            <span>Công thức & Định mức</span>
          </button>
        )}

        {/* 4. Dữ liệu bán hàng (Chủ, Kế toán) */}
        {['chucuahang', 'ketoan'].includes(currentUser.role) && (
          <button
            onClick={() => handleNavClick('du-lieu-ban-hang')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentNav === 'du-lieu-ban-hang'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ReceiptText className="w-4 h-4 shrink-0" />
            <span>Dữ liệu bán hàng</span>
          </button>
        )}

        {/* 5. Báo cáo (Chủ, Kế toán) */}
        {['chucuahang', 'ketoan'].includes(currentUser.role) && (
          <button
            onClick={() => handleNavClick('bao-cao', 'ton-kho')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentNav === 'bao-cao'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Báo cáo</span>
          </button>
        )}

        {/* 6. Phê duyệt (Duy nhất Chủ cửa hàng) */}
        {currentUser.role === 'chucuahang' && (
          <button
            onClick={() => handleNavClick('phe-duyet', 'dieu-chinh-ton')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              currentNav === 'phe-duyet'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Phê duyệt</span>
            </div>
            {pendingApprovalsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentNav === 'phe-duyet' ? 'bg-white text-emerald-900' : 'bg-amber-500 text-white'
              }`}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Role and System Identity Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-emerald-700 truncate">{currentUser.roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
