export type Role = 'chucuahang' | 'quanly' | 'ketoan' | 'nhanvien';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  roleLabel: string;
  avatar?: string;
  branchId?: string; // specific branch or 'all' for owner
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain?: boolean;
}

export type MaterialCategory = 
  | 'Cà phê hạt & Bột' 
  | 'Sữa & Chế phẩm sữa' 
  | 'Trà & Thảo mộc' 
  | 'Syrup & Mứt' 
  | 'Đường & Phụ gia' 
  | 'Bao bì & Ly tách';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  standardPrice: number; // VNĐ / unit
  stocks: Record<string, number>; // branchId -> stock quantity
  minStocks: Record<string, number>; // branchId -> min safety threshold
  status: 'active' | 'inactive';
  description?: string;
  supplier?: string;
  deactivationReason?: string;
}

export interface RecipeIngredient {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  costEstimate: number;
}

export interface Recipe {
  id: string;
  code: string;
  name: string;
  category: 'Cà phê truyền thống' | 'Cà phê pha máy' | 'Trà & Macchiato' | 'Đá xay & Sinh tố' | 'Bánh & Tráng miệng';
  price: number;
  ingredients: RecipeIngredient[];
  totalCostEstimate: number;
  status: 'active' | 'draft' | 'pending_approval';
  note?: string;
  updatedAt: string;
}

export type ImportSlipStatus = 
  | 'draft'               // Nháp
  | 'pending_approval'   // Chờ duyệt kế hoạch nhập
  | 'approved'           // Đã duyệt - Chờ nhận hàng
  | 'receiving'          // Đang kiểm hàng
  | 'completed'          // Đã hoàn thành (nhập kho)
  | 'rejected'           // Từ chối duyệt
  | 'cancelled';         // Đã hủy

export interface ImportSlipItem {
  materialId: string;
  materialName: string;
  unit: string;
  plannedQuantity: number;
  unitPrice: number;
  receivedQuantity?: number; // Số lượng nhận thực tế
  defectQuantity?: number;   // Số lượng lỗi/hỏng (trừ ra không cộng tồn)
  defectReason?: string;
  totalPrice: number;
}

export interface ImportSlip {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  creatorId: string;
  creatorName: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: ImportSlipStatus;
  items: ImportSlipItem[];
  totalAmount: number;
  note?: string;
  rejectionReason?: string;
  history: {
    timestamp: string;
    action: string;
    performer: string;
    note?: string;
  }[];
}

export type ExportSlipType = 
  | 'cap_quay'          // Xuất cấp quầy pha chế (Luân chuyển nội bộ)
  | 'huy_hong'          // Xuất hủy hỏng / hết hạn
  | 'chuyen_kho'        // Luân chuyển sang chi nhánh khác
  | 'khac';             // Xuất mục đích khác

export type ExportSlipStatus = 
  | 'draft'               // Nháp
  | 'pending_confirmation'// Chờ xác nhận thực xuất
  | 'completed'          // Đã thực xuất (đã trừ tồn)
  | 'cancelled';         // Đã hủy

export interface ExportSlipItem {
  materialId: string;
  materialName: string;
  unit: string;
  requestedQuantity: number;
  actualQuantity?: number;
  unitCost: number;
  totalCost: number;
}

export interface ExportSlip {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  type: ExportSlipType;
  creatorId: string;
  creatorName: string;
  requestDate: string;
  status: ExportSlipStatus;
  items: ExportSlipItem[];
  totalAmount: number;
  reason: string;
  targetBranchId?: string;
  isInternalTransfer?: boolean; // Luân chuyển nội bộ
  history: {
    timestamp: string;
    action: string;
    performer: string;
    note?: string;
  }[];
}

export interface StocktakeItem {
  materialId: string;
  materialName: string;
  unit: string;
  systemStock: number;      // Tồn sổ sách (chỉ Quản lý/Chủ thấy lúc lập/đối chiếu)
  actualStock: number;      // Tồn thực tế kiểm đếm
  difference: number;       // Chênh lệch (actual - system)
  differenceReason?: string;
}

export interface Stocktake {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  creatorId: string;
  creatorName: string;
  stocktakeDate: string;
  status: 'draft' | 'completed' | 'adjusted';
  items: StocktakeItem[];
  note?: string;
  hasAdjustmentProposed?: boolean;
}

export interface SalesRecordItem {
  recipeId: string;
  recipeCode: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesRecord {
  id: string;
  period: string; // e.g. "2026-W43" hoặc "Tháng 10/2026"
  branchId: string;
  branchName: string;
  importedAt: string;
  importedBy: string;
  totalRevenue: number;
  items: SalesRecordItem[];
}

export type ApprovalType = 
  | 'stock_adjustment'     // Điều chỉnh tồn kho (từ kiểm kê)
  | 'import_plan'          // Kế hoạch nhập hàng
  | 'recipe_or_threshold'; // Công thức hoặc định mức tồn

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  branchId: string;
  branchName: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  referenceId: string; // ID của Stocktake, ImportSlip, Recipe, Threshold
  reason: string;
  details: {
    before?: any;
    after?: any;
    summaryText: string;
    impactAmount?: number;
  };
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
