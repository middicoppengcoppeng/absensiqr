import Sidebar from '@/components/ui/Sidebar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="md:ml-[240px]">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
