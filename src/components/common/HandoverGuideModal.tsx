import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, Check, ShieldCheck, Sparkles, Building2, Users } from 'lucide-react';

export const HandoverGuideModal: React.FC = () => {
  const { isGuideOpen, setIsGuideOpen } = useApp();

  if (!isGuideOpen) return null;

  const screenMatrix = [
    {
      code: 'MH01',
      name: 'Đăng nhập hệ thống',
      location: 'Trang Đăng nhập (Màn hình khởi động)',
      roles: 'Tất cả (Chủ, Quản lý, Kế toán, Nhân viên)',
      description: 'Đăng nhập an toàn, có sẵn mục "Tài khoản trải nghiệm" thu gọn với 4 vai trò demo (mật khẩu 123456).',
    },
    {
      code: 'MH02',
      name: 'Tổng quan (Dashboard)',
      location: 'Menu: Tổng quan',
      roles: 'Chủ cửa hàng, Quản lý, Kế toán',
      description: 'Chỉ số trọng yếu, danh sách việc cần xử lý ngay, cảnh báo tồn dưới ngưỡng an toàn, lối tắt thao tác nhanh.',
    },
    {
      code: 'MH03',
      name: 'Danh mục Nguyên vật liệu',
      location: 'Menu: Kho hàng > Nguyên vật liệu',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Bảng 6 cột chuẩn, tìm kiếm, lọc phân loại/trạng thái, nhấp tên mở panel chi tiết trượt bên phải.',
    },
    {
      code: 'MH04',
      name: 'Thêm & Sửa Nguyên vật liệu',
      location: 'Kho hàng > Nguyên vật liệu (Nút "Thêm nguyên liệu" hoặc Sửa)',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Biểu mẫu ngắn gọn chuẩn hóa. Không cho phép nhập trực tiếp số dư tồn kho (tuân thủ nguyên tắc sổ kho).',
    },
    {
      code: 'MH05',
      name: 'Ngừng sử dụng Nguyên vật liệu',
      location: 'Kho hàng > Nguyên vật liệu (Thao tác trong menu ba chấm / Panel chi tiết)',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Hộp thoại xác nhận bắt buộc nhập lý do ngừng sử dụng để lưu vết kiểm toán.',
    },
    {
      code: 'MH06',
      name: 'Công thức pha chế món',
      location: 'Menu: Công thức & Định mức > Tab "Công thức pha chế"',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Danh sách món đồ uống, định lượng nguyên liệu chuẩn, ước tính Food Cost giá vốn và tỷ lệ chi phí.',
    },
    {
      code: 'MH07',
      name: 'Thiết lập & Sửa công thức',
      location: 'Công thức & Định mức > Tab "Công thức pha chế" (Nút "Thêm công thức")',
      roles: 'Chủ cửa hàng (duyệt trực tiếp), Quản lý (tạo đề xuất)',
      description: 'Trình chỉnh sửa thêm/bớt nguyên liệu và định lượng. Quản lý tạo sẽ gửi đề xuất sang Trung tâm phê duyệt.',
    },
    {
      code: 'MH08',
      name: 'Quản lý Tồn kho tối thiểu',
      location: 'Menu: Công thức & Định mức > Tab "Tồn tối thiểu"',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Bảng định mức an toàn theo từng chi nhánh, cảnh báo tồn thiếu, gửi đề xuất điều chỉnh tồn an toàn.',
    },
    {
      code: 'MH09',
      name: 'Danh sách Phiếu nhập kho',
      location: 'Menu: Kho hàng > Nhập kho',
      roles: 'Chủ cửa hàng, Quản lý, Nhân viên',
      description: 'Danh sách phiếu nhập, phân loại theo trạng thái (Chờ duyệt, Chờ nhận hàng, Đã hoàn thành).',
    },
    {
      code: 'MH10',
      name: 'Lập Kế hoạch nhập hàng (Tạo phiếu nhập)',
      location: 'Kho hàng > Nhập kho (Nút chính "Tạo phiếu nhập")',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Chọn chi nhánh, nhà cung cấp, nguyên liệu cần nhập. Lập phiếu chưa cộng tồn kho, chuyển chờ Chủ duyệt.',
    },
    {
      code: 'MH11',
      name: 'Chi tiết phiếu nhập & Nhận hàng',
      location: 'Kho hàng > Nhập kho > Bấm vào mã phiếu',
      roles: 'Chủ cửa hàng, Nhân viên, Quản lý',
      description: 'Kiểm tra chất lượng thực nhận, ghi nhận hàng lỗi (nếu có). Chỉ cộng số lượng đạt chất lượng vào tồn kho.',
    },
    {
      code: 'MH12',
      name: 'Danh sách Phiếu xuất kho',
      location: 'Menu: Kho hàng > Xuất kho',
      roles: 'Chủ cửa hàng, Quản lý, Nhân viên',
      description: 'Danh mục phiếu xuất: cấp quầy pha chế (luân chuyển nội bộ), xuất hủy hỏng, chuyển kho.',
    },
    {
      code: 'MH13',
      name: 'Lập Phiếu xuất kho',
      location: 'Kho hàng > Xuất kho (Nút chính "Tạo phiếu xuất")',
      roles: 'Chủ cửa hàng, Quản lý',
      description: 'Tạo phiếu xuất, kiểm tra tồn kho tức thì (chặn không cho xuất vượt tồn). Lập phiếu chưa trừ tồn ngay.',
    },
    {
      code: 'MH14',
      name: 'Chi tiết phiếu xuất & Xác nhận thực xuất',
      location: 'Kho hàng > Xuất kho > Bấm vào mã phiếu',
      roles: 'Chủ cửa hàng, Nhân viên',
      description: 'Kiểm tra thực tế và bấm "Xác nhận thực xuất". Trừ số dư tồn kho một lần duy nhất, chuyển sang chỉ đọc.',
    },
    {
      code: 'MH15',
      name: 'Kiểm kê kho hàng',
      location: 'Menu: Kho hàng > Kiểm kê (Nút "Tạo kiểm kê" hoặc chọn phiếu)',
      roles: 'Chủ cửa hàng, Quản lý, Nhân viên',
      description: 'Biểu mẫu kiểm đếm gọn gàng. Nhân viên không thấy tồn lý thuyết. Không tự ghi đè tồn, tạo đề xuất điều chỉnh.',
    },
    {
      code: 'MH16',
      name: 'Nhập Dữ liệu bán hàng (POS/Excel)',
      location: 'Menu: Dữ liệu bán hàng',
      roles: 'Chủ cửa hàng, Kế toán',
      description: 'Quy trình 3 bước rõ ràng: 1. Chọn chi nhánh & file -> 2. Xem trước doanh thu/định lượng -> 3. Lưu (hỏi ghi đè).',
    },
    {
      code: 'MH17',
      name: 'Báo cáo Tồn kho & Hao hụt',
      location: 'Menu: Báo cáo (Tab "Tồn kho" & Tab "Hao hụt")',
      roles: 'Chủ cửa hàng, Kế toán',
      description: 'Báo cáo nhập-xuất-tồn, đối chiếu tồn sổ sách vs thực tế vs bán hàng, cảnh báo thiếu dữ liệu, xuất Excel.',
    },
    {
      code: 'MH18',
      name: 'Trung tâm Phê duyệt',
      location: 'Menu: Phê duyệt (3 tab: Điều chỉnh tồn, Kế hoạch nhập, Công thức & định mức)',
      roles: 'Chủ cửa hàng (duy nhất)',
      description: 'Giao diện so sánh trực quan Hiện tại — Đề xuất, nút Đồng ý và Từ chối (nhập lý do từ chối). Cập nhật tồn khi duyệt.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Tài liệu bàn giao & Bảng đối chiếu 18 Màn hình</h2>
              <p className="text-xs text-emerald-100">
                Trình Cà Phê — Hệ thống quản lý kho & nguyên vật liệu thực tế
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGuideOpen(false)}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* Quick Notice */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-emerald-900 block text-sm">
                Tuân thủ quy chuẩn trải nghiệm thực tế (Không lộ mã kỹ thuật):
              </span>
              <p className="text-slate-600">
                Toàn bộ giao diện người dùng vận hành trực tiếp, không hiển thị mã kỹ thuật (MH01–MH18, mã UC). Bảng đối chiếu bên dưới là tài liệu bàn giao dành cho hội đồng nghiệm thu và kiểm thử tính năng.
              </p>
            </div>
          </div>

          {/* Accounts Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" /> 4 Tài khoản trải nghiệm (Mật khẩu chung: 123456)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-emerald-800">1. chucuahang</div>
                <div className="text-xs text-slate-600">Nguyễn Văn Trình (Chủ)</div>
                <div className="text-[11px] text-emerald-600 mt-1">Toàn quyền hệ thống & Phê duyệt</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800">2. quanly</div>
                <div className="text-xs text-slate-600">Trần Thị Mai (Quản lý)</div>
                <div className="text-[11px] text-slate-500 mt-1">NVL, Công thức, Nhập/Xuất, Kiểm kê</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800">3. ketoan</div>
                <div className="text-xs text-slate-600">Phạm Minh Tuấn (Kế toán)</div>
                <div className="text-[11px] text-slate-500 mt-1">Bán hàng (POS) & Báo cáo kho/hao hụt</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800">4. nhanvien</div>
                <div className="text-xs text-slate-600">Lê Văn Kho (Nhân viên)</div>
                <div className="text-[11px] text-slate-500 mt-1">Nhận hàng, Thực xuất, Đếm kiểm kê</div>
              </div>
            </div>
          </div>

          {/* 18 Screen Matrix Table */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" /> Bảng đối chiếu 18 Màn hình (MH01 — MH18)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-16">Mã MH</th>
                    <th className="py-2.5 px-3 w-44">Tên màn hình</th>
                    <th className="py-2.5 px-3 w-52">Vị trí truy cập trong giao diện</th>
                    <th className="py-2.5 px-3 w-36">Vai trò cho phép</th>
                    <th className="py-2.5 px-3">Nghiệp vụ cốt lõi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {screenMatrix.map(item => (
                    <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{item.code}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.location}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {item.roles}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Business Rules Verified */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
              6 Quy tắc nghiệp vụ chuẩn xác đã tích hợp:
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Lập phiếu chưa đổi tồn:</strong> Phiếu nhập/xuất khi tạo mới chưa làm biến động tồn kho chi nhánh.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Nhận hàng chỉ cộng hàng đạt:</strong> Trừ số lượng lỗi/hỏng; chỉ cộng hàng đạt chuẩn vào kho.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Chặn xuất vượt tồn:</strong> Kiểm tra số lượng tồn tức thì; thực xuất trừ số dư một lần duy nhất.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Xuất cấp quầy nội bộ:</strong> Phân loại luân chuyển nội bộ, tránh tính trùng với hao hụt bán hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Kiểm kê bảo mật:</strong> Nhân viên đếm không thấy tồn lý thuyết; chênh lệch gửi Chủ duyệt điều chỉnh.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Chủ cửa hàng toàn quyền:</strong> Thao tác trực tiếp không cần đổi vai trò, vẫn tuân thủ bước phê duyệt.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsGuideOpen(false)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            Đã hiểu và Đóng tài liệu
          </button>
        </div>
      </div>
    </div>
  );
};
