import Sidebar from '@/components/ui/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <div className="md:ml-[240px]">
        {/* Header will be placed in individual pages so they can control the title, or we can make a client component that reads the path. For now, pages handle their own headers. */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
