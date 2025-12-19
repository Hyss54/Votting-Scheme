'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, FileText, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Nominees', href: '/admin/nominees', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-primary-200 text-sm mt-1">Awards Voting System</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-white/20 font-medium'
                                            : 'hover:bg-white/10'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-primary-600">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-white/10 transition-all"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 min-h-screen">
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {navigation.find((item) => item.href === pathname)?.name || 'Admin'}
                    </h2>
                </header>
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
