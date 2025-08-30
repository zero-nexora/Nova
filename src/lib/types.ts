import { Categories } from "@prisma/client";

export interface CategorySeed {
  name: string;
  slug: string;
  images: string[];
  children?: CategorySeed[];
}

export type CategoryTree = Categories & { children: CategoryTree[] };
