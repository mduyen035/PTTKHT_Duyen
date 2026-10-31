import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';
import { 
  Building2, ChevronDown, UserCheck, LogOut, 
  BookOpen, RotateCcw, Shield, Check
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    branches, 
    activeBranchId, 
    setActiveBranchId, 
    setIsGuideOpen,
    resetAllData,
    showToast,
    setCurrentNav,
    logout
  } = useApp();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isOwner = currentUser.role === 'chucuahang';

  const handleBranchSelect = (id: string) => {
    setActiveBranchId(id);
    setIsBranchDropdownOpen(false);
    const bName = id === 'all' ? 'Toàn chuỗi (Tất cả chi nhánh)' : branches.find(b => b.id === id)?.name;
    showToast(`Đã chuyển không gian làm việc sang: ${bName}`);
  };

  const handleRoleSwitch = (username: string) => {
    const user = DEMO_USERS.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      setIsUserDropdownOpen(false);
      showToast(`Đã chuyển sang tài khoản: ${user.name} (${user.roleLabel})`, 'info');
      // Reset view details if open
      setCurrentNav('tong-quan');
    }
  };

  const handleLogout = () => {
    setIsUserDropdownOpen(false);
    logout();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Page Title & Clear Context */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        <p className="text-xs text-slate-500 font-normal truncate max-w-xl">{subtitle}</p>
      </div>

      {/* Right Controls: Branch, Guide, User */}
      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Chọn chi nhánh làm việc"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="max-w-[190px] truncate">
              {activeBranchId === 'all' 
                ? 'Toàn chuỗi (Tổng hợp)' 
                : (branches.find(b => b.id === activeBranchId)?.name || 'Chọn chi nhánh')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chi nhánh làm việc
              </div>

              {isOwner && (
                <button
                  onClick={() => handleBranchSelect('all')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    activeBranchId === 'all' ? 'text-emerald-800 font-bold bg-emerald-50/70' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Toàn chuỗi (Xem tổng hợp 3 chi nhánh)
                  </span>
                  {activeBranchId === 'all' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              )}

              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    activeBranchId === branch.id ? 'text-emerald-800 font-bold bg-emerald-50/70' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate pr-2">{branch.name}</span>
                  {activeBranchId === branch.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              ))}

              {!isOwner && (
                <div className="px-3 py-1.5 text-[11px] text-amber-700 bg-amber-50 mx-2 my-1 rounded">
                  * Tài khoản {currentUser.roleLabel} thao tác theo chi nhánh được phân công.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Handover Guide & Screen Matrix Modal Trigger */}
        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 text-xs font-medium transition-colors"
          title="Bảng đối chiếu 18 màn hình & Hướng dẫn bàn giao"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Tài liệu bàn giao & 18 MH</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetAllData}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Khôi phục dữ liệu mẫu ban đầu"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile & Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-700 font-medium">{currentUser.roleLabel}</div>
            </div>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-emerald-700">{currentUser.roleLabel}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Tài khoản: @{currentUser.username}</div>
              </div>

              {/* Demo role switch section */}
              <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" /> Trải nghiệm vai trò khác
              </div>

              <div className="px-2 py-1 space-y-0.5">
                {DEMO_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleRoleSwitch(user.username)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      currentUser.username === user.username ? 'bg-emerald-50/80 font-bold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.roleLabel}</div>
                    </div>
                    {currentUser.username === user.username && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-2 pt-1 px-2 space-y-0.5">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:text-emerald-800 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Xem ma trận 18 màn hình & quyền hạn
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Direct Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/60 text-xs font-medium transition-colors"
          title="Đăng xuất về màn hình đăng nhập"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
