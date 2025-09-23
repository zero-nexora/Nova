import { BlurPage } from "@/components/global/blur-page";
import { InfoBar } from "./_components/info-bar";
import { Sidebar } from "./_components/sidebar";
import { StoreAdminProvider } from "@/providers/store-admin-provider";

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
          <StoreAdminProvider>
            <BlurPage>{children}</BlurPage>
          </StoreAdminProvider>
        </div>
      </div>
    </main>
  );
};

export default LayoutAdmin;
