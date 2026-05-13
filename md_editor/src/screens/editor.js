import { useState, useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import TextComponent from '../components/textComponent';
import PreviewComponent from '../components/previewComponent';
import CommandPalette from '../components/CommandPalette';
import { useTheme } from '../context/ThemeContext';
import { getAllDocuments, saveDocument, deleteDocument } from '../db';
import { use } from 'react';

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
  const [isDirty, setIsDirty] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [docu, setDoc] = useState([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [change, setChange] = useState(false)
  const [remaninigId , setRemainingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const { theme, toggleTheme } = useTheme();
  const saveTimer = useRef(null);

  // Derive active document from the selected id.
  const activeDoc = useMemo(
    () => docu.find((doc) => doc.id === activeId) || null,
    [docu, activeId]
  );

  const activeContent = activeDoc?.content || '';
  const htmlContent = useMemo(() => marked(activeContent), [activeContent]);

  useEffect(() => {
    async function loadDocument() {
      const storedDoc = await getAllDocuments();

      if (storedDoc.length > 0) {
        setDoc(storedDoc);
        setActiveId(storedDoc[0].id);
      } else {
        const firstDoc = {
          id: crypto.randomUUID(),
          title: 'untitled.md',
          content: SAMPLE,
          updatedAt: Date.now(),
        };
        await saveDocument(firstDoc);
        setDoc([firstDoc]);
        setActiveId(firstDoc.id);
      }
    }

    loadDocument();
  }, []);

  async function handleCreateDocument() {
    const newDoc = {
      id: crypto.randomUUID(),
      title: `document-${docu.length + 1}.md`,
      content: '',
      updatedAt: Date.now(),
    };

    await saveDocument(newDoc);
    setDoc((prev) => [newDoc, ...prev]);
    setActiveId(newDoc.id);
  }


   async function handleChangeTitle(title , id) {
    setDoc((prev)  => 
        prev.map((doc) => 
            doc.id === id 
            ?  {...doc , title : title, updatedAt : Date.now()}
            : doc
        )
    );    
    const updated =  docu.find((doc) => doc.id === id);
    if(updated) {
        await saveDocument({...updated , title : title , updatedAt : Date.now() })
    }
    


  }



    

  const handleChange = (value) => {
    if (!activeId) return;

    setIsDirty(true);

    setDoc((prev) =>
      prev.map((doc) =>
        doc.id === activeId
          ? { ...doc, content: value, updatedAt: Date.now() }
          : doc
      )
    );

    clearTimeout(saveTimer.current);

    // Debounced autosave: write to IndexedDB only after typing pauses.
    saveTimer.current = setTimeout(async () => {
      await saveDocument({
        id: activeId,
        title: activeDoc?.title || 'untitled.md',
        content: value,
        updatedAt: Date.now(),
      });
      setIsDirty(false);
    }, 800);
  };

  async function handleDeleteDoc(id) {
    await deleteDocument(id);

    setDoc((prev) => {
      const next = prev.filter((doc) => doc.id !== id);
      if (activeId === id) {
        setActiveId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const words = useMemo(
    () => activeContent.trim().split(/\s+/).filter(Boolean).length,
    [activeContent]
  );
  const readMin = Math.max(1, Math.round(words / 200));

  const commands = useMemo(
    () => [
      {
        id: 'toggle-theme',
        icon: theme === 'dark' ? '☀' : '☾',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        hint: 'theme',
        run: toggleTheme,
      },
      {
        id: 'new-doc',
        icon: '+',
        label: 'Create new document',
        hint: 'document',
        run: handleCreateDocument,
      },
      {
        id: 'delete-doc',
        icon: '🗑',
        label: 'Delete active document',
        hint: 'document',
        run: () => activeId && handleDeleteDoc(activeId),
      },
      {
        id: 'copy-md',
        icon: '⧉',
        label: 'Copy markdown to clipboard',
        hint: 'export',
        run: () => navigator.clipboard.writeText(activeContent),
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
          const blob = new Blob([activeContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = activeDoc?.title || 'untitled.md';
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
        label: `Show stats - ${words} words · ${readMin} min read`,
        hint: 'info',
        run: () => alert(`${words} words\n${readMin} min read`),
      },
    ],
    [
      theme,
      toggleTheme,
      activeId,
      activeContent,
      activeDoc,
      htmlContent,
      words,
      readMin,
      docu.length,
    ]
  );

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
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-bg/80 backdrop-blur-sm z-10 fade-up">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            ◐ Atelier
          </span>

          <span className="text-muted text-sm">{activeDoc?.title || 'untitled.md'}</span>
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

      <main className="flex-1 grid grid-cols-[220px_1fr_1fr] min-h-0">
        <aside className="border-r border-border bg-surface/40 overflow-y-auto py-4 px-3 fade-up">
          <div className="px-2 mb-3 text-[11px] uppercase tracking-widest text-muted">Documents</div>

          <button className="side-item" onClick={handleCreateDocument}>
            <span>+ new document</span>
          </button>

          {docu.map((doc) => (
            <div
              key={doc.id}
              className={`side-item ${doc.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(doc.id)}
              tabIndex={0}
              onKeyDown = {(e) => {
                if(e.key === 'F2'){
                  e.preventDefault()
                  setChange(true);
                  setRemainingId(doc.id)
                  setDraftTitle(doc.title)
                }
              }}
            >
                {change && remaninigId === doc.id
                ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleChangeTitle(draftTitle, doc.id)
                        setChange(false)
                        setRemainingId(null)
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        setChange(false)
                        setRemainingId(null)
                      }
                    }}
                    onBlur={() => {
                      setChange(false)
                      setRemainingId(null)
                    }}
                  />
                )
                :
                (
                  <>
                   <span>{doc.title}</span>
                   <button
                   className="meta"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteDoc(doc.id);
                   }}
                   title="delete document"
                 >
                   del
                 </button>
                  </>
                ) 
                
              
              
              
              
              }
               
            </div>
          ))}

          <div className="px-2 mt-6 mb-3 text-[11px] uppercase tracking-widest text-muted">Drafts</div>
          <div className="side-item">
            <span>essay-on-silence.md</span>
            <span className="meta">3d ago</span>
          </div>
        </aside>

        <section className="relative overflow-hidden border-r border-border fade-up">
          <div className="spine" />
          <TextComponent text={activeContent} onTextChange={handleChange} />
        </section>

        <section className="overflow-y-auto fade-up">
          <div className="mx-auto px-10 py-10">
            <PreviewComponent htmlContent={htmlContent} />
          </div>
        </section>
      </main>

      <footer className="flex items-center gap-5 h-9 px-6 border-t border-border text-[12px] text-muted bg-surface/40">
        <span>❍ {words.toLocaleString()} words</span>
        <span>⏱ {readMin} min read</span>
        <span className="text-text/60">·</span>
        <span>{isDirty ? 'editing...' : 'saved'}</span>
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
