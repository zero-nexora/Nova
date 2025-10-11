import { auth } from "@clerk/nextjs/server";
import { Unauthorized } from "@/components/global/unauthorized";

interface WishlistLayoutProps {
  children: React.ReactNode;
}

const WishlistLayout = async ({ children }: WishlistLayoutProps) => {
  const { userId } = await auth();

  if (!userId) return <Unauthorized />;

  return <>{children}</>;
};

export default WishlistLayout;
