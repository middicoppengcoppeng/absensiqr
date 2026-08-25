'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, UserSquare2, BookOpen, Calendar, Camera, History, FileBarChart, Settings, LogOut } from 'lucide-react';

export default function Sidebar({ role }: { role: 'ADMIN' | 'TEACHER' }) {
  const [schoolName, setSchoolName] = useState('Sistem Absensi');
  const [isOpen, setIsOpen] = useState(false);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const schoolSetting = data.find(s => s.id === 'school_name');
      if (schoolSetting) setSchoolName(schoolSetting.value);
    }
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener('settingsUpdated', fetchSettings);
    
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handleToggle);
    
    return () => {
      window.removeEventListener('settingsUpdated', fetchSettings);
      window.removeEventListener('toggleSidebar', handleToggle);
    };
  }, []);

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Siswa', href: '/admin/students', icon: Users },
    { name: 'Guru', href: '/admin/teachers', icon: UserSquare2 },
    { name: 'Kelas', href: '/admin/classes', icon: BookOpen },
    { name: 'Sesi Absensi', href: '/admin/sessions', icon: Calendar },
    { name: 'Laporan', href: '/admin/reports', icon: FileBarChart },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Siswa', href: '/teacher/students', icon: Users },
    { name: 'Sesi Absensi', href: '/teacher/sessions', icon: Calendar },
    { name: 'Scan Absensi', href: '/teacher/scan', icon: Camera },
    { name: 'Laporan', href: '/teacher/reports', icon: FileBarChart },
    { name: 'Riwayat', href: '/teacher/history', icon: History },
  ];

  const links = role === 'ADMIN' ? adminLinks : teacherLinks;

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`w-[240px] bg-blue-600 border-r border-blue-700 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="px-6 py-4 border-b border-blue-500 flex flex-col justify-center">
        <span className="font-bold text-lg text-white truncate leading-tight">{schoolName}</span>
        <span className="text-xs text-blue-200 mt-0.5">Sistem Absensi Digital QR-Code</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = false; // TODO: Implement active state check with usePathname
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-500 text-white font-medium' 
                  : 'text-blue-100 hover:bg-blue-500/50 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
}
