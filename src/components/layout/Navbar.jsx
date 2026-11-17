import {
  Bell,
  ChevronDown,
  Menu,
  UserRound,
  LogOut,
  Search,
  CalendarClock,
  Clock3,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ThemeToggle from '../common/ThemeToggle';
import useAuthStore from '../../store/authStore';
import leadService from '../../services/leadService';
import timeZones from '../../data/timeZone.json';

const roleLabel = (r) =>
  r === 'super_admin'
    ? 'Super Admin'
    : r === 'lead_user'
      ? 'Lead User'
      : 'Admin';

export default function Navbar({ onMenuClick = () => {} }) {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notices, setNotices] = useState([]);

  const [timeZoneOpen, setTimeZoneOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(timeZones[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZoneSearch, setTimeZoneSearch] = useState('');

  // One ref per dropdown wrapper (button + menu). A click anywhere
  // outside that wrapper closes the menu.
  const timeZoneRef = useRef(null);
  const noticeRef = useRef(null);
  const profileRef = useRef(null);

  /* --------------------------------
     GET FOLLOW-UP NOTIFICATIONS
  -------------------------------- */

  useEffect(() => {
    let alive = true;

    leadService
      .getFollowUps()
      .then((r) => {
        if (!alive) return;

        const a = Array.isArray(r)
          ? r
          : r?.followUps || r?.data || [];

        setNotices(a.slice(0, 8));
      })
      .catch(() => {
        if (alive) {
          setNotices([]);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  /* --------------------------------
     LIVE CLOCK
  -------------------------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* --------------------------------
     CLOSE DROPDOWNS ON OUTSIDE CLICK / ESC
  -------------------------------- */

  useEffect(() => {
    if (!timeZoneOpen && !noticeOpen && !profileOpen) return;

    const closeTimeZone = () => {
      setTimeZoneOpen(false);
      setTimeZoneSearch('');
    };

    const handlePointerDown = (e) => {
      const target = e.target;

      if (
        timeZoneOpen &&
        timeZoneRef.current &&
        !timeZoneRef.current.contains(target)
      ) {
        closeTimeZone();
      }

      if (
        noticeOpen &&
        noticeRef.current &&
        !noticeRef.current.contains(target)
      ) {
        setNoticeOpen(false);
      }

      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeTimeZone();
        setNoticeOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [timeZoneOpen, noticeOpen, profileOpen]);

  /* --------------------------------
     FORMAT SELECTED TIMEZONE
  -------------------------------- */

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: selectedZone.zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(currentTime);

  /* --------------------------------
     FILTER TIMEZONES
  -------------------------------- */

  const filteredTimeZones = timeZones.filter((zone) => {
    const search = timeZoneSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      zone.name.toLowerCase().includes(search) ||
      zone.city.toLowerCase().includes(search) ||
      zone.zone.toLowerCase().includes(search)
    );
  });

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* =========================================
            LEFT SIDE
        ========================================== */}

        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU */}

          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="icon-btn lg:hidden"
          >
            <Menu size={18} />
          </button>

          {/* TITLE */}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
              SALES GENERATOR Workspace
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              Sales operations & client management
            </p>
          </div>
        </div>

        {/* =========================================
            RIGHT SIDE
        ========================================== */}

        <div className="flex items-center gap-1.5">

          {/* =====================================
              TIMEZONE
          ====================================== */}

          <div ref={timeZoneRef} className="relative hidden lg:block">

            <button
              onClick={() => {
                setTimeZoneOpen((v) => !v);
                setNoticeOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Select timezone"
            >
              <Clock3
                size={17}
                className="shrink-0 text-slate-500"
              />

              <div className="flex items-center gap-2">

                {/* COUNTRY */}

                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedZone.name}
                </span>

                {/* TIME */}

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formattedTime}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  timeZoneOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* =================================
                TIMEZONE DROPDOWN
            ================================== */}

            {timeZoneOpen && (
              <>

                {/* DROPDOWN */}

                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                  {/* HEADER */}

                  <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      World Clock
                    </p>

                    <p className="text-xs text-slate-500">
                      Select a country or timezone
                    </p>

                    {/* SEARCH */}

                    <div className="relative mt-2">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={timeZoneSearch}
                        onChange={(e) =>
                          setTimeZoneSearch(e.target.value)
                        }
                        placeholder="Search country or city..."
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* COUNTRIES */}

                  <div className="mt-1 max-h-80 overflow-auto">

                    {filteredTimeZones.length > 0 ? (
                      filteredTimeZones.map((zone) => (
                        <button
                          key={zone.zone}
                          onClick={() => {
                            setSelectedZone(zone);
                            setTimeZoneOpen(false);
                            setTimeZoneSearch('');
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                            selectedZone.zone === zone.zone
                              ? 'bg-slate-100 dark:bg-slate-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {zone.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {zone.city}
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                              {zone.zone}
                            </p>
                          </div>

                          {selectedZone.zone === zone.zone && (
                            <span className="ml-2 shrink-0 text-xs font-semibold text-slate-500">
                              Selected
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Clock3
                          size={22}
                          className="mx-auto mb-2 text-slate-300"
                        />

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          No timezone found
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Try another country or city.
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}
          </div>

          {/* =====================================
              SEARCH
          ====================================== */}

          <button
            onClick={() => nav('/admin/leads')}
            className="icon-btn hidden sm:inline-flex"
            title="Search leads"
          >
            <Search size={18} />
          </button>

          {/* =====================================
              NOTIFICATIONS
          ====================================== */}

          <div ref={noticeRef} className="relative">

            <button
              onClick={() => {
                setNoticeOpen((v) => !v);
                setProfileOpen(false);
                setTimeZoneOpen(false);
              }}
              className="icon-btn relative"
              aria-label="Notifications"
            >
              <Bell size={18} />

              {notices.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}

            {noticeOpen && (
              <>

                <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                  {/* HEADER */}

                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-semibold">
                      Notifications
                    </p>

                    <p className="text-xs text-slate-500">
                      Follow-ups and work needing attention
                    </p>
                  </div>

                  {/* NOTICES */}

                  {notices.length ? (
                    <div className="max-h-80 overflow-auto p-2">

                      {notices.map((n, i) => (
                        <button
                          key={n?.id || i}
                          onClick={() => {
                            setNoticeOpen(false);

                            nav(
                              n?.leadId
                                ? `/admin/leads/${n.leadId}`
                                : '/admin/leads'
                            );
                          }}
                          className="flex w-full gap-3 rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <span className="icon-tile h-9 w-9 shrink-0">
                            <CalendarClock size={16} />
                          </span>

                          <span className="min-w-0">

                            <b className="block truncate text-sm">
                              {n?.lead?.name ||
                                n?.leadName ||
                                'Lead follow-up'}
                            </b>

                            <span className="block truncate text-xs text-slate-500">
                              {n?.note ||
                                n?.title ||
                                n?.followUpDate ||
                                'Follow-up requires attention'}
                            </span>

                          </span>
                        </button>
                      ))}

                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center">
                      <Bell
                        size={24}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-semibold">
                        You're all caught up
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        New follow-ups will appear here.
                      </p>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>

          {/* =====================================
              THEME TOGGLE
          ====================================== */}

          <ThemeToggle />

          {/* =====================================
              PROFILE
          ====================================== */}

          <div ref={profileRef} className="relative ml-1">

            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNoticeOpen(false);
                setTimeZoneOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {/* AVATAR */}

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>

              {/* USER DETAILS */}

              <span className="hidden text-left md:block">
                <span className="block max-w-36 truncate text-sm font-semibold">
                  {user?.name || 'User'}
                </span>

                <span className="block text-[11px] text-slate-500">
                  {roleLabel(user?.role)}
                </span>
              </span>

              <ChevronDown
                size={14}
                className="hidden text-slate-400 md:block"
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <>

                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                  {/* USER INFO */}

                  <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold">
                      {user?.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* PROFILE */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      nav('/admin/profile');
                    }}
                    className="menu-action"
                  >
                    <UserRound size={16} />
                    My Profile
                  </button>

                  {/* LOGOUT */}

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="menu-action text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}