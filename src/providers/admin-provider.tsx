"use client";

import { useUser } from "@clerk/nextjs";

interface AdminProviderProps {
  children: React.ReactNode
}

export const AdminProvider = ({children}: AdminProviderProps) => {
  const user = useUser();
  
  return (
    <div>AdminProvider</div>
  )
}
