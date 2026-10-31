import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, RecipeIngredient } from '../types';
import { 
  Plus, 
  Search, 
  ChefHat, 
  SlidersHorizontal, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowRight,
  TrendingDown,
  Building2,
  Check
} from 'lucide-react';

export const RecipesAndThresholdsView: React.FC = () => {
  const { 
    recipes, 
    materials, 
    activeBranchId, 
    branches, 
    activeTab, 
    setActiveTab, 
    addRecipe, 
    updateRecipe, 
    requestThresholdChange, 
    approvals,
    currentUser,
    showToast 
  } = useApp();

  const isOwner = currentUser.role === 'chucuahang';
  const tab = activeTab || 'cong-thuc';

  // --- TAB 1: RECIPES STATE ---
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(recipes[0] || null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');

  // Recipe Form State
  const [recipeForm, setRecipeForm] = useState<{
    name: string;
    category: Recipe['category'];
    price: number;
    note: string;
    ingredients: RecipeIngredient[];
  }>({
    name: '',
    category: 'Cà phê truyền thống',
    price: 35000,
    note: '',
    ingredients: [],
  });

  const openAddRecipeModal = () => {
    setEditingRecipe(null);
    setRecipeForm({
      name: '',
      category: 'Cà phê truyền thống',
      price: 35000,
      note: '',
      ingredients: [
        { materialId: materials[0]?.id || '', materialName: materials[0]?.name || '', quantity: 0.02, unit: materials[0]?.unit || 'kg', costEstimate: (materials[0]?.standardPrice || 0) * 0.02 },
      ],
    });
    setIsRecipeModalOpen(true);
  };

  const openEditRecipeModal = (rec: Recipe) => {
    setEditingRecipe(rec);
    setRecipeForm({
      name: rec.name,
      category: rec.category,
      price: rec.price,
      note: rec.note || '',
      ingredients: [...rec.ingredients],
    });
    setIsRecipeModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    const firstMat = materials[0];
    if (!firstMat) return;
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          materialId: firstMat.id,
          materialName: firstMat.name,
          quantity: 1,
          unit: firstMat.unit,
          costEstimate: firstMat.standardPrice,
        },
      ],
    }));
  };

  const handleIngredientChange = (index: number, matId: string, qty: number) => {
    const mat = materials.find(m => m.id === matId);
    if (!mat) return;
    setRecipeForm(prev => {
      const nextIngredients = [...prev.ingredients];
      nextIngredients[index] = {
        materialId: mat.id,
        materialName: mat.name,
        quantity: qty,
        unit: mat.unit,
        costEstimate: qty * mat.standardPrice,
      };
      return { ...prev, ingredients: nextIngredients };
    });
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeForm.name.trim()) {
      showToast('Vui lòng nhập tên món!', 'error');
      return;
    }
    if (recipeForm.ingredients.length === 0) {
      showToast('Công thức phải có ít nhất 1 nguyên vật liệu!', 'error');
      return;
    }

    if (editingRecipe) {
      updateRecipe(editingRecipe.id, {
        name: recipeForm.name,
        category: recipeForm.category,
        price: Number(recipeForm.price),
        note: recipeForm.note,
        ingredients: recipeForm.ingredients,
        totalCostEstimate: recipeForm.ingredients.reduce((sum, i) => sum + i.costEstimate, 0),
      });
    } else {
      addRecipe({
        name: recipeForm.name,
        category: recipeForm.category,
        price: Number(recipeForm.price),
        note: recipeForm.note,
        ingredients: recipeForm.ingredients,
        status: isOwner ? 'active' : 'pending_approval',
      });
    }

    setIsRecipeModalOpen(false);
  };

  // --- TAB 2: THRESHOLD STATE ---
  const [selectedBranchForThreshold, setSelectedBranchForThreshold] = useState<string>(
    activeBranchId === 'all' ? 'cn-1' : activeBranchId
  );
  const [thresholdModalMat, setThresholdModalMat] = useState<typeof materials[0] | null>(null);
  const [newThresholdValue, setNewThresholdValue] = useState<number>(10);
  const [thresholdReason, setThresholdReason] = useState<string>('');

  const openThresholdChangeModal = (mat: typeof materials[0]) => {
    setThresholdModalMat(mat);
    setNewThresholdValue(mat.minStocks[selectedBranchForThreshold] || 10);
    setThresholdReason('');
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdModalMat) return;
    requestThresholdChange(thresholdModalMat.id, selectedBranchForThreshold, newThresholdValue, thresholdReason);
    setThresholdModalMat(null);
  };

  // Filtered recipes
  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.code.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 2-Tab Navigation Bar */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('cong-thuc')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'cong-thuc'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Công thức pha chế
          </button>
          <button
            onClick={() => setActiveTab('ton-toi-thieu')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'ton-toi-thieu'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tồn tối thiểu (Định mức an toàn)
          </button>
        </div>

        {/* Single Primary Action per Tab */}
        {tab === 'cong-thuc' ? (
          <button
            onClick={openAddRecipeModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm công thức</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Định mức áp dụng theo từng chi nhánh</span>
          </div>
        )}
      </div>

      {/* --- CONTENT: TAB 1 (CÔNG THỨC PHA CHẾ) --- */}
      {tab === 'cong-thuc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (5 Cols): List of Drinks */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col h-[680px]">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm món pha chế..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredRecipes.map(rec => {
                const isSelected = selectedRecipe?.id === rec.id;
                const costPercent = Math.round((rec.totalCostEstimate / rec.price) * 100);

                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecipe(rec)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{rec.code}</span>
                      {rec.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Áp dụng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Chờ duyệt
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-slate-900 text-sm mb-1">{rec.name}</div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Giá bán: <strong className="text-slate-800">{rec.price.toLocaleString('vi-VN')} đ</strong></span>
                      <span>Food Cost: <strong className="text-emerald-700">{costPercent}%</strong> ({rec.totalCostEstimate.toLocaleString('vi-VN')} đ)</span>
                    </div>
                  </div>
                );
              })}

              {filteredRecipes.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy món pha chế nào.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 Cols): Selected Recipe Details */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between h-[680px]">
            {selectedRecipe ? (
              <div className="space-y-5 overflow-y-auto pr-1">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-800">{selectedRecipe.code}</span>
                      <span className="text-xs text-slate-500">• {selectedRecipe.category}</span>
                      {selectedRecipe.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Chính thức
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Đề xuất chờ duyệt
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedRecipe.name}</h2>
                    {selectedRecipe.note && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedRecipe.note}</p>
                    )}
                  </div>

                  <button
                    onClick={() => openEditRecipeModal(selectedRecipe)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa công thức</span>
                  </button>
                </div>

                {/* Price and Cost Highlight */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500">Giá niêm yết:</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRecipe.price.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Giá vốn nguyên liệu:</span>
                    <div className="text-sm font-bold text-emerald-800 mt-0.5">
                      {selectedRecipe.totalCostEstimate.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Tỷ lệ giá vốn (Food Cost):</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {Math.round((selectedRecipe.totalCostEstimate / selectedRecipe.price) * 100)} %
                    </div>
                  </div>
                </div>

                {/* Ingredients Breakdown Table */}
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-emerald-700" />
                    Định mức nguyên vật liệu cấu thành (Cho 1 ly chuẩn)
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Tên nguyên vật liệu</th>
                          <th className="py-2.5 px-3 text-center">Định lượng</th>
                          <th className="py-2.5 px-3 text-center">ĐVT</th>
                          <th className="py-2.5 px-3 text-right">Giá vốn ước tính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecipe.ingredients.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-slate-900">{ing.materialName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{ing.quantity}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{ing.unit}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                              {ing.costEstimate.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Chọn một món ở danh sách bên trái để xem công thức và định mức chi tiết.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CONTENT: TAB 2 (TỒN TỐI THIỂU) --- */}
      {tab === 'ton-toi-thieu' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bảng định mức tồn an toàn tối thiểu</h2>
              <p className="text-xs text-slate-500">
                Khi tồn kho thực tế chạm hoặc dưới mức an toàn, hệ thống tự động gắn cờ cảnh báo trên màn hình Tổng quan.
              </p>
            </div>

            {/* Branch selector for threshold view */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Xem chi nhánh:</span>
              <select
                value={selectedBranchForThreshold}
                onChange={(e) => setSelectedBranchForThreshold(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-700"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pending Threshold Requests Notification */}
          {approvals.filter(a => a.type === 'recipe_or_threshold' && a.status === 'pending').length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Có yêu cầu đang chờ duyệt:</strong> Quản lý đã gửi đề xuất điều chỉnh định mức tồn. Đề xuất sẽ có hiệu lực sau khi Chủ cửa hàng phê duyệt.
              </span>
            </div>
          )}

          {/* Table of Thresholds */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-28">Mã NVL</th>
                  <th className="py-3 px-4">Tên nguyên vật liệu</th>
                  <th className="py-3 px-4">Phân loại</th>
                  <th className="py-3 px-4 text-center">ĐVT</th>
                  <th className="py-3 px-4 text-right">Tồn hiện tại</th>
                  <th className="py-3 px-4 text-right">Tồn tối thiểu hiện hành</th>
                  <th className="py-3 px-4 text-center">Tình trạng</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map(mat => {
                  const currentStock = mat.stocks[selectedBranchForThreshold] || 0;
                  const minStock = mat.minStocks[selectedBranchForThreshold] || 0;
                  const isLow = currentStock <= minStock && mat.status === 'active';

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{mat.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{mat.name}</td>
                      <td className="py-3 px-4 text-slate-600">{mat.category}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{mat.unit}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {currentStock.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">
                        {minStock.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Cần nhập thêm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            An toàn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openThresholdChangeModal(mat)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 hover:text-emerald-800 text-slate-700 font-semibold text-xs transition-colors"
                        >
                          {isOwner ? 'Cập nhật' : 'Đề xuất đổi'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT RECIPE MODAL --- */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingRecipe ? `Chỉnh sửa công thức: ${editingRecipe.name}` : 'Tạo mới công thức pha chế'}
              </h3>
              <button onClick={() => setIsRecipeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên món đồ uống *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Trà Đào Cam Sả Trình..."
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhóm đồ uống *</label>
                  <select
                    value={recipeForm.category}
                    onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value as Recipe['category'] })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  >
                    <option value="Cà phê truyền thống">Cà phê truyền thống</option>
                    <option value="Cà phê pha máy">Cà phê pha máy</option>
                    <option value="Trà & Macchiato">Trà & Macchiato</option>
                    <option value="Đá xay & Sinh tố">Đá xay & Sinh tố</option>
                    <option value="Bánh & Tráng miệng">Bánh & Tráng miệng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giá bán niêm yết (VNĐ) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={recipeForm.price}
                    onChange={(e) => setRecipeForm({ ...recipeForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú pha chế / Lưu ý</label>
                  <input
                    type="text"
                    placeholder="Quy chuẩn nhiệt độ, thời gian chiết xuất..."
                    value={recipeForm.note}
                    onChange={(e) => setRecipeForm({ ...recipeForm, note: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Ingredients List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Thành phần nguyên vật liệu cấu thành:</label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm nguyên liệu
                  </button>
                </div>

                <div className="space-y-2">
                  {recipeForm.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <select
                        value={ing.materialId}
                        onChange={(e) => handleIngredientChange(idx, e.target.value, ing.quantity)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded text-xs"
                      >
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={ing.quantity}
                        onChange={(e) => handleIngredientChange(idx, ing.materialId, Number(e.target.value))}
                        className="w-24 p-2 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                        placeholder="Số lượng"
                      />

                      <span className="w-16 text-slate-500 text-center font-medium truncate">{ing.unit}</span>

                      <span className="w-24 text-right font-medium text-slate-700 text-xs">
                        {ing.costEstimate.toLocaleString('vi-VN')} đ
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-emerald-50 rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-950">Tổng giá vốn nguyên liệu ước tính:</span>
                  <span className="font-bold text-emerald-900 text-sm">
                    {recipeForm.ingredients.reduce((sum, i) => sum + i.costEstimate, 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {!isOwner && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-xs border border-amber-200">
                  * Yêu cầu này sẽ được gửi tới Chủ cửa hàng phê duyệt trước khi áp dụng vào tính toán báo cáo hao hụt.
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  {isOwner ? 'Lưu và Áp dụng' : 'Gửi yêu cầu phê duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- THRESHOLD CHANGE MODAL --- */}
      {thresholdModalMat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Điều chỉnh định mức tồn tối thiểu
            </h3>
            <p className="text-slate-500 mb-4">
              {thresholdModalMat.name} ({thresholdModalMat.code}) tại {branches.find(b => b.id === selectedBranchForThreshold)?.name}
            </p>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mức tồn an toàn mới ({thresholdModalMat.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lý do điều chỉnh định mức *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Tăng dự phòng do lượng khách cuối tuần tăng, nhà cung cấp giao trễ..."
                  value={thresholdReason}
                  onChange={(e) => setThresholdReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setThresholdModalMat(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  {isOwner ? 'Cập nhật ngay' : 'Gửi yêu cầu phê duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
