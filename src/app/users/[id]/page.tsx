import { Suspense } from "react";
import UserDetailClient from "@/components/UserDetailClient";

export default async function UserDetailPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">加载中...</div>}>
      <UserDetailClient userId={id} />
    </Suspense>
  );
}