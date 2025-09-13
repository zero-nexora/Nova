import { BlurPage } from "@/components/global/blur-page";
import { InfoBar } from "./_components/info-bar";
import { Sidebar } from "./_components/sidebar";
import { StoreProvider } from "@/providers/store-provider";

interface LayoutAdminProps {
  children: React.ReactNode;
}

const LayoutAdmin = ({ children }: LayoutAdminProps) => {
  return (
    <main className="h-screen overflow-hidden">
      <Sidebar />
      <div className="md:pl-[300px]">
        <InfoBar />
        <div className="relative">
          <StoreProvider>
            <BlurPage>{children}</BlurPage>
          </StoreProvider>
        </div>
      </div>
    </main>
  );
};

export default LayoutAdmin;
