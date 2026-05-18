import { useEffect, useMemo, useRef, useState } from 'react';
import CVForm from '../cv/CVForm';
import CVPreview from '../cv/CVPreview';
import { useTheme } from '../context/ThemeContext';
import {
    CV_TYPES,
    THEMES,
    THEME_META,
    RIREKISHO_SECTIONS,
    SHOKUMU_SECTIONS,
    emptyRirekisho,
    emptyShokumu,
    migrateLegacyCV,
} from '../cv/model';
import { getAllCVs, saveCV, deleteCV } from '../db';
import { importPDF } from '../cv/pdfImport';

function CVEditor({ onSwitchToMarkdown }) {
    const { theme: appTheme, toggleTheme } = useTheme();
    const [cvs, setCvs] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const saveTimer = useRef(null);
    const fileInputRef = useRef(null);

    const activeCV = useMemo(
        () => cvs.find((c) => c.id === activeId) || null,
        [cvs, activeId]
    );

    useEffect(() => {
        async function load() {
            const stored = await getAllCVs();
            if (stored.length > 0) {
                const migrated = stored.map(migrateLegacyCV);
                // Persist migration so future loads skip it.
                await Promise.all(migrated.map((cv) => saveCV(cv)));
                setCvs(migrated);
                setActiveId(migrated[0].id);
            } else {
                const first = emptyRirekisho();
                await saveCV(first);
                setCvs([first]);
                setActiveId(first.id);
            }
        }
        load();
    }, []);

    useEffect(() => () => clearTimeout(saveTimer.current), []);

    function updateActive(next) {
        const stamped = { ...next, updatedAt: Date.now() };
        setIsDirty(true);
        setCvs((prev) => prev.map((c) => (c.id === stamped.id ? stamped : c)));
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            await saveCV(stamped);
            setIsDirty(false);
        }, 600);
    }

    async function handleCreate(kind) {
        const fresh = kind === CV_TYPES.SHOKUMU ? emptyShokumu() : emptyRirekisho();
        await saveCV(fresh);
        setCvs((prev) => [fresh, ...prev]);
        setActiveId(fresh.id);
    }

    async function handleDelete(id) {
        await deleteCV(id);
        setCvs((prev) => {
            const next = prev.filter((c) => c.id !== id);
            if (activeId === id) setActiveId(next[0]?.id ?? null);
            return next;
        });
    }

    async function handleImportPDF(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        setImportError('');
        try {
            const { cv } = await importPDF(file);
            cv.title = `${file.name.replace(/\.pdf$/i, '')} (imported)`;
            const migrated = migrateLegacyCV(cv);
            await saveCV(migrated);
            setCvs((prev) => [migrated, ...prev]);
            setActiveId(migrated.id);
        } catch (err) {
            console.error(err);
            setImportError(err?.message || 'PDF import failed');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleExportPDF() {
        if (!activeCV) return;
        document.body.classList.add('cv-printing');
        const onAfter = () => {
            document.body.classList.remove('cv-printing');
            window.removeEventListener('afterprint', onAfter);
        };
        window.addEventListener('afterprint', onAfter);
        window.print();
    }

    function handleExportJSON() {
        if (!activeCV) return;
        const blob = new Blob([JSON.stringify(activeCV, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeCV.title || 'cv'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (!activeCV) {
        return (
            <div className="flex items-center justify-center h-screen text-muted">
                Loading…
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-bg text-text font-sans relative overflow-hidden cv-app">
            <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-bg/80 backdrop-blur-sm z-10 fade-up cv-no-print">
                <div className="flex items-center gap-3">
                    <span
                        className="text-base font-semibold tracking-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        履 Rirekisho · Atelier
                    </span>
                    <span className="text-muted text-sm">{activeCV.title}</span>
                    <span
                        className={isDirty ? 'dot-dirty' : 'dot-clean'}
                        title={isDirty ? 'unsaved' : 'saved'}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="cv-toolbar-btn" onClick={onSwitchToMarkdown}>
                        ✎ Markdown
                    </button>
                    <button
                        className="cv-toolbar-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                    >
                        {importing ? '⟳ Importing…' : '↑ Import PDF'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleImportPDF}
                        style={{ display: 'none' }}
                    />
                    <button className="cv-toolbar-btn" onClick={handleExportJSON}>
                        ↓ JSON
                    </button>
                    <button className="cv-toolbar-btn cv-toolbar-primary" onClick={handleExportPDF}>
                        ↓ Export PDF
                    </button>
                    <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
                        {appTheme === 'dark' ? '☀' : '☾'}
                    </button>
                </div>
            </header>

            {importError && (
                <div className="cv-banner cv-banner-error cv-no-print">
                    Import failed: {importError}
                </div>
            )}

            <main className="flex-1 grid grid-cols-[260px_minmax(360px,420px)_1fr] min-h-0 cv-main">
                <aside className="border-r border-border bg-surface/40 overflow-y-auto py-4 px-3 fade-up cv-no-print">
                    <div className="px-2 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Create
                    </div>
                    <button
                        className="side-item"
                        onClick={() => handleCreate(CV_TYPES.RIREKISHO)}
                    >
                        <span>+ 履歴書 (Rirekisho)</span>
                    </button>
                    <button
                        className="side-item"
                        onClick={() => handleCreate(CV_TYPES.SHOKUMU)}
                    >
                        <span>+ 職務経歴書 (Shokumu)</span>
                    </button>

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Your CVs
                    </div>
                    {cvs.map((c) => (
                        <div
                            key={c.id}
                            className={`side-item ${c.id === activeId ? 'active' : ''}`}
                            onClick={() => setActiveId(c.id)}
                        >
                            <span>
                                {c.kind === CV_TYPES.SHOKUMU ? '職' : '履'} {c.title}
                            </span>
                            <button
                                className="meta"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(c.id);
                                }}
                                title="delete"
                            >
                                del
                            </button>
                        </div>
                    ))}

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Theme
                    </div>
                    <div className="cv-theme-grid">
                        <div className="cv-theme-group-label">日本 / Japan</div>
                        {THEMES.filter((t) => THEME_META[t].region === 'jp').map((t) => (
                            <button
                                key={t}
                                className={`cv-theme-chip ${activeCV.theme === t ? 'active' : ''}`}
                                onClick={() => updateActive({ ...activeCV, theme: t })}
                                style={{ '--chip-accent': THEME_META[t].accent }}
                                title={THEME_META[t].description}
                            >
                                <span className="cv-theme-swatch" />
                                <span className="cv-theme-chip-text">
                                    <strong>{THEME_META[t].name}</strong>
                                    <small>{THEME_META[t].nameJp}</small>
                                </span>
                                <span className="cv-theme-tag cv-theme-tag-jp">JP</span>
                            </button>
                        ))}

                        <div className="cv-theme-group-label">Universal</div>
                        {THEMES.filter((t) => THEME_META[t].region === 'both').map((t) => (
                            <button
                                key={t}
                                className={`cv-theme-chip ${activeCV.theme === t ? 'active' : ''}`}
                                onClick={() => updateActive({ ...activeCV, theme: t })}
                                style={{ '--chip-accent': THEME_META[t].accent }}
                                title={THEME_META[t].description}
                            >
                                <span className="cv-theme-swatch" />
                                <span className="cv-theme-chip-text">
                                    <strong>{THEME_META[t].name}</strong>
                                    <small>{THEME_META[t].nameJp}</small>
                                </span>
                                <span className="cv-theme-tag cv-theme-tag-both">·</span>
                            </button>
                        ))}

                        <div className="cv-theme-group-label">Europe / America ✦</div>
                        {THEMES.filter((t) => THEME_META[t].region === 'international').map((t) => (
                            <button
                                key={t}
                                className={`cv-theme-chip ${activeCV.theme === t ? 'active' : ''}`}
                                onClick={() => updateActive({ ...activeCV, theme: t })}
                                style={{ '--chip-accent': THEME_META[t].accent }}
                                title={THEME_META[t].description}
                            >
                                <span className="cv-theme-swatch" />
                                <span className="cv-theme-chip-text">
                                    <strong>{THEME_META[t].name}</strong>
                                    <small>{THEME_META[t].nameJp}</small>
                                </span>
                                <span className="cv-theme-tag cv-theme-tag-int">EU·US</span>
                            </button>
                        ))}
                    </div>

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Region
                    </div>
                    <div className="cv-lang-row">
                        {[
                            { id: 'jp', label: '日本 Japan' },
                            { id: 'international', label: '🌐 International' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                className={`cv-lang-btn ${(activeCV.region || 'jp') === opt.id ? 'active' : ''}`}
                                onClick={() => updateActive({ ...activeCV, region: opt.id })}
                                title={opt.id === 'jp'
                                    ? 'Furigana, 〒 postal code, spouse/dependents fields'
                                    : 'No furigana / no spouse-dependents; adds country and links'}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Language
                    </div>
                    <div className="cv-lang-row">
                        {[
                            { id: 'jp', label: '日本語' },
                            { id: 'en', label: 'English' },
                            { id: 'bilingual', label: 'JP / EN' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                className={`cv-lang-btn ${activeCV.language === opt.id ? 'active' : ''}`}
                                onClick={() => updateActive({ ...activeCV, language: opt.id })}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Sections
                    </div>
                    <div className="cv-sections-list">
                        {(activeCV.kind === CV_TYPES.SHOKUMU ? SHOKUMU_SECTIONS : RIREKISHO_SECTIONS).map((s) => {
                            const visible = (activeCV.sections || {})[s.key] !== false;
                            return (
                                <label key={s.key} className="cv-section-toggle">
                                    <input
                                        type="checkbox"
                                        checked={visible}
                                        onChange={(e) =>
                                            updateActive({
                                                ...activeCV,
                                                sections: {
                                                    ...(activeCV.sections || {}),
                                                    [s.key]: e.target.checked,
                                                },
                                            })
                                        }
                                    />
                                    <span className="cv-section-toggle-text">
                                        <strong>{s.labelEn}</strong>
                                        <small>{s.labelJp}</small>
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="px-2 mt-5 mb-2 text-[11px] uppercase tracking-widest text-muted">
                        Title
                    </div>
                    <input
                        className="cv-input"
                        value={activeCV.title}
                        onChange={(e) => updateActive({ ...activeCV, title: e.target.value })}
                    />
                </aside>

                <section className="overflow-y-auto border-r border-border fade-up cv-form-pane cv-no-print">
                    <CVForm cv={activeCV} onChange={updateActive} />
                </section>

                <section className="overflow-y-auto fade-up cv-preview-pane">
                    <div className="cv-preview-shell">
                        <CVPreview cv={activeCV} />
                    </div>
                </section>
            </main>

            <footer className="flex items-center gap-5 h-9 px-6 border-t border-border text-[12px] text-muted bg-surface/40 cv-no-print">
                <span>{activeCV.kind === CV_TYPES.SHOKUMU ? '職務経歴書' : '履歴書'}</span>
                <span>·</span>
                <span>{THEME_META[activeCV.theme].name}</span>
                <span>·</span>
                <span>{activeCV.language === 'bilingual' ? 'JP / EN' : activeCV.language.toUpperCase()}</span>
                <span>·</span>
                <span>{(activeCV.region || 'jp') === 'international' ? '🌐 International' : '🗾 Japan'}</span>
                <span className="ml-auto">{isDirty ? 'editing…' : 'saved'}</span>
            </footer>
        </div>
    );
}

export default CVEditor;
