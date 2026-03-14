import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="border-b border-gray-100 px-4">
        <div className="max-w-lg mx-auto h-12 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
            Paragraf
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            + Neues Dokument
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
