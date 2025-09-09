
import React, { useState } from 'react';
import { RecordIcon } from './icons/RecordIcon';
import { NotificationIcon } from './icons/NotificationIcon';
import type { User } from '../types';

interface HeaderProps {
    user: User;
    notifications: { id: string, text: string, relatedId?: string }[];
    onNotificationClick: (id: string, relatedId?: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, onNotificationClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleNotificationItemClick = (notif: HeaderProps['notifications'][0]) => {
    onNotificationClick(notif.id, notif.relatedId);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RecordIcon className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">RecordCollect.ing</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(prev => !prev)} className="relative text-gray-400 hover:text-white">
                <NotificationIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg animate-fade-in">
                  <div className="p-3 font-semibold border-b border-gray-700">Notifications</div>
                  {notifications.length > 0 ? (
                    <ul className="py-1">
                      {notifications.map(notif => (
                        <li key={`${notif.id}-${notif.relatedId}`}>
                          <button
                            onClick={() => handleNotificationItemClick(notif)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition"
                          >
                            {notif.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-3 text-sm text-gray-400">No new notifications.</p>
                  )}
                </div>
              )}
            </div>
            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full border-2 border-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
