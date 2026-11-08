import React, { forwardRef, useMemo } from 'react';
import { Star, Calendar, CheckCircle2, MapPin, Building2 } from 'lucide-react';
import { formatNumber } from '../utils/github';

export const GithubLogo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// Real GitHub contribution colors
const GITHUB_DARK_LEVEL_COLORS = [
  '#161b22', // Level 0
  '#0e4429', // Level 1
  '#006d32', // Level 2
  '#26a641', // Level 3
  '#39d353', // Level 4
];

const GITHUB_LIGHT_LEVEL_COLORS = [
  '#ebedf0', // Level 0
  '#9be9a8', // Level 1
  '#40c463', // Level 2
  '#30a14e', // Level 3
  '#216e39', // Level 4
];

export const ProfileCard = forwardRef(({ data, theme = 'light' }, ref) => {
  if (!data) return null;

  const isDark = theme === 'dark';
  const levelColors = isDark ? GITHUB_DARK_LEVEL_COLORS : GITHUB_LIGHT_LEVEL_COLORS;

  const languages = data.languagesList || [];
  const streak = data.streak || { currentStreak: 0, longestStreak: 0, totalContributions: 0, calendarDays: [] };
  const calendarDays = streak.calendarDays || [];

  // Calculate active contribution days in the period
  const activeDays = useMemo(() => {
    const count = calendarDays.filter(d => (d.count || 0) > 0).length;
    if (count > 0) return count;
    return streak.totalContributions > 0 ? Math.min(streak.totalContributions, 52) : 0;
  }, [calendarDays, streak.totalContributions]);

  // Compute month markers aligned to calendar columns
  const { monthLabels, numCols } = useMemo(() => {
    const cols = Math.max(1, Math.ceil(calendarDays.length / 7));
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;
    let lastCol = -99;

    for (let c = 0; c < cols; c++) {
      const day = calendarDays[c * 7];
      if (day && day.date && !day.date.startsWith('day-')) {
        const d = new Date(day.date);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          if (m !== lastMonth) {
            if (c - lastCol < 3) {
              if (lastCol === 0 && labels.length === 1) {
                labels.pop();
                labels.push({ col: c, name: monthNames[m] });
                lastCol = c;
              }
            } else {
              labels.push({ col: c, name: monthNames[m] });
              lastCol = c;
            }
            lastMonth = m;
          }
        }
      }
    }

    if (labels.length === 0 && calendarDays.length > 0) {
      const fallbackMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      const step = Math.max(1, Math.floor(cols / fallbackMonths.length));
      fallbackMonths.forEach((name, idx) => {
        labels.push({ col: Math.min(cols - 1, idx * step + 1), name });
      });
    }

    return { monthLabels: labels, numCols: cols };
  }, [calendarDays]);

  return (
    <div
      ref={ref}
      id="github-profile-card"
      style={{
        backgroundColor: isDark ? '#0a0a0c' : '#ffffff',
        background: isDark ? '#0a0a0c' : '#ffffff',
        borderRadius: '24px',
        boxShadow: isDark 
          ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)' 
          : '0 20px 45px -15px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
      }}
      className={`relative w-full max-w-[1140px] min-h-[560px] p-8 sm:p-10 select-none overflow-hidden flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'text-white' : 'text-neutral-900'
      }`}
    >
      {/* Big White/Black GitHub Logo on Top Right Corner */}
      <div className="absolute top-8 right-8 sm:top-9 sm:right-9 pointer-events-none z-20">
        <GithubLogo className={`w-10 h-10 sm:w-11 sm:h-11 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch flex-1">
        
        {/* Left Column: Profile, Stats, and Languages at the Bottom */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Top Section: Avatar, Name, Bio, and Stats Stack */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src={data.avatarUrl}
                alt={data.name || data.login}
                crossOrigin="anonymous"
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 shrink-0 shadow-lg ${
                  isDark ? 'ring-white/20' : 'ring-black/10'
                }`}
              />

              <div className="min-w-0">
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${
                  isDark ? 'text-white' : 'text-neutral-950'
                }`}>
                  {data.name || data.login}
                </h1>
                <p className={`text-sm sm:text-base font-medium mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  @{data.login}
                </p>
              </div>
            </div>

            {/* Bio directly on canvas with no box */}
            {data.bio && (
              <p className={`text-sm sm:text-base font-normal leading-relaxed pt-1 ${
                isDark ? 'text-neutral-200' : 'text-neutral-700'
              }`}>
                {data.bio}
              </p>
            )}

            {/* Stats Enclosed in Liquid Glassmorphism Box with Editorial Serif Typography */}
            <div
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : 'linear-gradient(145deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 20px 0 rgba(255, 255, 255, 0.02), 0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                  : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
                fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, Cambria, serif",
              }}
              className="p-5 sm:p-5.5 rounded-2xl space-y-2.5 relative overflow-hidden font-editorial"
            >
              {/* Subtle liquid glass ambient light */}
              <div 
                aria-hidden="true" 
                className={`absolute -top-10 -left-10 w-28 h-28 rounded-full blur-xl pointer-events-none ${
                  isDark ? 'bg-white/10' : 'bg-black/[0.03]'
                }`} 
              />

              {/* Total Public Repos */}
              <p className={`text-[19px] sm:text-[21px] tracking-normal leading-snug relative z-10 whitespace-nowrap ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                Total Public Repos : <span className="font-normal">{formatNumber(data.publicRepos)}</span>
              </p>

              {/* Followers */}
              <p className={`text-[19px] sm:text-[21px] tracking-normal leading-snug relative z-10 whitespace-nowrap ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                Followers : <span className="font-normal">{formatNumber(data.followers)}</span>
              </p>

              {/* Following */}
              <p className={`text-[19px] sm:text-[21px] tracking-normal leading-snug relative z-10 whitespace-nowrap ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                Following : <span className="font-normal">{formatNumber(data.following)}</span>
              </p>

              {/* Total Stars Earned - Single paragraph flow with glyph to prevent any foreignObject overlap */}
              <p className={`text-[19px] sm:text-[21px] tracking-normal leading-snug relative z-10 whitespace-nowrap ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                Total Stars Earned :{' '}
                <span className={`${isDark ? 'text-amber-400' : 'text-amber-500'} font-normal`}>
                  ★ {formatNumber(data.totalStars)}
                </span>
              </p>
            </div>
          </div>

          {/* Bottom Left: Languages in curved thin border box */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-neutral-50/90 border-black/8'
          }`}>
            <div className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              <span>Most Used Languages</span>
              <span className={`text-[10px] font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Codebase</span>
            </div>

            {languages.length > 0 ? (
              <>
                <div className={`w-full h-2 rounded-full overflow-hidden flex gap-[1px] ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                }`}>
                  {languages.map((lang) => (
                    <div
                      key={lang.name}
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color,
                      }}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className={`font-semibold text-[11px] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {lang.name}
                      </span>
                      <span className={`text-[11px] font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {lang.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className={`text-xs py-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                No language data available
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Profile Meta, Contribution Graph, 3 Boxes - Shifted down with comfortable top spacing */}
        <div className="lg:col-span-7 flex flex-col justify-between pt-6 sm:pt-8 space-y-5">
          
          {/* Top Right: Liquid Glass Pills for Joined Date and github.com/username (with pr-16 padding so they never touch GitHub logo) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pr-14 sm:pr-16">
            {data.joinedDate && (
              <div
                style={{
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)'
                    : 'linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.01) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.20)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.35)'
                    : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 ${
                  isDark ? 'text-white' : 'text-neutral-800'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-neutral-300' : 'text-neutral-500'}`} />
                <span>Joined {data.joinedDate}</span>
              </div>
            )}

            <div
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)'
                  : 'linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.01) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.20)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.35)'
                  : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full shrink-0 ${
                isDark ? 'text-white' : 'text-neutral-800'
              }`}
            >
              github.com/{data.login}
            </div>
          </div>

          {/* Middle: Contribution Activity & Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xs font-bold tracking-wide uppercase ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}>
                  Contribution Activity
                </h3>
                <p className={`text-[11px] font-medium ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {formatNumber(streak.totalContributions)} contributions in the last year
                </p>
              </div>

              <div className={`flex items-center gap-1 text-[10px] font-medium ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                <span>Less</span>
                <div className="flex gap-[2px]">
                  {levelColors.map((c, i) => (
                    <span
                      key={i}
                      className="w-[8px] h-[8px] rounded-[1.5px]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* REAL GitHub 7-Row Contribution Calendar Grid with Month Labels */}
            <div className={`p-4 rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-neutral-50/90 border-black/8'
            }`}>
              {/* Month Labels Bar */}
              {monthLabels.length > 0 && (
                <div className={`relative h-3.5 mb-2 w-full text-[10px] font-medium select-none ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {monthLabels.map((m, idx) => (
                    <span
                      key={idx}
                      className="absolute"
                      style={{ left: `${Math.min(94, (m.col / numCols) * 100)}%` }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-rows-7 grid-flow-col gap-[3px] justify-between">
                {calendarDays.length > 0 ? (
                  calendarDays.map((day, idx) => {
                    const color = levelColors[day.level] || levelColors[0];
                    return (
                      <div
                        key={day.date || idx}
                        title={`${day.date}: ${day.count} contributions`}
                        className="w-[9.5px] h-[9.5px] sm:w-[10.5px] sm:h-[10.5px] rounded-[1.5px]"
                        style={{ backgroundColor: color }}
                      />
                    );
                  })
                ) : (
                  <div className={`text-xs py-6 text-center col-span-full ${
                    isDark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    No public contribution data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: 3 Liquid Glass Boxes (Active, Highest Streak, Current Streak) */}
          <div className="grid grid-cols-3 gap-3.5 pt-1">
            {/* Box 1: Active */}
            <div
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : 'linear-gradient(145deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 16px 0 rgba(255, 255, 255, 0.02), 0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                  : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 8px 24px -4px rgba(0, 0, 0, 0.05)',
              }}
              className="p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden"
            >
              <div 
                aria-hidden="true" 
                className={`absolute -top-10 -left-10 w-24 h-24 rounded-full blur-xl pointer-events-none ${
                  isDark ? 'bg-white/10' : 'bg-black/[0.03]'
                }`} 
              />
              <span className={`text-xs font-semibold relative z-10 ${
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                Active
              </span>
              <div className={`text-xl sm:text-2xl font-normal tracking-tight mt-1 relative z-10 ${
                isDark ? 'text-white' : 'text-neutral-950'
              }`}>
                {activeDays} <span className={`text-xs font-normal ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>days</span>
              </div>
            </div>

            {/* Box 2: Highest Streak */}
            <div
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : 'linear-gradient(145deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 16px 0 rgba(255, 255, 255, 0.02), 0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                  : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 8px 24px -4px rgba(0, 0, 0, 0.05)',
              }}
              className="p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden"
            >
              <div 
                aria-hidden="true" 
                className={`absolute -top-10 -left-10 w-24 h-24 rounded-full blur-xl pointer-events-none ${
                  isDark ? 'bg-white/10' : 'bg-black/[0.03]'
                }`} 
              />
              <span className={`text-xs font-semibold relative z-10 ${
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                Highest Streak
              </span>
              <div className={`text-xl sm:text-2xl font-normal tracking-tight mt-1 flex items-center gap-1.5 relative z-10 ${
                isDark ? 'text-white' : 'text-neutral-950'
              }`}>
                <span>🔥</span>
                <span>{streak.longestStreak || 0}</span>
              </div>
            </div>

            {/* Box 3: Current Streak */}
            <div
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                  : 'linear-gradient(145deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark
                  ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.32), inset 0 0 16px 0 rgba(255, 255, 255, 0.02), 0 8px 24px -4px rgba(0, 0, 0, 0.6)'
                  : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 8px 24px -4px rgba(0, 0, 0, 0.05)',
              }}
              className="p-4 rounded-2xl flex flex-col justify-center relative overflow-hidden"
            >
              <div 
                aria-hidden="true" 
                className={`absolute -top-10 -left-10 w-24 h-24 rounded-full blur-xl pointer-events-none ${
                  isDark ? 'bg-white/10' : 'bg-black/[0.03]'
                }`} 
              />
              <span className={`text-xs font-semibold relative z-10 ${
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                Current Streak
              </span>
              <div className={`text-xl sm:text-2xl font-normal tracking-tight mt-1 flex items-center gap-1.5 relative z-10 ${
                isDark ? 'text-white' : 'text-neutral-950'
              }`}>
                <span>🔥</span>
                <span>{streak.currentStreak || 0}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';
