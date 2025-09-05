import { Categories } from "@prisma/client";

export interface CategorySeedType {
  name: string;
  slug: string;
  image_url: string;
  public_id: string | null;
  children?: CategorySeedType[];
}

export type CategoryTree = Categories & { children: CategoryTree[] };