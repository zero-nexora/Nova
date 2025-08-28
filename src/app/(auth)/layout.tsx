interface LayoutAuthProps {
  children: React.ReactNode;
}

const LayoutAuth = ({ children }: LayoutAuthProps) => {
  return (
    <main className="h-full flex items-center justify-center">{children}</main>
  );
};

export default LayoutAuth;
