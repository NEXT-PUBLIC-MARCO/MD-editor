import { useState, useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import TextComponent from '../components/textComponent';
import PreviewComponent from '../components/previewComponent';
import CommandPalette from '../components/CommandPalette';
import { useTheme } from '../context/ThemeContext';

const SAMPLE = `# The unseen architecture

> Writing is the act of sculpting silence.

Lorem ipsum **dolor** sit amet, consectetur _adipiscing_ elit. Sed do eiusmod tempor incididunt ut labore.

## Chapter 1

- first thread
- second thread
- third thread

\`\`\`js
const muse = () => 'patience';
\`\`\`
`;

function Editor() {
  const [content, setContent] = useState(SAMPLE);
  const [isDirty, setIsDirty] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const saveTimer = useRef(null);

  const htmlContent = useMemo(() => marked(content), [content]);

  const handleChange = (value) => {
    setContent(value);
    setIsDirty(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setIsDirty(false), 800);
  };

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const words = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );
  const readMin = Math.max(1, Math.round(words / 200));

  const commands = useMemo(() => [
    {
      id: 'toggle-theme',
      icon: theme === 'dark' ? '☀' : '☾',
      label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      hint: 'theme',
      run: toggleTheme,
    },
    {
      id: 'copy-md',
      icon: '⧉',
      label: 'Copy markdown to clipboard',
      hint: 'export',
      run: () => navigator.clipboard.writeText(content),
    },
    {
      id: 'copy-html',
      icon: '⟨⟩',
      label: 'Copy rendered HTML',
      hint: 'export',
      run: () => navigator.clipboard.writeText(htmlContent),
    },
    {
      id: 'download-md',
      icon: '↓',
      label: 'Download as .md file',
      hint: 'export',
      run: () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'untitled.md';
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      id: 'clear',
      icon: '✕',
      label: 'Clear document',
      hint: 'danger',
      run: () => handleChange(''),
    },
    {
      id: 'sample',
      icon: '✎',
      label: 'Load sample content',
      hint: 'document',
      run: () => handleChange(SAMPLE),
    },
    {
      id: 'word-count',
      icon: '❍',
      label: `Show stats — ${words} words · ${readMin} min read`,
      hint: 'info',
      run: () => alert(`${words} words\n${readMin} min read`),
    },
  ], [theme, toggleTheme, content, htmlContent, words, readMin]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans relative overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-bg/80 backdrop-blur-sm z-10 fade-up">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            ◐ Atelier
          </span>
          <span className="text-muted text-sm">untitled.md</span>
          <span className={isDirty ? 'dot-dirty' : 'dot-clean'} title={isDirty ? 'unsaved' : 'saved'} />
        </div>

        <div className="flex items-center gap-1">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      {/* ── Main: sidebar + editor + preview ───────────────────── */}
      <main className="flex-1 grid grid-cols-[220px_1fr_1fr] min-h-0">
        {/* Sidebar */}
        <aside className="border-r border-border bg-surface/40 overflow-y-auto py-4 px-3 fade-up">
          <div className="px-2 mb-3 text-[11px] uppercase tracking-widest text-muted">Documents</div>
          <div className="side-item active">
            <span>untitled.md</span>
            <span className="meta">{words}w</span>
          </div>
          <div className="side-item">
            <span>chapter-one.md</span>
            <span className="meta">2h ago</span>
          </div>
          <div className="side-item">
            <span>scratch.md</span>
            <span className="meta">yesterday</span>
          </div>

          <div className="px-2 mt-6 mb-3 text-[11px] uppercase tracking-widest text-muted">Drafts</div>
          <div className="side-item">
            <span>essay-on-silence.md</span>
            <span className="meta">3d ago</span>
          </div>
        </aside>

        {/* Editor */}
        <section className="relative overflow-hidden border-r border-border fade-up">
          <div className="spine" />
          <TextComponent text={content} onTextChange={handleChange} />
        </section>

        {/* Preview */}
        <section className="overflow-y-auto fade-up">
          <div className="mx-auto px-10 py-10">
            <PreviewComponent htmlContent={htmlContent} />
          </div>
        </section>
      </main>

      {/* ── Status bar ─────────────────────────────────────────── */}
      <footer className="flex items-center gap-5 h-9 px-6 border-t border-border text-[12px] text-muted bg-surface/40">
        <span>❍ {words.toLocaleString()} words</span>
        <span>⏱ {readMin} min read</span>
        <span className="text-text/60">·</span>
        <span>{isDirty ? 'editing…' : 'saved'}</span>
        <button
          className="ml-auto opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => setPaletteOpen(true)}
        >
          ⌘K commands
        </button>
      </footer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}

export default Editor;
