// src/app/shared/cart-item.model.ts
import { ShopDetails } from './shop-details.model';

// ✅ CORRECT - Match C# property name (capital P)
export interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  product: ShopDetails;  // C# serializes as lowercase by default
}