import { Home, Box, Tag, ShoppingCart, Settings, Key } from "lucide-react";

const PREFIX = "/admin";
export const MAX_FILES = 10;
export const MAX_FILE_CATEGORY = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;
export const DEBOUNCEDSEARCH = 300;
export const placeholderImage = "/placeholder.png";

export const sidebarRoutes = [
  {
    label: "Dashboard",
    path: `${PREFIX}/dashboard`,
    icon: Home,
  },
  {
    label: "Product",
    path: `${PREFIX}/products`,
    icon: Box,
  },
  {
    label: "Category",
    path: `${PREFIX}/categories`,
    icon: Tag,
  },
  {
    label: "Role & Permission",
    path: `${PREFIX}/roles`,
    icon: Key,
  },
  {
    label: "Order",
    path: `${PREFIX}/orders`,
    icon: ShoppingCart,
  },
  {
    label: "Setting",
    path: `${PREFIX}/settings`,
    icon: Settings,
  },
];

export const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Smartphones",
        slug: "smartphones",
        image_url: "",
        public_id: "",
      },
      { name: "Laptops", slug: "laptops", image_url: "", public_id: "" },
      { name: "Cameras", slug: "cameras", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Clothing",
    slug: "clothing",
    image_url: "",
    public_id: "clothing-img",
    subcategories: [
      { name: "Men", slug: "men-clothing", image_url: "", public_id: "" },
      { name: "Women", slug: "women-clothing", image_url: "", public_id: "" },
      { name: "Kids", slug: "kids-clothing", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Tables", slug: "tables", image_url: "", public_id: "" },
      { name: "Chairs", slug: "chairs", image_url: "", public_id: "" },
      { name: "Beds", slug: "beds", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Books",
    slug: "books",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Fiction", slug: "fiction-books", image_url: "", public_id: "" },
      {
        name: "Non-fiction",
        slug: "non-fiction-books",
        image_url: "",
        public_id: "",
      },
      { name: "Comics", slug: "comics", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Skincare", slug: "skincare", image_url: "", public_id: "" },
      { name: "Makeup", slug: "makeup", image_url: "", public_id: "" },
      { name: "Hair Care", slug: "hair-care", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Fitness", slug: "fitness", image_url: "", public_id: "" },
      { name: "Outdoor", slug: "outdoor-sports", image_url: "", public_id: "" },
      {
        name: "Team Sports",
        slug: "team-sports",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Toys",
    slug: "toys",
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Educational",
        slug: "educational-toys",
        image_url: "",
        public_id: "",
      },
      {
        name: "Action Figures",
        slug: "action-figures",
        image_url: "",
        public_id: "",
      },
      {
        name: "Board Games",
        slug: "board-games",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Car Accessories",
        slug: "car-accessories",
        image_url: "",
        public_id: "",
      },
      {
        name: "Motorcycles",
        slug: "motorcycles",
        image_url: "",
        public_id: "",
      },
      {
        name: "Car Electronics",
        slug: "car-electronics",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Groceries",
    slug: "groceries",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Beverages", slug: "beverages", image_url: "", public_id: "" },
      { name: "Snacks", slug: "snacks", image_url: "", public_id: "" },
      {
        name: "Fresh Produce",
        slug: "fresh-produce",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Rings", slug: "rings", image_url: "", public_id: "" },
      { name: "Necklaces", slug: "necklaces", image_url: "", public_id: "" },
      { name: "Bracelets", slug: "bracelets", image_url: "", public_id: "" },
    ],
  },
  {
    name: "Home Appliances",
    slug: "home-appliances",
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Kitchen",
        slug: "kitchen-appliances",
        image_url: "",
        public_id: "",
      },
      {
        name: "Laundry",
        slug: "laundry-appliances",
        image_url: "",
        public_id: "",
      },
      {
        name: "Cleaning",
        slug: "cleaning-appliances",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    image_url: "",
    public_id: "",
    subcategories: [
      { name: "Dog", slug: "dog-supplies", image_url: "", public_id: "" },
      { name: "Cat", slug: "cat-supplies", image_url: "", public_id: "" },
      { name: "Fish", slug: "fish-supplies", image_url: "", public_id: "" },
    ],
  },
];

export const attributesData = [
  {
    name: "Color",
    values: [{ value: "Red" }, { value: "Blue" }, { value: "Green" }],
  },
  {
    name: "Size",
    values: [{ value: "Small" }, { value: "Medium" }, { value: "Large" }],
  },
  {
    name: "Material",
    values: [{ value: "Cotton" }, { value: "Wool" }, { value: "Silk" }],
  },
];
