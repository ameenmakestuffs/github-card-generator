import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { ProfileCard } from './components/ProfileCard';
import { fetchGithubProfile } from './utils/github';
import { INSTRUMENT_SERIF_CSS } from './utils/fonts';

export default function App() {
  const [username, setUsername] = useState('ameenmakestuffs');
  const [inputVal, setInputVal] = useState('ameenmakestuffs');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Optional GitHub Token for 5,000 req/hr
  const [token, setToken] = useState(() => localStorage.getItem('github_token') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenSection, setShowTokenSection] = useState(false);
  
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardTheme, setCardTheme] = useState('light');

  const cardRef = useRef(null);

  // Fetch GitHub profile data
  const loadProfile = async (targetUser) => {
    if (!targetUser) return;
    setLoading(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const profile = await fetchGithubProfile(targetUser, token);
      setData(profile);
      setUsername(targetUser);
    } catch (err) {
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setIsRateLimited(true);
        setShowTokenSection(true);
      } else {
        setError(err.message || 'Failed to fetch GitHub profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProfile('ameenmakestuffs');
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      loadProfile(inputVal.trim());
    }
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (clean) {
      localStorage.setItem('github_token', clean);
      setToken(clean);
      setTokenInput('');
      setIsRateLimited(false);
      if (inputVal) loadProfile(inputVal);
    }
  };

  const handleRemoveToken = () => {
    localStorage.removeItem('github_token');
    setToken('');
    setTokenInput('');
  };

  // Download high-res PNG
  const handleDownload = async () => {
    if (!cardRef.current || !data) return;
    setDownloading(true);
    try {
      const node = cardRef.current;
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      const dataUrl = await toPng(node, {
        width,
        height,
        cacheBust: true,
        pixelRatio: 3,
        quality: 1,
        fontEmbedCSS: INSTRUMENT_SERIF_CSS,
        skipAutoScale: true,
      });
      const link = document.createElement('a');
      link.download = `${data.login}-github-card-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not generate PNG image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current || !data) return;
    try {
      const node = cardRef.current;
      const rect = node.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      const blob = await toBlob(node, {
        width,
        height,
        cacheBust: true,
        pixelRatio: 2,
        fontEmbedCSS: INSTRUMENT_SERIF_CSS,
      });
      
      if (blob) {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch (err) {
      console.warn('Copy to clipboard failed, downloading instead:', err);
      handleDownload();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-grid-depth text-neutral-900 flex flex-col justify-between">
      
      {/* Full-height Decoupled Grid: Spacious 1540px Canvas */}
      <main className="h-full max-w-[1560px] mx-auto w-full px-4 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 flex-1 items-center">
        
        {/* Left Column: Input and Clear Explanatory Token Section */}
        <div className="lg:col-span-4 h-full flex flex-col justify-center space-y-5 pt-12 pb-6 sm:pt-14 sm:pb-8 lg:py-6 max-w-[400px] w-full">
          
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Generate your GitHub profile card.
            </h2>
            <p className="text-sm font-normal text-neutral-600 mt-2">
              Paste your username to fetch your stats, activity, and golden stars.
            </p>
          </div>

          {/* Comfortable Input Form */}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="github-username-input"
              name="username"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter GitHub username..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-black/15 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 text-base font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-bold tracking-wide rounded-xl transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>...</span>
                </>
              ) : (
                <span>Generate</span>
              )}
            </button>
          </form>

          {/* Rate Limit Alert */}
          {isRateLimited && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-start gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>GitHub API rate limit reached (60 requests/hour limit).</span>
              </div>
              <p className="text-xs text-amber-800 font-normal leading-relaxed">
                GitHub limits unauthenticated requests to 60/hr per IP. Add your free Personal Access Token below to immediately raise it to <strong>5,000 requests/hour</strong>.
              </p>
            </div>
          )}

          {/* General Error Message */}
          {error && (
            <div className="p-3 bg-red-50/80 border border-red-200/60 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Clearly Explained GitHub Token Section */}
          <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Key className="w-3.5 h-3.5 text-neutral-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    GitHub API Limit
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {token ? '5,000 requests/hour active' : '60 requests/hour standard limit'}
                  </p>
                </div>
              </div>

              {token ? (
                <button
                  type="button"
                  onClick={handleRemoveToken}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Remove Token
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTokenSection(!showTokenSection)}
                  className="text-xs text-neutral-700 hover:text-black font-semibold flex items-center gap-1"
                >
                  <span>{showTokenSection ? 'Hide' : 'Add Token'}</span>
                  {showTokenSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Token Instructions and Input */}
            {(!token && (showTokenSection || isRateLimited)) && (
              <div className="pt-2 border-t border-black/5 space-y-2.5 text-xs">
                <p className="text-neutral-600 text-xs leading-relaxed">
                  To get <strong>5,000 requests/hour</strong>, create a free token with zero permissions:
                </p>
                
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-500 font-medium">
                  <li>
                    Open{' '}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-black font-bold underline inline-flex items-center gap-0.5"
                    >
                      GitHub Token Generator <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>Click <strong>Generate token</strong> (leave all scope boxes unchecked).</li>
                  <li>Copy and paste your token (<code className="bg-neutral-100 px-1 py-0.5 rounded text-[10px]">ghp_...</code>) below.</li>
                </ol>

                <form onSubmit={handleSaveToken} className="flex gap-2 pt-1">
                  <input
                    type="password"
                    placeholder="Paste token (ghp_xxxxxxxxxxxx)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Expanded Output Card + Pushed Down Actions */}
        <div className="lg:col-span-8 h-full flex flex-col justify-center items-center lg:items-end py-6">
          {loading && !data ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500 font-semibold">Fetching profile and contribution activity...</p>
            </div>
          ) : (
            <div className="w-full max-w-[1140px] flex flex-col items-center lg:items-end">
              
              {/* Card Theme Switcher Header */}
              {data && (
                <div className="w-full flex items-center justify-between mb-3.5 px-1">
                  <div className="inline-flex items-center gap-1 p-1 bg-white border border-black/10 rounded-2xl shadow-xs">
                    <button
                      type="button"
                      onClick={() => setCardTheme('dark')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        cardTheme === 'dark'
                          ? 'bg-neutral-950 text-white shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardTheme('light')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        cardTheme === 'light'
                          ? 'bg-neutral-950 text-white shadow-xs'
                          : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                  </div>

                  <span className="text-xs font-semibold text-neutral-400">
                    {cardTheme === 'dark' ? 'Pitch Black Card' : 'Clean Light Card'}
                  </span>
                </div>
              )}

              <ProfileCard
                ref={cardRef}
                data={data}
                theme={cardTheme}
              />

              {/* Action Buttons: Centered on mobile below the card, right-aligned on desktop */}
              {data && (
                <div className="w-full flex items-center justify-center lg:justify-end gap-3 mt-6 sm:mt-7">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-6 py-3 bg-black hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all flex items-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering PNG...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyImage}
                    className="w-[110px] py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border border-black/15 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-neutral-700" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Footer Aligned to Center on Mobile, Left on Desktop */}
      <footer className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-12 py-4 text-center lg:text-left text-xs text-neutral-500 font-medium">
        © 2026 by{' '}
        <a
          href="https://x.com/theKidwithin"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 text-neutral-800 hover:text-black font-semibold transition-colors"
        >
          @theKidwithin
        </a>
      </footer>

    </div>
  );
}
