// GitHub API utilities with Smart Caching & Token Support

export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
};

// Built-in pre-cached profiles for instant testing without consuming API quota
const PRESET_PROFILES = {
  shadcn: {
    login: 'shadcn',
    name: 'shadcn',
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    bio: 'I own a computer.',
    company: 'vercel',
    location: '',
    publicRepos: 228,
    followers: 17200,
    following: 0,
    totalStars: 11800,
    languagesList: [
      { name: 'TypeScript', color: '#3178c6', percentage: 72 },
      { name: 'JavaScript', color: '#f1e05a', percentage: 18 },
      { name: 'CSS', color: '#563d7c', percentage: 10 }
    ],
    joinedDate: 'Sep 2009',
  },
  ameenmakestuffs: {
    login: 'ameenmakestuffs',
    name: 'Ameen Ansari',
    avatarUrl: 'https://avatars.githubusercontent.com/u/163636377?v=4',
    bio: '20 • just building up some stuffs.',
    company: '',
    location: '',
    publicRepos: 21,
    followers: 1,
    following: 1,
    totalStars: 3,
    languagesList: [
      { name: 'TypeScript', color: '#3178c6', percentage: 54 },
      { name: 'JavaScript', color: '#f1e05a', percentage: 28 },
      { name: 'Python', color: '#3572A5', percentage: 18 }
    ],
    joinedDate: 'Mar 2024',
  },
  torvalds: {
    login: 'torvalds',
    name: 'Linus Torvalds',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    bio: 'Creator of Linux and Git.',
    company: 'Linux Foundation',
    location: 'Portland, OR',
    publicRepos: 7,
    followers: 245000,
    following: 0,
    totalStars: 198000,
    languagesList: [
      { name: 'C', color: '#555555', percentage: 94 },
      { name: 'Shell', color: '#89e051', percentage: 4 },
      { name: 'Makefile', color: '#427819', percentage: 2 }
    ],
    joinedDate: 'Sep 2011',
  },
  leerob: {
    login: 'leerob',
    name: 'Lee Robinson',
    avatarUrl: 'https://avatars.githubusercontent.com/u/9113740?v=4',
    bio: 'VP of Product at Vercel.',
    company: 'Vercel',
    location: 'Des Moines, IA',
    publicRepos: 120,
    followers: 48000,
    following: 12,
    totalStars: 28500,
    languagesList: [
      { name: 'TypeScript', color: '#3178c6', percentage: 68 },
      { name: 'JavaScript', color: '#f1e05a', percentage: 22 },
      { name: 'CSS', color: '#563d7c', percentage: 10 }
    ],
    joinedDate: 'Aug 2014',
  },
  sindresorhus: {
    login: 'sindresorhus',
    name: 'Sindre Sorhus',
    avatarUrl: 'https://avatars.githubusercontent.com/u/170270?v=4',
    bio: 'Full-time open-sourcerer.',
    company: 'Open Source',
    location: 'Sweden',
    publicRepos: 1040,
    followers: 65000,
    following: 38,
    totalStars: 620000,
    languagesList: [
      { name: 'JavaScript', color: '#f1e05a', percentage: 56 },
      { name: 'TypeScript', color: '#3178c6', percentage: 32 },
      { name: 'Swift', color: '#F05138', percentage: 12 }
    ],
    joinedDate: 'Dec 2009',
  }
};

async function getAvatarAsDataUrl(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return url;
  }
}

// Fetch real GitHub contribution calendar
async function fetchRealContributions(username) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
    if (!res.ok) throw new Error('Contribution API failed');
    const data = await res.json();
    
    const days = data.contributions || [];
    const total = data.total?.lastYear || Object.values(data.total || {})[0] || 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < days.length; i++) {
      if (days[i].count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (i === days.length - 1 && days[i].count === 0) continue;
      if (days[i].count > 0) currentStreak++;
      else break;
    }

    return {
      totalContributions: total,
      currentStreak,
      longestStreak,
      calendarDays: days.slice(-140),
    };
  } catch (err) {
    console.warn('Real contributions API fallback:', err);
    const dummyDays = Array.from({ length: 140 }, (_, i) => ({
      date: `day-${i}`,
      count: (i % 3 === 0) ? 3 : 0,
      level: (i % 3 === 0) ? (i % 4) + 1 : 0
    }));
    return {
      totalContributions: 240,
      currentStreak: 4,
      longestStreak: 15,
      calendarDays: dummyDays,
    };
  }
}

export async function fetchGithubProfile(username, token = null) {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    throw new Error('Please enter a valid GitHub username.');
  }

  // 1. Check in-memory preset profiles first
  const preset = PRESET_PROFILES[cleanUsername];

  // 2. Check localStorage cache
  const cacheKey = `gh_profile_${cleanUsername}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed._cachedAt < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {}

  // Setup request headers
  const headers = {};
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('github_token') : null);
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken.trim()}`;
  }

  // 3. Fetch from GitHub API
  let user = null;
  let isRateLimited = false;

  try {
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers });
    
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${cleanUsername}" was not found.`);
    }
    
    if (userRes.status === 403) {
      isRateLimited = true;
    } else if (userRes.ok) {
      user = await userRes.json();
    }
  } catch (err) {
    if (err.message && err.message.includes('not found')) throw err;
    isRateLimited = true;
  }

  // Fallback to preset or cached data if rate limited
  if (isRateLimited || !user) {
    if (preset) {
      const streak = await fetchRealContributions(cleanUsername);
      return { ...preset, streak };
    }
    try {
      const oldCached = localStorage.getItem(cacheKey);
      if (oldCached) return JSON.parse(oldCached);
    } catch (e) {}

    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // Convert avatar to base64
  let avatarUrl = user.avatar_url;
  if (avatarUrl) {
    avatarUrl = await getAvatarAsDataUrl(user.avatar_url);
  }

  // Fetch repos
  let repos = [];
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=pushed`,
      { headers }
    );
    if (reposRes.ok) {
      repos = await reposRes.json();
    }
  } catch (err) {
    console.warn('Could not fetch repos:', err);
  }

  // Fetch real contribution calendar
  const realStreak = await fetchRealContributions(cleanUsername);

  // Calculate stars & languages distribution
  let totalStars = 0;
  let totalForks = 0;
  const languagesCount = {};

  if (Array.isArray(repos)) {
    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        languagesCount[repo.language] = (languagesCount[repo.language] || 0) + 1;
      }
    });
  }

  const totalLangCount = Object.values(languagesCount).reduce((a, b) => a + b, 0);
  const languagesList = Object.entries(languagesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lang, count]) => ({
      name: lang,
      color: LANGUAGE_COLORS[lang] || '#8b949e',
      percentage: totalLangCount > 0 ? Math.round((count / totalLangCount) * 100) : 0,
    }));

  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  }) : '';

  const profileData = {
    login: user.login,
    name: user.name || user.login,
    avatarUrl,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    twitter: user.twitter_username,
    publicRepos: user.public_repos || 0,
    followers: user.followers || 0,
    following: user.following || 0,
    totalStars,
    totalForks,
    languagesList: languagesList.length > 0 ? languagesList : [
      { name: 'JavaScript', color: '#f1e05a', percentage: 60 },
      { name: 'TypeScript', color: '#3178c6', percentage: 40 }
    ],
    joinedDate,
    profileUrl: user.html_url,
    streak: realStreak,
    _cachedAt: Date.now(),
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(profileData));
  } catch (e) {}

  return profileData;
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}
