import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/mockData';
import { 
  Lock, 
  User as UserIcon, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Coffee, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { setCurrentUser, showToast } = useApp();
  const [username, setUsername] = useState('chucuahang');
  const [password, setPassword] = useState('123456');
  const [isDemoAccountsExpanded, setIsDemoAccountsExpanded] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEMO_USERS.find(u => u.username === username);
    if (!user) {
      showToast('Tài khoản không tồn tại trong hệ thống!', 'error');
      return;
    }
    if (password !== '123456') {
      showToast('Mật khẩu không chính xác! (Mật khẩu trải nghiệm là 123456)', 'error');
      return;
    }

    setCurrentUser(user);
    showToast(`Đăng nhập thành công! Chào mừng ${user.name} (${user.roleLabel}).`);
    onLoginSuccess();
  };

  const handleSelectDemoAccount = (accountUsername: string) => {
    setUsername(accountUsername);
    setPassword('123456');
    const user = DEMO_USERS.find(u => u.username === accountUsername);
    if (user) {
      setCurrentUser(user);
      showToast(`Đã chọn tài khoản: ${user.name} (${user.roleLabel})`);
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-stone-50 to-emerald-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Brand Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-linear-to-b from-white to-slate-50/50">
          <div className="w-18 h-18 rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 mx-auto mb-3 shadow-xs">
            <img
              src="/assets/aistudio/Logo_Tr_nh_2025-01_33bdceba.jpg"
              alt="Trình Cà Phê"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">TRÌNH CÀ PHÊ</h1>
          <p className="text-xs text-emerald-800 font-semibold mt-0.5">
            Hệ thống Quản lý Kho & Nguyên vật liệu
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 pt-6 space-y-5 text-xs">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="nhanvien, quanly, ketoan, chucuahang"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Collapsible Demo Accounts Section */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDemoAccountsExpanded(!isDemoAccountsExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-800 py-1"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Tài khoản trải nghiệm demo (Mật khẩu: 123456)
              </span>
              {isDemoAccountsExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isDemoAccountsExpanded && (
              <div className="mt-2 space-y-1.5 animate-in fade-in">
                {DEMO_USERS.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectDemoAccount(user.username)}
                    className="w-full p-2 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-emerald-900 text-xs">
                        @{user.username} — {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user.roleLabel} {user.role === 'chucuahang' && '• Toàn quyền & Duyệt'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Đăng nhập nhanh →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
