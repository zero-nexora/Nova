import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/global/theme-toggle";

export const InfoBar = () => {
  return (
    <header className="fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]">
      <div className="flex items-center gap-2 ml-auto">
        <UserButton />
        <ThemeToggle />
      </div>
    </header>
  );
};
