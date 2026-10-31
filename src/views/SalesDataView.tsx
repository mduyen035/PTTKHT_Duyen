import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Database, 
  CheckCircle, 
  Building2, 
  Calendar, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SalesDataView: React.FC = () => {
  const { 
    branches, 
    activeBranchId, 
    recipes, 
    materials, 
    salesRecords, 
    importSalesData, 
    showToast 
  } = useApp();

  // 3 Clear Steps: 1 -> 2 -> 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [period, setPeriod] = useState<string>('2026-W44 (26/10 - 01/11/2026)');
  const [fileName, setFileName] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<{ recipeId: string; quantity: number }[]>([]);

  // Overwrite Confirmation Modal
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

  // Sample data filler
  const handleUseSampleData = () => {
    setFileName('Trinh_POS_Export_2026_W44.xlsx');
    // Preload realistic quantities
    setParsedItems([
      { recipeId: recipes[0]?.id || 'rec-1', quantity: 920 }, // Cà phê sữa đá
      { recipeId: recipes[1]?.id || 'rec-2', quantity: 480 }, // Bạc xỉu
      { recipeId: recipes[2]?.id || 'rec-3', quantity: 390 }, // Đen đá
      { recipeId: recipes[3]?.id || 'rec-4', quantity: 210 }, // Latte
      { recipeId: recipes[4]?.id || 'rec-5', quantity: 85 },  // Trà Ô long
    ]);
    showToast('Đã nạp bộ dữ liệu bán hàng POS mẫu (7 ngày gần nhất)!', 'info');
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Ma_Mon,Ten_Mon,So_Luong_Ban,Don_Gia_Ban\n' +
      recipes.map(r => `${r.code},"${r.name}",100,${r.price}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Mau_Du_Lieu_Ban_Hang_Trinh_Ca_Phe.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file mẫu Excel / CSV chuẩn.');
  };

  const handleProceedToPreview = () => {
    if (parsedItems.length === 0) {
      showToast('Vui lòng chọn file dữ liệu bán hàng hoặc bấm "Dùng dữ liệu mẫu"!', 'error');
      return;
    }
    setCurrentStep(2);
  };

  const handleConfirmSave = (overwrite: boolean = false) => {
    const success = importSalesData(period, selectedBranchId, parsedItems, overwrite);
    if (!success) {
      // Conflict exists, show overwrite modal
      setIsOverwriteModalOpen(true);
    } else {
      setIsOverwriteModalOpen(false);
      setCurrentStep(3);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFileName('');
    setParsedItems([]);
  };

  // Calculations for preview
  const totalRevenue = parsedItems.reduce((sum, item) => {
    const rec = recipes.find(r => r.id === item.recipeId);
    return sum + (rec ? rec.price * item.quantity : 0);
  }, 0);

  const totalCups = parsedItems.reduce((sum, i) => sum + i.quantity, 0);

  // Ingredient Deductions preview
  const ingredientDeductions: Record<string, { name: string; unit: string; totalQty: number }> = {};
  parsedItems.forEach(item => {
    const rec = recipes.find(r => r.id === item.recipeId);
    if (rec) {
      rec.ingredients.forEach(ing => {
        if (!ingredientDeductions[ing.materialId]) {
          ingredientDeductions[ing.materialId] = {
            name: ing.materialName,
            unit: ing.unit,
            totalQty: 0,
          };
        }
        ingredientDeductions[ing.materialId].totalQty += ing.quantity * item.quantity;
      });
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 3-Step Indicator Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
            currentStep === 1 ? 'bg-emerald-800 text-white shadow-xs' : currentStep > 1 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-400 bg-slate-50'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep === 1 ? 'bg-white text-emerald-900' : currentStep > 1 ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span>Bước 1: Chọn chi nhánh, kỳ & file</span>
          </div>

          <div className={`p-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
            currentStep === 2 ? 'bg-emerald-800 text-white shadow-xs' : currentStep > 2 ? 'bg-emerald-50 text-emerald-800' : 'text-slate-400 bg-slate-50'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep === 2 ? 'bg-white text-emerald-900' : currentStep > 2 ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentStep > 2 ? <Check className="w-3 h-3" /> : '2'}
            </span>
            <span>Bước 2: Kiểm tra bản xem trước</span>
          </div>

          <div className={`p-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
            currentStep === 3 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-400 bg-slate-50'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep === 3 ? 'bg-white text-emerald-900' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </span>
            <span>Bước 3: Xác nhận lưu</span>
          </div>
        </div>
      </div>

      {/* --- BƯỚC 1: CHỌN CHI NHÁNH, KỲ VÀ FILE --- */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bước 1: Thiết lập kỳ bán hàng & Chọn file dữ liệu</h2>
            <p className="text-xs text-slate-500">
              Dữ liệu bán hàng từ máy POS giúp tự động tính toán lượng nguyên vật liệu tiêu hao lý thuyết và báo cáo hao hụt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chi nhánh áp dụng dữ liệu *</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kỳ bán hàng (Tuần / Tháng) *</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              >
                <option value="2026-W44 (26/10 - 01/11/2026)">Tuần 44/2026 (26/10 - 01/11/2026)</option>
                <option value="2026-W43 (19/10 - 25/10/2026)">Tuần 43/2026 (19/10 - 25/10/2026) [Đã có dữ liệu]</option>
                <option value="2026-W42 (12/10 - 18/10/2026)">Tuần 42/2026 (12/10 - 18/10/2026)</option>
                <option value="Tháng 10/2026">Tháng 10/2026 (Tổng hợp tháng)</option>
              </select>
            </div>
          </div>

          {/* Upload Area & Sample Shortcuts */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            {fileName ? (
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-sm">{fileName}</span>
                <p className="text-xs text-emerald-700 font-medium">Đã tải cấu trúc {parsedItems.length} món đồ uống</p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs">Kéo thả file Excel (.xlsx, .csv) vào đây hoặc chọn</span>
                <p className="text-[11px] text-slate-400">Hỗ trợ file báo cáo doanh thu món xuất từ POS KiotViet / iPOS</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleUseSampleData}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dùng dữ liệu mẫu (Khuyến nghị trải nghiệm)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải file Excel mẫu (.csv)</span>
              </button>
            </div>
          </div>

          {/* Single Primary Action Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleProceedToPreview}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Tiếp tục: Kiểm tra xem trước</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- BƯỚC 2: KIỂM TRA BẢN XEM TRƯỚC --- */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Bước 2: Kiểm tra bản xem trước doanh thu & tiêu hao</h2>
              <p className="text-xs text-slate-500">
                Chi nhánh: <strong>{branches.find(b => b.id === selectedBranchId)?.name}</strong> • Kỳ: <strong>{period}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Tổng doanh thu kỳ:</span>
              <span className="text-base font-extrabold text-emerald-800">{totalRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Drinks Table */}
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
              Danh mục món và số lượng bán ({totalCups} ly):
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mã món</th>
                    <th className="py-2.5 px-3">Tên món đồ uống</th>
                    <th className="py-2.5 px-3 text-center">Số lượng bán</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá niêm yết</th>
                    <th className="py-2.5 px-3 text-right">Doanh thu tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item) => {
                    const rec = recipes.find(r => r.id === item.recipeId);
                    const sub = rec ? rec.price * item.quantity : 0;

                    return (
                      <tr key={item.recipeId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{rec?.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{rec?.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{item.quantity} ly</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{rec?.price.toLocaleString('vi-VN')} đ</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{sub.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expected Ingredients Deductions Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-xs">
              Tiêu hao nguyên vật liệu dự kiến theo định mức công thức:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.values(ingredientDeductions).map((ing, i) => (
                <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 truncate pr-1">{ing.name}</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    {ing.totalQty.toFixed(2)} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Bước 1</span>
            </button>

            <button
              onClick={() => handleConfirmSave(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Xác nhận lưu dữ liệu bán hàng</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- BƯỚC 3: XÁC NHẬN LƯU THÀNH CÔNG --- */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-700" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Nhập dữ liệu bán hàng thành công!</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Dữ liệu kỳ <strong>{period}</strong> đã được đồng bộ vào hệ thống. Các báo cáo Tồn kho và Hao hụt đã cập nhật số liệu mới nhất.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-3 text-xs">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
            >
              Nhập thêm kỳ khác
            </button>
          </div>
        </div>
      )}

      {/* --- OVERWRITE CONFIRMATION MODAL --- */}
      {isOverwriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Phát hiện trùng lặp kỳ bán hàng
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Chi nhánh <strong>{branches.find(b => b.id === selectedBranchId)?.name}</strong> đã có dữ liệu bán hàng cho kỳ <strong>{period}</strong> trong hệ thống. Bạn có muốn ghi đè dữ liệu mới lên bản ghi cũ không?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOverwriteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleConfirmSave(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
              >
                Xác nhận Ghi đè
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
