import Link from "next/link";

export default function ForbiddenPage() {
  return <main className="min-h-screen bg-[#fcf9f3] flex flex-col items-center justify-center gap-5 text-[#2b1810] px-6 text-center">
    <span className="text-5xl font-bold">403</span>
    <h1 className="text-2xl font-bold">Bạn không có quyền truy cập trang này</h1>
    <p>Vui lòng dùng tài khoản được cấp quyền phù hợp.</p>
    <Link className="rounded-full bg-[#2b1810] px-5 py-3 text-white" href="/products">Về trang sản phẩm</Link>
  </main>;
}
