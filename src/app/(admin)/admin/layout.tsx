import { auth } from "@clerk/nextjs/server";
import { InfoBar } from "./_components/info-bar";
import { Sidebar } from "./_components/sidebar";
import { StoreAdminProvider } from "@/providers/store-admin-provider";
import { Unauthorized } from "@/components/global/unauthorized";

interface LayoutAdminProps {
  children: React.ReactNode;
}

const LayoutAdmin = async ({ children }: LayoutAdminProps) => {
  const { userId } = await auth();

  if (!userId) return <Unauthorized />;
  
  return (
    <main>
      <Sidebar />
      <div className="md:pl-[300px]">
        <InfoBar />
        <div className="relative p-4 pt-20">
          <StoreAdminProvider>{children}</StoreAdminProvider>
        </div>
      </div>
    </main>
  );
};

export default LayoutAdmin;
