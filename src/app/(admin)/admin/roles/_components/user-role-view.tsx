import { UserFilter } from "./user-filter"
import { UserRolesTable } from "./user-roles-table"


export const UserRoleView = () => {
  return (
    <div className="space-y-4">
      <UserFilter />
      <UserRolesTable />
    </div>
  )
}
