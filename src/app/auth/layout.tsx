import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold">LinkUp</Link>
        </div>
        {children}
      </div>
    </div>
  );
}