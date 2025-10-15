import { RoleName } from "@prisma/client";

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  image_url: string | null;
  roles: {
    id: string;
    role: {
      id: string;
      name: RoleName;
      description: string | null;
    };
  }[];
}

export interface UserByRoleResponse {
  items: User[];
  totalItems: number;
  page: number;
  limit: number;
}
