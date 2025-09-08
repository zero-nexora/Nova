import { MenuOptions } from "./menu-options";

export const Sidebar = () => {
  return (
    <>
      <MenuOptions defaultOpen />
      <MenuOptions defaultOpen={false} />
    </>
  );
};
