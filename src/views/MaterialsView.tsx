import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Material, MaterialCategory } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  PowerOff, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

const CATEGORIES: MaterialCategory[] = [
  'Cà phê hạt & Bột',
  'Sữa & Chế phẩm sữa',
  'Trà & Thảo mộc',
  'Syrup & Mứt',
  'Đường & Phụ gia',
  'Bao bì & Ly tách',
];

export const MaterialsView: React.FC = () => {
  const { 
    materials, 
    activeBranchId, 
    branches, 
    addMaterial, 
    updateMaterial, 
    deactivateMaterial, 
    reactivateMaterial, 
    currentUser,
    showToast
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Selected for slide-over panel
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deactivatingMaterial, setDeactivatingMaterial] = useState<Material | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  // Dropdown action row ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cà phê hạt & Bột' as MaterialCategory,
    unit: 'kg',
    standardPrice: 0,
    minStock: 10,
    supplier: '',
    description: '',
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Cà phê hạt & Bột',
      unit: 'kg',
      standardPrice: 0,
      minStock: 10,
      supplier: '',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditingMaterial(mat);
    setFormData({
      name: mat.name,
      category: mat.category,
      unit: mat.unit,
      standardPrice: mat.standardPrice,
      minStock: mat.minStocks[activeBranchId === 'all' ? 'cn-1' : activeBranchId] || 10,
      supplier: mat.supplier || '',
      description: mat.description || '',
    });
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên nguyên vật liệu!', 'error');
      return;
    }
    if (formData.standardPrice < 0) {
      showToast('Đơn giá tiêu chuẩn không được âm!', 'error');
      return;
    }

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        standardPrice: Number(formData.standardPrice),
        supplier: formData.supplier,
        description: formData.description,
      });
      setEditingMaterial(null);
    } else {
      // Create new material
      // NOTE: Không cho nhập số dư tồn ban đầu, theo quy tắc hệ thống
      const initialMinStocks: Record<string, number> = {
        'cn-1': formData.minStock,
        'cn-2': formData.minStock,
        'cn-3': formData.minStock,
      };
      addMaterial({
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        standardPrice: Number(formData.standardPrice),
        minStocks: initialMinStocks,
        status: 'active',
        supplier: formData.supplier,
        description: formData.description,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingMaterial) return;
    if (!deactivateReason.trim()) {
      showToast('Vui lòng nhập lý do ngừng sử dụng!', 'error');
      return;
    }
    deactivateMaterial(deactivatingMaterial.id, deactivateReason);
    setDeactivatingMaterial(null);
    setDeactivateReason('');
    if (selectedMaterial?.id === deactivatingMaterial.id) {
      setSelectedMaterial(null);
    }
  };

  // Helper to get display stock
  const getDisplayStock = (mat: Material) => {
    if (activeBranchId === 'all') {
      return Object.values(mat.stocks).reduce((sum, s) => sum + (s || 0), 0);
    }
    return mat.stocks[activeBranchId] || 0;
  };

  // Helper to get min stock
  const getDisplayMinStock = (mat: Material) => {
    if (activeBranchId === 'all') {
      return Object.values(mat.minStocks).reduce((sum, s) => sum + (s || 0), 0);
    }
    return mat.minStocks[activeBranchId] || 0;
  };

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.supplier && m.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4 relative">
      {/* Action Header: 1 Single Primary Action + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã NVL, nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
              isFilterExpanded || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nguyên liệu</span>
        </button>
      </div>

      {/* Collapsible Advanced Filters */}
      {isFilterExpanded && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phân loại nguyên liệu</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Tất cả nhóm nguyên liệu</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trạng thái sử dụng</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang sử dụng</option>
              <option value="inactive">Đã ngừng sử dụng</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Main Table: 6-7 Key Columns */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Mã NVL</th>
                <th className="py-3 px-4">Tên nguyên vật liệu</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4 text-center">ĐVT</th>
                <th className="py-3 px-4 text-right">Đơn giá chuẩn</th>
                <th className="py-3 px-4 text-right">
                  {activeBranchId === 'all' ? 'Tổng tồn chuỗi' : 'Tồn hiện tại'}
                </th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right w-16">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map(mat => {
                const stock = getDisplayStock(mat);
                const min = getDisplayMinStock(mat);
                const isLow = stock <= min && mat.status === 'active';

                return (
                  <tr 
                    key={mat.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{mat.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                        <span>{mat.name}</span>
                        {isLow && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Tồn kho dưới ngưỡng an toàn" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{mat.supplier || 'Chưa có NCC'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{mat.category}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{mat.unit}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {mat.standardPrice.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={isLow ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-900'}>
                        {stock.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {mat.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Đang sử dụng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span>Ngừng sử dụng</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === mat.id ? null : mat.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === mat.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => {
                                setSelectedMaterial(mat);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Xem chi tiết</span>
                            </button>

                            <button
                              onClick={() => {
                                openEditModal(mat);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa thông tin</span>
                            </button>

                            {mat.status === 'active' ? (
                              <button
                                onClick={() => {
                                  setDeactivatingMaterial(mat);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <PowerOff className="w-3.5 h-3.5" />
                                <span>Ngừng sử dụng</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  reactivateMaterial(mat.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Kích hoạt lại</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-xs">Không tìm thấy nguyên vật liệu phù hợp với điều kiện tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Slide-over Detail Panel */}
      {selectedMaterial && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-40 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800">{selectedMaterial.code}</span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedMaterial.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái:</span>
                {selectedMaterial.status === 'active' ? (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Đang sử dụng</span>
                ) : (
                  <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">Ngừng sử dụng</span>
                )}
              </div>

              {selectedMaterial.deactivationReason && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 text-xs">
                  <div className="font-bold mb-1">Lý do ngừng sử dụng:</div>
                  <p>{selectedMaterial.deactivationReason}</p>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Phân loại:</span>
                <span className="font-medium text-slate-800">{selectedMaterial.category}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Đơn vị tính:</span>
                <span className="font-bold text-slate-900">{selectedMaterial.unit}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Đơn giá tiêu chuẩn:</span>
                <span className="font-bold text-slate-900">{selectedMaterial.standardPrice.toLocaleString('vi-VN')} đ / {selectedMaterial.unit}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nhà cung cấp:</span>
                <span className="font-medium text-slate-800">{selectedMaterial.supplier || 'Chưa xác định'}</span>
              </div>

              {/* Tồn kho theo từng chi nhánh */}
              <div className="pt-2">
                <div className="font-bold text-slate-800 mb-2">Số lượng tồn kho theo chi nhánh:</div>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {branches.map(b => (
                    <div key={b.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">{b.name.split('—')[0]}</span>
                      <span className="font-bold text-slate-900">
                        {selectedMaterial.stocks[b.id] || 0} {selectedMaterial.unit}
                        <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                          (Tối thiểu: {selectedMaterial.minStocks[b.id] || 0})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMaterial.description && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Mô tả quy cách / bảo quản:</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">{selectedMaterial.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                openEditModal(selectedMaterial);
                setSelectedMaterial(null);
              }}
              className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Chỉnh sửa thông tin
            </button>
            {selectedMaterial.status === 'active' ? (
              <button
                onClick={() => {
                  setDeactivatingMaterial(selectedMaterial);
                  setSelectedMaterial(null);
                }}
                className="py-2 px-3 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold"
              >
                Ngừng sử dụng
              </button>
            ) : (
              <button
                onClick={() => {
                  reactivateMaterial(selectedMaterial.id);
                  setSelectedMaterial(null);
                }}
                className="py-2 px-3 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Kích hoạt lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Material Modal */}
      {(isAddModalOpen || editingMaterial) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingMaterial ? 'Chỉnh sửa nguyên vật liệu' : 'Thêm nguyên vật liệu mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMaterial(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4 text-xs">
              {/* Notice regarding stock balance */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Nguyên tắc sổ kho:</strong> Biểu mẫu thông tin không cho phép nhập trực tiếp số dư tồn kho. Số dư ban đầu và biến động phải thông qua <em>Phiếu nhập kho</em> hoặc <em>Kiểm kê điều chỉnh</em>.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên nguyên vật liệu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cà phê Robusta Đắk Lắk..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính (ĐVT) *</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, hộp, chai, lon..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn giá tiêu chuẩn (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.standardPrice}
                    onChange={(e) => setFormData({ ...formData, standardPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức tồn an toàn tối thiểu</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhà cung cấp chính</label>
                <input
                  type="text"
                  placeholder="Tên nhà cung cấp hoặc nông trại..."
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả / Hướng dẫn bảo quản</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú quy cách đóng gói, nhiệt độ bảo quản..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  {editingMaterial ? 'Lưu thay đổi' : 'Thêm nguyên liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Material Reason Modal */}
      {deactivatingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 text-rose-700 flex items-center gap-2">
              <PowerOff className="w-4 h-4" /> Xác nhận ngừng sử dụng nguyên liệu
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Bạn đang yêu cầu ngừng sử dụng nguyên liệu <strong>{deactivatingMaterial.name}</strong> ({deactivatingMaterial.code}). Vui lòng nhập lý do để lưu vết hệ thống:
            </p>

            <div className="mb-4">
              <label className="block font-semibold text-slate-700 mb-1">Lý do ngừng sử dụng *</label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Đổi nhà cung cấp, tạm ngừng pha chế món liên quan, sản phẩm hết mùa..."
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeactivatingMaterial(null);
                  setDeactivateReason('');
                }}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-600 font-semibold"
              >
                Xác nhận ngừng sử dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
