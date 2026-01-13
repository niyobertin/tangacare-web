import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    FileText,
    CreditCard,

    LogOut,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { label: 'Patients', path: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { label: 'Doctors', path: '/doctors', icon: Stethoscope, roles: ['admin', 'receptionist'] },
    { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { label: 'Medical Records', path: '/records', icon: FileText, roles: ['admin', 'doctor', 'nurse'] },
    { label: 'Billing', path: '/billing', icon: CreditCard, roles: ['admin', 'receptionist'] },
    { label: 'Health Tips', path: '/health-tips', icon: Activity, roles: ['admin', 'doctor'] },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const { user, logout } = useAuth();
    const userRole = user?.role || 'patient';

    const filteredNavItems = NAV_ITEMS.filter(item =>
        item.roles.includes(userRole as UserRole)
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:w-20" : "lg:w-64",
                "w-64" // Mobile always full width
            )}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className={cn(
                        "h-20 flex items-center justify-between border-b border-slate-100 transition-all duration-300",
                        isCollapsed ? "px-2 justify-center" : "px-6"
                    )}>
                        {isCollapsed ? (
                            <button
                                onClick={onToggleCollapse}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                                title="Expand Sidebar"
                            >
                                <Logo variant="icon" className="scale-75" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 w-full">
                                <Logo variant="icon" className="h-10 w-10 min-w-10 rounded-xl" />
                                <div className="flex flex-col overflow-hidden">
                                    <h1 className="font-extrabold text-base text-slate-900 leading-none tracking-tight">
                                        Tangacare
                                    </h1>
                                </div>
                                <button onClick={onToggleCollapse} className="ml-auto text-slate-400 hover:text-slate-600">
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="w-5 h-0.5 bg-current rounded-full"></div>
                                        <div className="w-3 h-0.5 bg-current rounded-full"></div>
                                        <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {filteredNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center text-sm font-medium rounded-lg transition-colors relative group",
                                    isCollapsed ? "justify-center px-3 py-3" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                                {!isCollapsed && item.label}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className={cn(
                        "p-4 border-t border-slate-100",
                        isCollapsed && "px-2"
                    )}>
                        {!isCollapsed && (
                            <div className="flex items-center mb-4 px-2">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                                </div>
                            </div>
                        )}

                        {isCollapsed && (
                            <div className="flex justify-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={logout}
                            className={cn(
                                "w-full flex items-center text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                                isCollapsed ? "justify-center px-3 py-3" : "justify-center px-3 py-2"
                            )}
                            title={isCollapsed ? "Sign Out" : undefined}
                        >
                            <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
                            {!isCollapsed && "Sign Out"}
                        </button>
                    </div>

                    {/* Toggle Button (Desktop only) */}

                </div>
            </aside>
        </>
    );
}
