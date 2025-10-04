import { InfoBar } from "./_components/info-bar";
import { Sidebar } from "./_components/sidebar";
import { StoreAdminProvider } from "@/providers/store-admin-provider";

interface LayoutAdminProps {
  children: React.ReactNode;
}

const LayoutAdmin = ({ children }: LayoutAdminProps) => {
  return (
    <main>
      <Sidebar />
      <div className="md:pl-[300px]">
        <InfoBar />
        <div className="relative p-4 pt-20">
          <StoreAdminProvider>
            {children}
          </StoreAdminProvider>
        </div>
      </div>
    </main>
  );
};

export default LayoutAdmin;
