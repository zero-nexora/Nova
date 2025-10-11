import { Unauthorized } from "@/components/global/unauthorized";
import { auth } from "@clerk/nextjs/server";

interface CartLayoutProps {
  children: React.ReactNode;
}

const CartLayout = async ({ children }: CartLayoutProps) => {
  const { userId } = await auth();

  if (!userId) return <Unauthorized />;

  return <>{children}</>;
};

export default CartLayout;
