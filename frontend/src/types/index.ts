export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  telegram_chat_id?: string;
  telegram_alerts_enabled?: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon_name?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  category_id?: number;
  category?: Category;
  expiry_date: string;
  mfd_date?: string;
  purchase_date?: string;
  quantity: number;
  unit?: string;
  batch_number?: string;
  ocr_confidence?: number;
  image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  status: 'safe' | 'expiring_soon' | 'expired';
  days_until_expiry: number;
}

export interface DashboardStats {
  total_products: number;
  expiring_7_days_count: number;
  expired_count: number;
  safe_count: number;
  categories_breakdown: Record<string, number>;
  expiring_soon_products: Product[];
  recently_added: Product[];
}

export interface AIOCRResult {
  product_name: string;
  brand?: string;
  category: string;
  category_id: number;
  expiry_date?: string;
  mfd_date?: string;
  batch_number?: string;
  confidence_score: number;
  raw_ocr_text: string;
  image_url: string;
  explanation: string;
}
