'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/hooks/use-auth';
import { logout } from '@/lib/firebase/auth';
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { user, userData, organization } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleCreateCampaign = () => {
    router.push('/dashboard/campaigns/new');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-white shadow-sm",
      className
    )}>
      <div className="flex h-16 items-center px-6">
        {/* Logo - only show on mobile since sidebar has it on desktop */}
        <div className="flex md:hidden items-center">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">Scratch TIX</span>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          {/* Search */}
          <div className="w-full max-w-lg md:max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Campaign Button */}
            <Button onClick={handleCreateCampaign} size="sm" className="hidden md:flex">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>

            {/* Mobile Create Button */}
            <Button onClick={handleCreateCampaign} size="sm" className="md:hidden">
              <Plus className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Help */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {userData?.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {organization?.name || 'Organization'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/dashboard/settings/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
