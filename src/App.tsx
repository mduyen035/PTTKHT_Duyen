/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { HandoverGuideModal } from './components/common/HandoverGuideModal';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MaterialsView } from './views/MaterialsView';
import { RecipesAndThresholdsView } from './views/RecipesAndThresholdsView';
import { ImportSlipsView } from './views/ImportSlipsView';
import { ExportSlipsView } from './views/ExportSlipsView';
import { StocktakeView } from './views/StocktakeView';
import { SalesDataView } from './views/SalesDataView';
import { ReportsView } from './views/ReportsView';
import { ApprovalsView } from './views/ApprovalsView';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentNav, setCurrentNav, currentUser, isAuthenticated, setIsAuthenticated } = useApp();

  // Dynamic header titles
  const getHeaderMeta = () => {
    switch (currentNav) {
      case 'tong-quan':
        return {
          title: 'Tổng quan hoạt động',
          subtitle: 'Theo dõi chỉ số tồn kho, cảnh báo an toàn và danh sách việc cần xử lý',
        };
      case 'nguyen-vat-lieu':
        return {
          title: 'Nguyên vật liệu',
          subtitle: 'Quản lý thông tin, danh mục, đơn vị tính và tình trạng sử dụng nguyên liệu',
        };
      case 'nhap-kho':
        return {
          title: 'Quản lý Nhập kho',
          subtitle: 'Lập kế hoạch mua hàng, kiểm tra chất lượng và nhận hàng vào kho',
        };
      case 'xuat-kho':
        return {
          title: 'Quản lý Xuất kho',
          subtitle: 'Xuất cấp quầy pha chế (luân chuyển nội bộ), xuất hủy hỏng và xác nhận thực xuất',
        };
      case 'kiem-ke':
        return {
          title: 'Kiểm kê kho thực tế',
          subtitle: 'Kiểm đếm số lượng thực tế tại kho, đối chiếu chênh lệch sổ sách',
        };
      case 'cong-thuc-dinh-muc':
        return {
          title: 'Công thức & Định mức',
          subtitle: 'Quản lý công thức pha chế món đồ uống, tỷ lệ Food Cost và định mức tồn an toàn',
        };
      case 'du-lieu-ban-hang':
        return {
          title: 'Dữ liệu bán hàng (POS)',
          subtitle: 'Quy trình 3 bước nhập dữ liệu món bán từ máy POS để tính tiêu hao lý thuyết',
        };
      case 'bao-cao':
        return {
          title: 'Báo cáo Kho & Hao hụt',
          subtitle: 'Báo cáo tổng hợp tồn kho và đối chiếu hao hụt thực tế vs công thức',
        };
      case 'phe-duyet':
        return {
          title: 'Trung tâm Phê duyệt',
          subtitle: 'Dành riêng cho Chủ cửa hàng: phê duyệt điều chỉnh tồn, kế hoạch nhập và công thức',
        };
      default:
        return {
          title: 'Trình Cà Phê',
          subtitle: 'Hệ thống Quản lý Kho & Nguyên vật liệu',
        };
    }
  };

  // Role Access Enforcement
  const isNavAllowedForRole = () => {
    const role = currentUser.role;
    if (role === 'chucuahang') return true;

    if (role === 'nhanvien') {
      return ['nhap-kho', 'xuat-kho', 'kiem-ke'].includes(currentNav);
    }
    if (role === 'quanly') {
      return ['tong-quan', 'nguyen-vat-lieu', 'nhap-kho', 'xuat-kho', 'kiem-ke', 'cong-thuc-dinh-muc'].includes(currentNav);
    }
    if (role === 'ketoan') {
      return ['tong-quan', 'du-lieu-ban-hang', 'bao-cao'].includes(currentNav);
    }
    return false;
  };

  // Automatically switch away from unauthorized views when role switches
  useEffect(() => {
    if (!isNavAllowedForRole()) {
      if (currentUser.role === 'nhanvien') {
        setCurrentNav('nhap-kho');
      } else {
        setCurrentNav('tong-quan');
      }
    }
  }, [currentUser.role]);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const headerMeta = getHeaderMeta();
  const hasAccess = isNavAllowedForRole();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header title={headerMeta.title} subtitle={headerMeta.subtitle} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          {!hasAccess ? (
            <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center max-w-lg mx-auto mt-12 space-y-3 shadow-xs">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Truy cập bị giới hạn</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tài khoản <strong>{currentUser.name}</strong> với vai trò <strong>{currentUser.roleLabel}</strong> không có quyền truy cập màn hình này.
              </p>
              <button
                onClick={() => setCurrentNav(currentUser.role === 'nhanvien' ? 'nhap-kho' : 'tong-quan')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Về khu vực cho phép
              </button>
            </div>
          ) : (
            <>
              {currentNav === 'tong-quan' && <DashboardView />}
              {currentNav === 'nguyen-vat-lieu' && <MaterialsView />}
              {currentNav === 'nhap-kho' && <ImportSlipsView />}
              {currentNav === 'xuat-kho' && <ExportSlipsView />}
              {currentNav === 'kiem-ke' && <StocktakeView />}
              {currentNav === 'cong-thuc-dinh-muc' && <RecipesAndThresholdsView />}
              {currentNav === 'du-lieu-ban-hang' && <SalesDataView />}
              {currentNav === 'bao-cao' && <ReportsView />}
              {currentNav === 'phe-duyet' && <ApprovalsView />}
            </>
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Handover Guide & 18 Screen Matrix Modal */}
      <HandoverGuideModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
