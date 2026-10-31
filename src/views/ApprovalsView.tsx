import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApprovalRequest, ApprovalType } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Building2, 
  User, 
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { 
    approvals, 
    activeTab, 
    setActiveTab, 
    approveRequest, 
    rejectRequest, 
    currentUser,
    showToast 
  } = useApp();

  const tab = activeTab || 'dieu-chinh-ton';

  // Selected approval for review
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  // Reject Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Approve note state
  const [approveNote, setApproveNote] = useState('');

  // Map tabs
  const tabTypeMap: Record<string, ApprovalType> = {
    'dieu-chinh-ton': 'stock_adjustment',
    'ke-hoach-nhap': 'import_plan',
    'cong-thuc': 'recipe_or_threshold',
  };

  const currentTabType: ApprovalType = tabTypeMap[tab] || 'stock_adjustment';

  // Filter approvals for current tab
  const filteredApprovals = approvals.filter(a => a.type === currentTabType);
  const pendingApprovals = filteredApprovals.filter(a => a.status === 'pending');
  const pastApprovals = filteredApprovals.filter(a => a.status !== 'pending');

  const handleApprove = () => {
    if (!selectedApproval) return;
    approveRequest(selectedApproval.id, approveNote || 'Đồng ý phê duyệt');
    setSelectedApproval(null);
    setApproveNote('');
  };

  const handleConfirmReject = () => {
    if (!selectedApproval) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối!', 'error');
      return;
    }
    rejectRequest(selectedApproval.id, rejectReason);
    setIsRejectModalOpen(false);
    setSelectedApproval(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-4">
      {/* 3-Tab Navigation Bar */}
      <div className="flex items-center gap-1 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setActiveTab('dieu-chinh-ton')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'dieu-chinh-ton' || currentTabType === 'stock_adjustment'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Điều chỉnh tồn kho</span>
          {approvals.filter(a => a.type === 'stock_adjustment' && a.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ke-hoach-nhap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'ke-hoach-nhap' || currentTabType === 'import_plan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Kế hoạch nhập hàng</span>
          {approvals.filter(a => a.type === 'import_plan' && a.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cong-thuc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'cong-thuc' || currentTabType === 'recipe_or_threshold'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Công thức và định mức</span>
          {approvals.filter(a => a.type === 'recipe_or_threshold' && a.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>
      </div>

      {/* Main Content: Pending List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): List of Requests */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col h-[650px]">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Danh sách đề xuất chờ duyệt ({pendingApprovals.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {pendingApprovals.map(appr => {
              const isSelected = selectedApproval?.id === appr.id;

              return (
                <div
                  key={appr.id}
                  onClick={() => setSelectedApproval(appr)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Chờ phê duyệt
                    </span>
                    <span className="text-[11px] text-slate-400">{appr.requestedAt.split(' ')[0]}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{appr.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{appr.details.summaryText}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{appr.branchName.split('—')[0]}</span>
                    <span>Bởi: <strong>{appr.requesterName}</strong></span>
                  </div>
                </div>
              );
            })}

            {pendingApprovals.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <span>Không có đề xuất nào đang chờ duyệt trong mục này.</span>
              </div>
            )}

            {/* Past reviewed section */}
            {pastApprovals.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Đã xử lý gần đây ({pastApprovals.length})
                </span>
                <div className="space-y-1.5 opacity-70">
                  {pastApprovals.slice(0, 3).map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedApproval(p)}
                      className="p-2.5 rounded-lg border border-slate-200 text-xs hover:opacity-100 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800 truncate pr-2">{p.title}</span>
                        {p.status === 'approved' ? (
                          <span className="text-emerald-700 font-bold text-[10px]">Đã duyệt</span>
                        ) : (
                          <span className="text-rose-700 font-bold text-[10px]">Từ chối</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Approval Detail & Actions */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between h-[650px]">
          {selectedApproval ? (
            <div className="space-y-5 overflow-y-auto pr-1">
              {/* Header */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {selectedApproval.branchName}
                  </span>
                  {selectedApproval.status === 'pending' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      Chờ duyệt
                    </span>
                  ) : selectedApproval.status === 'approved' ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Đã đồng ý duyệt
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                      Đã từ chối
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedApproval.title}</h2>
              </div>

              {/* Requester, Time, Reason */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Người đề xuất:</span>
                  <span className="font-bold text-slate-800">{selectedApproval.requesterName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Thời gian gửi:</span>
                  <span className="font-bold text-slate-800">{selectedApproval.requestedAt}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Lý do đề xuất:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedApproval.reason}</p>
                </div>
              </div>

              {/* COMPARISON TABLE: Hiện tại — Đề xuất */}
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Bảng đối chiếu nội dung: Hiện tại — Đề xuất
                </h3>

                {selectedApproval.type === 'stock_adjustment' && Array.isArray(selectedApproval.details.after) && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Tên nguyên vật liệu</th>
                          <th className="py-2.5 px-3 text-center">Tồn sổ sách (Hiện tại)</th>
                          <th className="py-2.5 px-3 text-center">Tồn thực đếm (Đề xuất)</th>
                          <th className="py-2.5 px-3 text-center">Chênh lệch điều chỉnh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedApproval.details.after.map((item: any, idx: number) => {
                          const currentItem = selectedApproval.details.before?.[idx];
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{item.materialName}</td>
                              <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                                {currentItem?.current ?? '—'} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                                {item.adjusted} {item.unit}
                              </td>
                              <td className={`py-2.5 px-3 text-center font-bold ${
                                item.diff < 0 ? 'text-rose-700' : 'text-blue-700'
                              }`}>
                                {item.diff > 0 ? `+${item.diff}` : item.diff} {item.unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedApproval.type === 'import_plan' && Array.isArray(selectedApproval.details.after) && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Nguyên liệu nhập</th>
                          <th className="py-2.5 px-3 text-center">Số lượng</th>
                          <th className="py-2.5 px-3 text-center">ĐVT</th>
                          <th className="py-2.5 px-3 text-right">Đơn giá</th>
                          <th className="py-2.5 px-3 text-right">Tổng thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedApproval.details.after.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{item.materialName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.total.toLocaleString('vi-VN')} đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedApproval.type === 'recipe_or_threshold' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 block mb-1">Hiện tại:</span>
                      <p className="text-slate-700">{selectedApproval.details.before || 'Chưa thiết lập'}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-1">Đề xuất mới:</span>
                      <p className="text-emerald-950 font-semibold">{selectedApproval.details.after}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Review notes if already reviewed */}
              {selectedApproval.reviewNote && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block">Ý kiến của Chủ cửa hàng:</span>
                  <p className="text-slate-600 mt-0.5">"{selectedApproval.reviewNote}"</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Bởi {selectedApproval.reviewedBy} lúc {selectedApproval.reviewedAt}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Chọn một đề xuất ở danh sách bên trái để kiểm tra chi tiết và phê duyệt.
            </div>
          )}

          {/* Action Buttons: Đồng ý & Từ chối */}
          {selectedApproval && selectedApproval.status === 'pending' && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                * Thao tác sẽ cập nhật dữ liệu liên quan vào hệ thống ngay lập tức.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Đồng ý phê duyệt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 text-rose-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Từ chối đề xuất
            </h3>
            <p className="text-slate-600 mb-3 leading-relaxed">
              Vui lòng nhập lý do từ chối đề xuất <strong>{selectedApproval.title}</strong> để thông báo đến người đề xuất:
            </p>

            <textarea
              rows={3}
              required
              placeholder="Ví dụ: Định lượng chưa phù hợp với giá bán; Kiểm đếm lại kho trước khi điều chỉnh..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-600 font-semibold"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
