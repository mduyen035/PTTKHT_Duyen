import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Branch, Material, Recipe, ImportSlip, ExportSlip, 
  Stocktake, SalesRecord, ApprovalRequest, Role, MaterialCategory
} from '../types';
import { 
  DEMO_USERS, INITIAL_BRANCHES, INITIAL_MATERIALS, INITIAL_RECIPES, 
  INITIAL_IMPORT_SLIPS, INITIAL_EXPORT_SLIPS, INITIAL_STOCKTAKES, 
  INITIAL_SALES_RECORDS, INITIAL_APPROVALS 
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeBranchId: string; // 'all' or branchId
  setActiveBranchId: (id: string) => void;
  branches: Branch[];
  activeBranch: Branch | null;
  materials: Material[];
  recipes: Recipe[];
  importSlips: ImportSlip[];
  exportSlips: ExportSlip[];
  stocktakes: Stocktake[];
  salesRecords: SalesRecord[];
  approvals: ApprovalRequest[];
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Authentication State
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  logout: () => void;

  // Active module navigation
  currentNav: string;
  setCurrentNav: (nav: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewDetailsId: string | null;
  setViewDetailsId: (id: string | null) => void;

  // Handover & Guide Modal
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;

  // Material Actions
  addMaterial: (material: Omit<Material, 'id' | 'code' | 'stocks'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deactivateMaterial: (id: string, reason: string) => void;
  reactivateMaterial: (id: string) => void;

  // Recipe & Threshold Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'code' | 'updatedAt' | 'totalCostEstimate'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  requestThresholdChange: (materialId: string, branchId: string, newThreshold: number, reason: string) => void;

  // Import Actions
  createImportSlip: (data: Omit<ImportSlip, 'id' | 'code' | 'status' | 'history'>) => void;
  receiveImportGoods: (slipId: string, receivedItems: { materialId: string; receivedQuantity: number; defectQuantity?: number; defectReason?: string }[]) => void;
  cancelImportSlip: (slipId: string, reason: string) => void;

  // Export Actions
  createExportSlip: (data: Omit<ExportSlip, 'id' | 'code' | 'status' | 'history'>) => boolean;
  confirmActualExport: (slipId: string, actualItems: { materialId: string; actualQuantity: number }[]) => boolean;
  cancelExportSlip: (slipId: string, reason: string) => void;

  // Stocktake Actions
  createStocktake: (branchId: string, items: { materialId: string; actualStock: number; differenceReason?: string }[], note?: string) => void;
  proposeStockAdjustment: (stocktakeId: string, reason: string) => void;

  // Sales Data Actions
  importSalesData: (period: string, branchId: string, items: { recipeId: string; quantity: number }[], overwrite?: boolean) => boolean;

  // Approval Actions
  approveRequest: (approvalId: string, note?: string) => void;
  rejectRequest: (approvalId: string, reason: string) => void;

  // Reset to default
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'TRINH_CAPHE_INVENTORY_DATA_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.currentUser) {
          const fresh = DEMO_USERS.find(u => u.username === parsed.currentUser.username);
          if (fresh) {
            parsed.currentUser.roleLabel = fresh.roleLabel;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return null;
  };

  const initialSaved = loadState();

  const [currentUser, setCurrentUser] = useState<User>(() => initialSaved?.currentUser || DEMO_USERS[0]);
  const [activeBranchId, setActiveBranchId] = useState<string>(() => initialSaved?.activeBranchId || 'all');
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [materials, setMaterials] = useState<Material[]>(() => initialSaved?.materials || INITIAL_MATERIALS);
  const [recipes, setRecipes] = useState<Recipe[]>(() => initialSaved?.recipes || INITIAL_RECIPES);
  const [importSlips, setImportSlips] = useState<ImportSlip[]>(() => initialSaved?.importSlips || INITIAL_IMPORT_SLIPS);
  const [exportSlips, setExportSlips] = useState<ExportSlip[]>(() => initialSaved?.exportSlips || INITIAL_EXPORT_SLIPS);
  const [stocktakes, setStocktakes] = useState<Stocktake[]>(() => initialSaved?.stocktakes || INITIAL_STOCKTAKES);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => initialSaved?.salesRecords || INITIAL_SALES_RECORDS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => initialSaved?.approvals || INITIAL_APPROVALS);

  // Navigation state
  const [currentNav, setCurrentNav] = useState<string>('tong-quan');
  const [activeTab, setActiveTab] = useState<string>('');
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Authentication state (default false so user sees login screen initially)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Đã đăng xuất phiên làm việc. Chuyển về màn hình đăng nhập.', 'info');
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        currentUser,
        activeBranchId,
        materials,
        recipes,
        importSlips,
        exportSlips,
        stocktakes,
        salesRecords,
        approvals,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [currentUser, activeBranchId, materials, recipes, importSlips, exportSlips, stocktakes, salesRecords, approvals]);

  // Adjust activeBranch when user changes
  useEffect(() => {
    if (currentUser.role !== 'chucuahang' && activeBranchId === 'all') {
      setActiveBranchId(currentUser.branchId || 'cn-1');
    }
  }, [currentUser, activeBranchId]);

  const activeBranch = branches.find(b => b.id === activeBranchId) || null;

  // Reset function
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(DEMO_USERS[0]);
    setActiveBranchId('all');
    setMaterials(INITIAL_MATERIALS);
    setRecipes(INITIAL_RECIPES);
    setImportSlips(INITIAL_IMPORT_SLIPS);
    setExportSlips(INITIAL_EXPORT_SLIPS);
    setStocktakes(INITIAL_STOCKTAKES);
    setSalesRecords(INITIAL_SALES_RECORDS);
    setApprovals(INITIAL_APPROVALS);
    setCurrentNav('tong-quan');
    setViewDetailsId(null);
    showToast('Đã khôi phục dữ liệu mẫu ban đầu!', 'info');
  };

  // --- MATERIAL ACTIONS ---
  const addMaterial = (data: Omit<Material, 'id' | 'code' | 'stocks'>) => {
    const nextCode = `NVL-${String(materials.length + 1).padStart(3, '0')}`;
    const newMaterial: Material = {
      ...data,
      id: `mat-${Date.now()}`,
      code: nextCode,
      stocks: { 'cn-1': 0, 'cn-2': 0, 'cn-3': 0 }, // Không cho nhập trực tiếp số dư tồn kho
      status: 'active',
    };
    setMaterials(prev => [newMaterial, ...prev]);
    showToast(`Đã thêm nguyên vật liệu "${newMaterial.name}" thành công!`);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    // Không cho phép sửa trực tiếp stocks qua form thông tin nguyên liệu
    const safeUpdates = { ...updates };
    delete safeUpdates.stocks;

    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...safeUpdates } : m));
    showToast('Đã cập nhật thông tin nguyên vật liệu thành công!');
  };

  const deactivateMaterial = (id: string, reason: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'inactive', deactivationReason: reason } : m));
    showToast('Đã ngừng sử dụng nguyên vật liệu.', 'warning');
  };

  const reactivateMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'active', deactivationReason: undefined } : m));
    showToast('Đã kích hoạt lại nguyên vật liệu.');
  };

  // --- RECIPE & THRESHOLD ACTIONS ---
  const addRecipe = (data: Omit<Recipe, 'id' | 'code' | 'updatedAt' | 'totalCostEstimate'>) => {
    const nextCode = `DU-${String(recipes.length + 1).padStart(3, '0')}`;
    const totalCost = data.ingredients.reduce((acc, item) => acc + item.costEstimate, 0);

    const newRecipe: Recipe = {
      ...data,
      id: `rec-${Date.now()}`,
      code: nextCode,
      updatedAt: new Date().toISOString().split('T')[0],
      totalCostEstimate: totalCost,
      status: currentUser.role === 'chucuahang' ? 'active' : 'pending_approval',
    };

    setRecipes(prev => [newRecipe, ...prev]);

    if (currentUser.role !== 'chucuahang') {
      // Create approval request
      const approval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        type: 'recipe_or_threshold',
        title: `Đề xuất phê duyệt công thức mới: ${newRecipe.name} (${newRecipe.code})`,
        branchId: activeBranchId === 'all' ? 'cn-1' : activeBranchId,
        branchName: activeBranch?.name || 'Chi nhánh 1',
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requestedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        referenceId: newRecipe.id,
        reason: 'Quản lý tạo mới công thức món pha chế.',
        details: {
          summaryText: `Thêm công thức ${newRecipe.name}, giá bán ${newRecipe.price.toLocaleString('vi-VN')}đ, giá vốn ${totalCost.toLocaleString('vi-VN')}đ.`,
          after: newRecipe.ingredients.map(i => `${i.materialName}: ${i.quantity} ${i.unit}`).join(', '),
        },
      };
      setApprovals(prev => [approval, ...prev]);
      showToast('Đã gửi yêu cầu phê duyệt công thức món mới đến Chủ cửa hàng.');
    } else {
      showToast(`Đã thêm và kích hoạt công thức "${newRecipe.name}".`);
    }
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    const existing = recipes.find(r => r.id === id);
    if (!existing) return;

    if (currentUser.role === 'chucuahang') {
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : r));
      showToast('Đã cập nhật công thức thành công.');
    } else {
      // Create approval
      const approval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        type: 'recipe_or_threshold',
        title: `Đề xuất chỉnh sửa công thức: ${existing.name} (${existing.code})`,
        branchId: activeBranchId === 'all' ? 'cn-1' : activeBranchId,
        branchName: activeBranch?.name || 'Chi nhánh 1',
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requestedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        referenceId: id,
        reason: 'Quản lý đề xuất điều chỉnh định lượng / giá bán.',
        details: {
          summaryText: `Thay đổi công thức ${existing.name}`,
          before: existing.ingredients.map(i => `${i.materialName}: ${i.quantity} ${i.unit}`).join(', '),
          after: updates.ingredients ? updates.ingredients.map(i => `${i.materialName}: ${i.quantity} ${i.unit}`).join(', ') : 'Điều chỉnh thông tin chung',
        },
      };
      setApprovals(prev => [approval, ...prev]);
      showToast('Đã gửi yêu cầu phê duyệt chỉnh sửa công thức đến Chủ cửa hàng.');
    }
  };

  const requestThresholdChange = (materialId: string, branchId: string, newThreshold: number, reason: string) => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return;
    const currentThreshold = mat.minStocks[branchId] || 0;
    const bName = branches.find(b => b.id === branchId)?.name || branchId;

    if (currentUser.role === 'chucuahang') {
      // Direct update for Owner
      setMaterials(prev => prev.map(m => {
        if (m.id === materialId) {
          return {
            ...m,
            minStocks: { ...m.minStocks, [branchId]: newThreshold },
          };
        }
        return m;
      }));
      showToast(`Đã cập nhật định mức tồn tối thiểu của "${mat.name}" tại ${bName} thành ${newThreshold} ${mat.unit}.`);
    } else {
      // Send proposal for approval
      const approval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        type: 'recipe_or_threshold',
        title: `Đề xuất điều chỉnh tồn tối thiểu: ${mat.name} (${bName})`,
        branchId,
        branchName: bName,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requestedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        referenceId: materialId,
        reason: reason || 'Điều chỉnh theo nhu cầu tiêu thụ thực tế của chi nhánh.',
        details: {
          summaryText: `Điều chỉnh mức tồn tối thiểu của ${mat.name} từ ${currentThreshold} lên ${newThreshold} ${mat.unit}.`,
          before: `${currentThreshold} ${mat.unit}`,
          after: `${newThreshold} ${mat.unit}`,
        },
      };
      setApprovals(prev => [approval, ...prev]);
      showToast('Đã gửi yêu cầu phê duyệt điều chỉnh tồn tối thiểu đến Chủ cửa hàng.');
    }
  };

  // --- IMPORT ACTIONS ---
  const createImportSlip = (data: Omit<ImportSlip, 'id' | 'code' | 'status' | 'history'>) => {
    const slipNumber = String(importSlips.length + 1).padStart(4, '0');
    const code = `PNK-2026-${slipNumber}`;

    // Quy tắc: Lập phiếu nhập làm kế hoạch chờ Chủ duyệt.
    const isOwner = currentUser.role === 'chucuahang';
    const status = isOwner ? 'approved' : 'pending_approval';

    const newSlip: ImportSlip = {
      ...data,
      id: `imp-${Date.now()}`,
      code,
      status,
      history: [
        {
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Tạo kế hoạch nhập hàng',
          performer: `${currentUser.name} (${currentUser.roleLabel})`,
          note: data.note,
        },
        ...(isOwner ? [{
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Chủ cửa hàng duyệt kế hoạch nhập (Chuyển sang Chờ nhận hàng)',
          performer: `${currentUser.name} (Chủ cửa hàng)`,
        }] : []),
      ],
    };

    setImportSlips(prev => [newSlip, ...prev]);

    if (!isOwner) {
      // Generate approval for Owner
      const approval: ApprovalRequest = {
        id: `appr-${Date.now()}`,
        type: 'import_plan',
        title: `Kế hoạch nhập hàng: ${newSlip.code} (${data.supplier})`,
        branchId: data.branchId,
        branchName: data.branchName,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requestedAt: new Date().toLocaleString('vi-VN'),
        status: 'pending',
        referenceId: newSlip.id,
        reason: data.note || 'Bổ sung nguyên vật liệu phục vụ kinh doanh.',
        details: {
          summaryText: `Kế hoạch nhập ${data.items.length} mặt hàng, tổng giá trị ${data.totalAmount.toLocaleString('vi-VN')} đ.`,
          impactAmount: data.totalAmount,
          after: data.items.map(i => ({ materialName: i.materialName, quantity: i.plannedQuantity, unit: i.unit, unitPrice: i.unitPrice, total: i.totalPrice })),
        },
      };
      setApprovals(prev => [approval, ...prev]);
      showToast(`Đã tạo phiếu nhập ${code} và gửi đề xuất duyệt đến Chủ cửa hàng!`);
    } else {
      showToast(`Đã tạo và phê duyệt kế hoạch nhập hàng ${code}. Phiếu chuyển sang Chờ nhận hàng.`);
    }
  };

  const receiveImportGoods = (
    slipId: string, 
    receivedItems: { materialId: string; receivedQuantity: number; defectQuantity?: number; defectReason?: string }[]
  ) => {
    const slip = importSlips.find(s => s.id === slipId);
    if (!slip) return;

    if (slip.status === 'completed') {
      showToast('Phiếu này đã hoàn thành, không thể ghi nhận lại!', 'error');
      return;
    }

    // Cập nhật tồn kho: CHỈ CỘNG PHẦN ĐẠT CHẤT LƯỢNG (receivedQuantity - defectQuantity)
    const stockIncrements: Record<string, number> = {};

    const updatedItems = slip.items.map(item => {
      const match = receivedItems.find(r => r.materialId === item.materialId);
      if (match) {
        const received = match.receivedQuantity;
        const defect = match.defectQuantity || 0;
        const validQty = Math.max(0, received - defect);

        stockIncrements[item.materialId] = validQty;

        return {
          ...item,
          receivedQuantity: received,
          defectQuantity: defect,
          defectReason: match.defectReason,
        };
      }
      return item;
    });

    // Cập nhật nguyên vật liệu
    setMaterials(prev => prev.map(m => {
      const inc = stockIncrements[m.id];
      if (inc !== undefined && inc > 0) {
        const currentBranchStock = m.stocks[slip.branchId] || 0;
        return {
          ...m,
          stocks: {
            ...m.stocks,
            [slip.branchId]: currentBranchStock + inc,
          },
        };
      }
      return m;
    }));

    // Cập nhật phiếu nhập sang completed (chỉ đọc)
    const updatedSlip: ImportSlip = {
      ...slip,
      items: updatedItems,
      status: 'completed',
      history: [
        ...slip.history,
        {
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Kiểm hàng & Nhập kho thành công',
          performer: `${currentUser.name} (${currentUser.roleLabel})`,
          note: `Đã nhập kho chính thức vào tồn chi nhánh ${slip.branchName}.`,
        },
      ],
    };

    setImportSlips(prev => prev.map(s => s.id === slipId ? updatedSlip : s));
    showToast(`Đã nhận hàng thành công cho phiếu ${slip.code}. Tồn kho đã được cộng thêm!`);
  };

  const cancelImportSlip = (slipId: string, reason: string) => {
    setImportSlips(prev => prev.map(s => {
      if (s.id === slipId) {
        return {
          ...s,
          status: 'cancelled',
          history: [
            ...s.history,
            {
              timestamp: new Date().toLocaleString('vi-VN'),
              action: 'Hủy phiếu nhập hàng',
              performer: `${currentUser.name} (${currentUser.roleLabel})`,
              note: reason,
            },
          ],
        };
      }
      return s;
    }));
    showToast('Đã hủy phiếu nhập hàng.', 'info');
  };

  // --- EXPORT ACTIONS ---
  const createExportSlip = (data: Omit<ExportSlip, 'id' | 'code' | 'status' | 'history'>): boolean => {
    // Kiểm tra không xuất vượt tồn kho chi nhánh
    for (const item of data.items) {
      const mat = materials.find(m => m.id === item.materialId);
      const currentStock = mat ? (mat.stocks[data.branchId] || 0) : 0;
      if (item.requestedQuantity > currentStock) {
        showToast(`Không thể lập phiếu: Số lượng yêu cầu xuất ${item.materialName} (${item.requestedQuantity} ${item.unit}) vượt quá tồn kho hiện tại (${currentStock} ${item.unit})!`, 'error');
        return false;
      }
    }

    const slipNumber = String(exportSlips.length + 1).padStart(4, '0');
    const code = `PXK-2026-${slipNumber}`;

    const newSlip: ExportSlip = {
      ...data,
      id: `exp-${Date.now()}`,
      code,
      status: 'pending_confirmation', // Lập phiếu chưa trừ tồn
      history: [
        {
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Lập phiếu xuất kho',
          performer: `${currentUser.name} (${currentUser.roleLabel})`,
          note: data.reason,
        },
      ],
    };

    setExportSlips(prev => [newSlip, ...prev]);
    showToast(`Đã tạo phiếu xuất kho ${code}. Vui lòng xác nhận thực xuất để cập nhật tồn kho.`);
    return true;
  };

  const confirmActualExport = (slipId: string, actualItems: { materialId: string; actualQuantity: number }[]): boolean => {
    const slip = exportSlips.find(s => s.id === slipId);
    if (!slip) return false;

    if (slip.status === 'completed') {
      showToast('Phiếu xuất này đã hoàn thành, không thể xuất lại!', 'error');
      return false;
    }

    // Kiểm tra lại tồn trước khi trừ
    for (const item of actualItems) {
      const mat = materials.find(m => m.id === item.materialId);
      const currentStock = mat ? (mat.stocks[slip.branchId] || 0) : 0;
      if (item.actualQuantity > currentStock) {
        showToast(`Không thể xuất kho: Số lượng thực xuất ${mat?.name} (${item.actualQuantity}) lớn hơn tồn hiện có (${currentStock})!`, 'error');
        return false;
      }
    }

    // Cập nhật trừ tồn kho (Chỉ trừ 1 lần duy nhất)
    const stockDecrements: Record<string, number> = {};
    const updatedItems = slip.items.map(item => {
      const match = actualItems.find(a => a.materialId === item.materialId);
      const actualQty = match ? match.actualQuantity : item.requestedQuantity;
      stockDecrements[item.materialId] = actualQty;
      return {
        ...item,
        actualQuantity: actualQty,
        totalCost: actualQty * item.unitCost,
      };
    });

    setMaterials(prev => prev.map(m => {
      const dec = stockDecrements[m.id];
      if (dec !== undefined && dec > 0) {
        const currentStock = m.stocks[slip.branchId] || 0;
        return {
          ...m,
          stocks: {
            ...m.stocks,
            [slip.branchId]: Math.max(0, currentStock - dec),
          },
        };
      }
      return m;
    }));

    const updatedSlip: ExportSlip = {
      ...slip,
      items: updatedItems,
      status: 'completed',
      history: [
        ...slip.history,
        {
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Xác nhận thực xuất và trừ tồn kho',
          performer: `${currentUser.name} (${currentUser.roleLabel})`,
        },
      ],
    };

    setExportSlips(prev => prev.map(s => s.id === slipId ? updatedSlip : s));
    showToast(`Đã xác nhận thực xuất phiếu ${slip.code}. Tồn kho đã được trừ chính xác.`);
    return true;
  };

  const cancelExportSlip = (slipId: string, reason: string) => {
    setExportSlips(prev => prev.map(s => {
      if (s.id === slipId) {
        return {
          ...s,
          status: 'cancelled',
          history: [
            ...s.history,
            {
              timestamp: new Date().toLocaleString('vi-VN'),
              action: 'Hủy phiếu xuất kho',
              performer: `${currentUser.name} (${currentUser.roleLabel})`,
              note: reason,
            },
          ],
        };
      }
      return s;
    }));
    showToast('Đã hủy phiếu xuất kho.', 'info');
  };

  // --- STOCKTAKE ACTIONS ---
  const createStocktake = (
    branchId: string, 
    items: { materialId: string; actualStock: number; differenceReason?: string }[], 
    note?: string
  ) => {
    const bName = branches.find(b => b.id === branchId)?.name || branchId;
    const slipNumber = String(stocktakes.length + 1).padStart(4, '0');
    const code = `PKK-2026-${slipNumber}`;

    const enrichedItems = items.map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      const systemStock = mat ? (mat.stocks[branchId] || 0) : 0;
      const diff = item.actualStock - systemStock;
      return {
        materialId: item.materialId,
        materialName: mat?.name || 'Nguyên vật liệu',
        unit: mat?.unit || 'đv',
        systemStock,
        actualStock: item.actualStock,
        difference: diff,
        differenceReason: item.differenceReason,
      };
    });

    const newStocktake: Stocktake = {
      id: `st-${Date.now()}`,
      code,
      branchId,
      branchName: bName,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      stocktakeDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      items: enrichedItems,
      note,
      hasAdjustmentProposed: false,
    };

    // QUY TẮC: Kiểm kê KHÔNG tự ý ghi đè số dư sổ kho
    setStocktakes(prev => [newStocktake, ...prev]);
    showToast(`Đã lưu kết quả kiểm đếm phiếu ${code}! Số dư sổ kho giữ nguyên.`);
  };

  const proposeStockAdjustment = (stocktakeId: string, reason: string) => {
    const st = stocktakes.find(s => s.id === stocktakeId);
    if (!st) return;

    const discrepancies = st.items.filter(i => i.difference !== 0);
    if (discrepancies.length === 0) {
      showToast('Đợt kiểm kê này khớp 100%, không cần điều chỉnh tồn!', 'info');
      return;
    }

    // Check if Owner is proposing: still needs approval record or can direct approve?
    // User requirement: "Chủ tạo yêu cầu vẫn phải thực hiện bước phê duyệt; không tự động bỏ qua quy trình."
    const approval: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      type: 'stock_adjustment',
      title: `Điều chỉnh tồn sau kiểm kê: ${st.code} (${st.branchName})`,
      branchId: st.branchId,
      branchName: st.branchName,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requestedAt: new Date().toLocaleString('vi-VN'),
      status: 'pending',
      referenceId: st.id,
      reason: reason || 'Điều chỉnh số dư sổ kho theo số lượng kiểm đếm thực tế.',
      details: {
        summaryText: `Điều chỉnh tồn sổ sách cho ${discrepancies.length} nguyên vật liệu có chênh lệch.`,
        before: discrepancies.map(i => ({ materialName: i.materialName, current: i.systemStock, unit: i.unit })),
        after: discrepancies.map(i => ({ materialName: i.materialName, adjusted: i.actualStock, unit: i.unit, diff: i.difference })),
      },
    };

    setApprovals(prev => [approval, ...prev]);
    setStocktakes(prev => prev.map(s => s.id === stocktakeId ? { ...s, hasAdjustmentProposed: true } : s));
    showToast('Đã gửi đề xuất điều chỉnh tồn kho sang Trung tâm Phê duyệt của Chủ cửa hàng!');
  };

  // --- SALES DATA ACTIONS ---
  const importSalesData = (
    period: string, 
    branchId: string, 
    items: { recipeId: string; quantity: number }[],
    overwrite: boolean = false
  ): boolean => {
    const existingIndex = salesRecords.findIndex(r => r.period === period && r.branchId === branchId);
    if (existingIndex >= 0 && !overwrite) {
      return false; // Ask user to confirm overwrite
    }

    const bName = branches.find(b => b.id === branchId)?.name || branchId;
    let totalRevenue = 0;

    const enrichedItems = items.map(item => {
      const rec = recipes.find(r => r.id === item.recipeId);
      const subtotal = rec ? rec.price * item.quantity : 0;
      totalRevenue += subtotal;
      return {
        recipeId: item.recipeId,
        recipeCode: rec?.code || 'DU',
        recipeName: rec?.name || 'Món bán',
        quantity: item.quantity,
        unitPrice: rec?.price || 0,
        subtotal,
      };
    });

    const newRecord: SalesRecord = {
      id: `sale-${Date.now()}`,
      period,
      branchId,
      branchName: bName,
      importedAt: new Date().toLocaleString('vi-VN'),
      importedBy: `${currentUser.name} (${currentUser.roleLabel})`,
      totalRevenue,
      items: enrichedItems,
    };

    if (existingIndex >= 0 && overwrite) {
      setSalesRecords(prev => {
        const next = [...prev];
        next[existingIndex] = newRecord;
        return next;
      });
      showToast(`Đã ghi đè dữ liệu bán hàng kỳ ${period} của ${bName}!`);
    } else {
      setSalesRecords(prev => [newRecord, ...prev]);
      showToast(`Đã nhập thành công dữ liệu bán hàng kỳ ${period} cho ${bName}!`);
    }
    return true;
  };

  // --- APPROVAL ACTIONS ---
  const approveRequest = (approvalId: string, note?: string) => {
    const appr = approvals.find(a => a.id === approvalId);
    if (!appr || appr.status !== 'pending') return;

    if (appr.type === 'stock_adjustment') {
      // Cập nhật số dư sổ kho cho chi nhánh
      const st = stocktakes.find(s => s.id === appr.referenceId);
      if (st) {
        setMaterials(prev => prev.map(m => {
          const matchItem = st.items.find(i => i.materialId === m.id);
          if (matchItem) {
            return {
              ...m,
              stocks: {
                ...m.stocks,
                [st.branchId]: matchItem.actualStock, // Cập nhật đúng số dư thực tế
              },
            };
          }
          return m;
        }));
        setStocktakes(prev => prev.map(s => s.id === st.id ? { ...s, status: 'adjusted' } : s));
      }
    } else if (appr.type === 'import_plan') {
      // Duyệt kế hoạch nhập: Chuyển phiếu nhập sang "approved" (Chờ nhận hàng) - CHƯA cộng tồn
      const slip = importSlips.find(s => s.id === appr.referenceId);
      if (slip) {
        setImportSlips(prev => prev.map(s => {
          if (s.id === slip.id) {
            return {
              ...s,
              status: 'approved',
              history: [
                ...s.history,
                {
                  timestamp: new Date().toLocaleString('vi-VN'),
                  action: 'Chủ cửa hàng phê duyệt kế hoạch nhập',
                  performer: `${currentUser.name} (Chủ cửa hàng)`,
                  note: note || 'Đã duyệt mua hàng. Chuyển sang chờ nhận hàng.',
                },
              ],
            };
          }
          return s;
        }));
      }
    } else if (appr.type === 'recipe_or_threshold') {
      // Kích hoạt công thức hoặc cập nhật định mức tồn
      const rec = recipes.find(r => r.id === appr.referenceId);
      if (rec) {
        setRecipes(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'active' } : r));
      }
    }

    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        return {
          ...a,
          status: 'approved',
          reviewNote: note,
          reviewedAt: new Date().toLocaleString('vi-VN'),
          reviewedBy: `${currentUser.name} (Chủ cửa hàng)`,
        };
      }
      return a;
    }));

    showToast(`Đã phê duyệt thành công yêu cầu: ${appr.title}`);
  };

  const rejectRequest = (approvalId: string, reason: string) => {
    const appr = approvals.find(a => a.id === approvalId);
    if (!appr || appr.status !== 'pending') return;

    if (appr.type === 'import_plan') {
      const slip = importSlips.find(s => s.id === appr.referenceId);
      if (slip) {
        setImportSlips(prev => prev.map(s => {
          if (s.id === slip.id) {
            return {
              ...s,
              status: 'rejected',
              rejectionReason: reason,
              history: [
                ...s.history,
                {
                  timestamp: new Date().toLocaleString('vi-VN'),
                  action: 'Chủ cửa hàng từ chối kế hoạch nhập',
                  performer: `${currentUser.name} (Chủ cửa hàng)`,
                  note: reason,
                },
              ],
            };
          }
          return s;
        }));
      }
    }

    setApprovals(prev => prev.map(a => {
      if (a.id === approvalId) {
        return {
          ...a,
          status: 'rejected',
          reviewNote: reason,
          reviewedAt: new Date().toLocaleString('vi-VN'),
          reviewedBy: `${currentUser.name} (Chủ cửa hàng)`,
        };
      }
      return a;
    }));

    showToast(`Đã từ chối đề xuất: ${appr.title}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeBranchId,
        setActiveBranchId,
        branches,
        activeBranch,
        materials,
        recipes,
        importSlips,
        exportSlips,
        stocktakes,
        salesRecords,
        approvals,
        toasts,
        showToast,
        removeToast,
        currentNav,
        setCurrentNav,
        activeTab,
        setActiveTab,
        viewDetailsId,
        setViewDetailsId,
        isGuideOpen,
        setIsGuideOpen,
        addMaterial,
        updateMaterial,
        deactivateMaterial,
        reactivateMaterial,
        addRecipe,
        updateRecipe,
        requestThresholdChange,
        createImportSlip,
        receiveImportGoods,
        cancelImportSlip,
        createExportSlip,
        confirmActualExport,
        cancelExportSlip,
        createStocktake,
        proposeStockAdjustment,
        importSalesData,
        approveRequest,
        rejectRequest,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
