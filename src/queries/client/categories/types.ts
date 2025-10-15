export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  subcategories: Subcategory[];
}

