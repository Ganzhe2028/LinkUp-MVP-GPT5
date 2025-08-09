import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">LinkUp：找到合拍的队友</h1>
      <p className="text-gray-600 text-center mb-8 max-w-xl">
        一句话价值：用共同技能和活跃度为你推荐最合适的队友，点击即可查看联系方式。
      </p>
      <Link
        href="/auth"
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
      >
        立即开始
      </Link>
    </div>
  );
}
