import { CV_TYPES, label, isSectionVisible, contractTypeLabel } from './model';

function parseYearMonth(value) {
    if (!value) return { year: '', month: '' };
    const m = String(value).match(/^(\d{4})[-/](\d{1,2})/);
    if (!m) return { year: value, month: '' };
    return { year: m[1], month: String(parseInt(m[2], 10)) };
}

function formatRange(startDate, endDate, lang, region) {
    const start = startDate || '';
    const end = endDate || (lang === 'jp' ? '現在' : 'Present');
    if (!start) return end === (lang === 'jp' ? '現在' : 'Present') ? '' : end;
    if (region === 'international') {
        const fmt = (v) => {
            const m = String(v).match(/^(\d{4})[-/](\d{1,2})/);
            if (!m) return v;
            const d = new Date(`${m[1]}-${String(m[2]).padStart(2, '0')}-01`);
            return d.toLocaleDateString(lang === 'jp' ? 'ja-JP' : 'en-US', {
                year: 'numeric',
                month: 'short',
            });
        };
        return `${fmt(start)} – ${endDate ? fmt(endDate) : end}`;
    }
    const fmtJP = (v) => {
        const m = String(v).match(/^(\d{4})[-/](\d{1,2})/);
        if (!m) return v;
        return `${m[1]}年${parseInt(m[2], 10)}月`;
    };
    return `${fmtJP(start)} – ${endDate ? fmtJP(endDate) : end}`;
}

function formatDate(iso, lang, region) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (region === 'international') {
        if (lang === 'jp') return `${y}-${m}-${day}`;
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    if (lang === 'en') return `${y}-${m}-${day}`;
    return `${y}年${parseInt(m, 10)}月${parseInt(day, 10)}日`;
}

function computeAge(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : '';
}

function RirekishoPreview({ cv }) {
    const lang = cv.language;
    const region = cv.region || 'jp';
    const isJP = region !== 'international';
    const p = cv.personal;
    const today = new Date();
    const dateStr = formatDate(today.toISOString(), lang, region);
    const age = computeAge(p.birthDate);

    return (
        <article className={`cv-doc cv-theme-${cv.theme} cv-rirekisho cv-region-${region}`}>
            <header className="cv-doc-header">
                <h1 className="cv-doc-title">{label('rirekisho', 'title', lang)}</h1>
                <div className="cv-doc-date">
                    {label('rirekisho', 'date', lang)}: {dateStr}
                </div>
            </header>

            <div className="cv-doc-top">
                <div className="cv-doc-id">
                    <table className="cv-table">
                        <tbody>
                            {isJP && p.fullNameKana && (
                                <tr>
                                    <th>{label('rirekisho', 'fullNameKana', lang)}</th>
                                    <td colSpan={2}>{p.fullNameKana}</td>
                                </tr>
                            )}
                            <tr>
                                <th>{label('rirekisho', 'fullName', lang)}</th>
                                <td colSpan={2} className="cv-name-cell">{p.fullName || ' '}</td>
                            </tr>
                            <tr>
                                <th>{label('rirekisho', 'birthDate', lang)}</th>
                                <td>
                                    {formatDate(p.birthDate, lang, region)}
                                    {age && ` (${age})`}
                                </td>
                                <td>
                                    {p.gender ? (
                                        <>
                                            <strong>{label('rirekisho', 'gender', lang)}:</strong>{' '}
                                            {p.gender === 'male'
                                                ? label('rirekisho', 'male', lang)
                                                : label('rirekisho', 'female', lang)}
                                        </>
                                    ) : p.nationality ? (
                                        <>
                                            <strong>{label('rirekisho', 'nationality', lang)}:</strong> {p.nationality}
                                        </>
                                    ) : ''}
                                </td>
                            </tr>
                            {p.gender && p.nationality && (
                                <tr>
                                    <th>{label('rirekisho', 'nationality', lang)}</th>
                                    <td colSpan={2}>{p.nationality}</td>
                                </tr>
                            )}
                            {isJP && p.addressKana && (
                                <tr>
                                    <th>{label('rirekisho', 'addressKana', lang)}</th>
                                    <td colSpan={2}>{p.addressKana}</td>
                                </tr>
                            )}
                            <tr>
                                <th>{label('rirekisho', 'address', lang)}</th>
                                <td colSpan={2}>
                                    {p.postalCode && (
                                        <span className="cv-postal">
                                            {isJP ? '〒 ' : ''}{p.postalCode}
                                        </span>
                                    )}
                                    {p.address}
                                    {!isJP && p.country && (
                                        <span className="cv-country">, {p.country}</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <th>{label('rirekisho', 'phone', lang)}</th>
                                <td>{p.phone}</td>
                                <td>
                                    <strong>{label('rirekisho', 'email', lang)}:</strong> {p.email}
                                </td>
                            </tr>
                            {(p.linkedin || p.website) && (
                                <tr>
                                    <th>Web</th>
                                    <td colSpan={2}>
                                        {p.linkedin && <span>{p.linkedin}</span>}
                                        {p.linkedin && p.website && <span> · </span>}
                                        {p.website && <span>{p.website}</span>}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="cv-doc-photo">
                    {cv.photo ? (
                        <img src={cv.photo} alt="" />
                    ) : (
                        <div className="cv-photo-empty">
                            <span>{label('rirekisho', 'photo', lang)}</span>
                            <small>{label('rirekisho', 'photoHint', lang)}</small>
                        </div>
                    )}
                </div>
            </div>

            {isSectionVisible(cv, 'summary') && cv.summary && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'summary', lang)}</h2>
                    <p className="cv-doc-text">{cv.summary}</p>
                </section>
            )}

            {(isSectionVisible(cv, 'education') || isSectionVisible(cv, 'workHistory')) && (isJP ? (
                <>
                    <h2 className="cv-doc-section-title">
                        {label('rirekisho', 'education', lang)} / {label('rirekisho', 'workHistory', lang)}
                    </h2>
                    <table className="cv-table cv-table-history">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>{label('rirekisho', 'year', lang)}</th>
                                <th style={{ width: '8%' }}>{label('rirekisho', 'month', lang)}</th>
                                <th>{label('rirekisho', 'content', lang)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="cv-section-marker">
                                <td colSpan={3} style={{ textAlign: 'center' }}>
                                    <strong>{label('rirekisho', 'education', lang)}</strong>
                                </td>
                            </tr>
                            {cv.education.flatMap((row) => {
                                const start = parseYearMonth(row.startDate);
                                const end = parseYearMonth(row.endDate);
                                const name = [row.schoolName, row.degree].filter(Boolean).join(' ');
                                const rows = [];
                                if (row.startDate) {
                                    rows.push(
                                        <tr key={`${row.id}-s`}>
                                            <td>{start.year}</td>
                                            <td>{start.month}</td>
                                            <td>{name} {lang === 'en' ? 'entered' : '入学'}</td>
                                        </tr>
                                    );
                                }
                                if (row.endDate) {
                                    rows.push(
                                        <tr key={`${row.id}-e`}>
                                            <td>{end.year}</td>
                                            <td>{end.month}</td>
                                            <td>{name} {lang === 'en' ? 'graduated' : '卒業'}</td>
                                        </tr>
                                    );
                                }
                                if (rows.length === 0) {
                                    rows.push(
                                        <tr key={row.id}>
                                            <td></td>
                                            <td></td>
                                            <td>{name}</td>
                                        </tr>
                                    );
                                }
                                return rows;
                            })}
                            <tr className="cv-section-marker">
                                <td colSpan={3} style={{ textAlign: 'center' }}>
                                    <strong>{label('rirekisho', 'workHistory', lang)}</strong>
                                </td>
                            </tr>
                            {cv.workHistory.flatMap((row) => {
                                const start = parseYearMonth(row.startDate);
                                const end = parseYearMonth(row.endDate);
                                const company = row.companyName || '';
                                const job = row.jobTitle ? ` (${row.jobTitle})` : '';
                                const rows = [];
                                if (row.startDate) {
                                    rows.push(
                                        <tr key={`${row.id}-s`}>
                                            <td>{start.year}</td>
                                            <td>{start.month}</td>
                                            <td>
                                                {company}{job} {lang === 'en' ? 'joined' : '入社'}
                                                {row.contractType ? ` (${contractTypeLabel(row.contractType, lang)})` : ''}
                                            </td>
                                        </tr>
                                    );
                                }
                                if (row.endDate) {
                                    rows.push(
                                        <tr key={`${row.id}-e`}>
                                            <td>{end.year}</td>
                                            <td>{end.month}</td>
                                            <td>{company} {lang === 'en' ? 'left' : '退職'}</td>
                                        </tr>
                                    );
                                }
                                if (rows.length === 0) {
                                    rows.push(
                                        <tr key={row.id}>
                                            <td></td>
                                            <td></td>
                                            <td>{company}{job}</td>
                                        </tr>
                                    );
                                }
                                return rows;
                            })}
                            <tr>
                                <td></td>
                                <td></td>
                                <td style={{ textAlign: 'right' }}>{label('rirekisho', 'endMarker', lang)}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            ) : (
                <>
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'education', lang)}</h2>
                    <div className="cv-card-list">
                        {cv.education.map((row) => (
                            <div key={row.id} className="cv-entry-card">
                                <div className="cv-entry-head">
                                    <strong>{row.schoolName}</strong>
                                    <span className="cv-entry-range">
                                        {formatRange(row.startDate, row.endDate, lang, region)}
                                    </span>
                                </div>
                                {row.degree && <div className="cv-entry-sub">{row.degree}</div>}
                            </div>
                        ))}
                    </div>

                    <h2 className="cv-doc-section-title">{label('rirekisho', 'workHistory', lang)}</h2>
                    <div className="cv-card-list">
                        {cv.workHistory.map((row) => (
                            <div key={row.id} className="cv-entry-card">
                                <div className="cv-entry-head">
                                    <strong>{row.jobTitle}</strong>
                                    <span className="cv-entry-range">
                                        {formatRange(row.startDate, row.endDate, lang, region)}
                                    </span>
                                </div>
                                <div className="cv-entry-sub">
                                    {row.companyName}
                                    {row.contractType && (
                                        <span className="cv-entry-meta"> · {contractTypeLabel(row.contractType, lang)}</span>
                                    )}
                                </div>
                                {row.description && (
                                    <p className="cv-doc-text cv-entry-desc">{row.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ))}

            {isSectionVisible(cv, 'skills') && cv.skills && cv.skills.length > 0 && cv.skills.some((s) => s.category || s.items) && (
                <>
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'skills', lang)}</h2>
                    <table className="cv-table cv-table-skills">
                        <tbody>
                            {cv.skills
                                .filter((s) => s.category || s.items)
                                .map((s) => (
                                    <tr key={s.id || s.category}>
                                        <th>{s.category}</th>
                                        <td>{s.items}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </>
            )}

            {isSectionVisible(cv, 'languages') && cv.languages && cv.languages.some((l) => l.language) && (
                <>
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'languages', lang)}</h2>
                    <div className="cv-lang-list">
                        {cv.languages
                            .filter((l) => l.language)
                            .map((l) => (
                                <div key={l.id} className="cv-lang-pill">
                                    <strong>{l.language}</strong>
                                    {l.level && <span className="cv-lang-level">{l.level}</span>}
                                </div>
                            ))}
                    </div>
                </>
            )}

            {isSectionVisible(cv, 'licenses') && (
                <>
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'licenses', lang)}</h2>
                    <table className="cv-table cv-table-history">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>{label('rirekisho', 'year', lang)}</th>
                                <th style={{ width: '8%' }}>{label('rirekisho', 'month', lang)}</th>
                                <th>{label('rirekisho', 'content', lang)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cv.licenses.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.year}</td>
                                    <td>{row.month}</td>
                                    <td>{row.content}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {(isSectionVisible(cv, 'motivation') || isSectionVisible(cv, 'personalRequests')) && (
                <div className="cv-doc-grid">
                    {isSectionVisible(cv, 'motivation') && (
                        <section className="cv-doc-block">
                            <h2 className="cv-doc-section-title">{label('rirekisho', 'motivation', lang)}</h2>
                            <p className="cv-doc-text">{cv.motivation}</p>
                        </section>
                    )}
                    {isSectionVisible(cv, 'personalRequests') && (
                        <section className="cv-doc-block">
                            <h2 className="cv-doc-section-title">{label('rirekisho', 'personalRequests', lang)}</h2>
                            <p className="cv-doc-text">{cv.personalRequests}</p>
                        </section>
                    )}
                </div>
            )}

            {isJP && (
                <div className="cv-doc-grid cv-doc-grid-4">
                    <div className="cv-doc-mini">
                        <strong>{label('rirekisho', 'commute', lang)}</strong>
                        <p>{cv.commute}</p>
                    </div>
                    <div className="cv-doc-mini">
                        <strong>{label('rirekisho', 'dependents', lang)}</strong>
                        <p>{cv.dependents}</p>
                    </div>
                    <div className="cv-doc-mini">
                        <strong>{label('rirekisho', 'spouse', lang)}</strong>
                        <p>{cv.spouse}</p>
                    </div>
                    <div className="cv-doc-mini">
                        <strong>{label('rirekisho', 'spouseSupport', lang)}</strong>
                        <p>{cv.spouseSupport}</p>
                    </div>
                </div>
            )}
        </article>
    );
}

function ShokumuPreview({ cv }) {
    const lang = cv.language;
    const region = cv.region || 'jp';
    const isJP = region !== 'international';
    const p = cv.personal;
    const today = new Date();
    const dateStr = formatDate(today.toISOString(), lang, region);

    return (
        <article className={`cv-doc cv-theme-${cv.theme} cv-shokumu cv-region-${region}`}>
            <header className="cv-doc-header">
                <h1 className="cv-doc-title">{label('shokumu', 'title', lang)}</h1>
                <div className="cv-doc-date">
                    {label('rirekisho', 'date', lang)}: {dateStr}
                </div>
            </header>

            <div className="cv-shokumu-id">
                <div>
                    {isJP && p.fullNameKana && (
                        <div className="cv-shokumu-name-kana">{p.fullNameKana}</div>
                    )}
                    <div className="cv-shokumu-name">{p.fullName}</div>
                    {p.nationality && (
                        <div className="cv-shokumu-meta">
                            {label('rirekisho', 'nationality', lang)}: {p.nationality}
                        </div>
                    )}
                </div>
                <div className="cv-shokumu-contact">
                    {p.email && <div>✉ {p.email}</div>}
                    {p.phone && <div>☎ {p.phone}</div>}
                    {p.address && (
                        <div>
                            ⌂ {p.address}
                            {!isJP && p.country && `, ${p.country}`}
                        </div>
                    )}
                    {p.linkedin && <div>⛓ {p.linkedin}</div>}
                    {p.website && <div>⌘ {p.website}</div>}
                </div>
            </div>

            {isSectionVisible(cv, 'summary') && cv.summary && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('shokumu', 'summary', lang)}</h2>
                    <p className="cv-doc-text">{cv.summary}</p>
                </section>
            )}

            {isSectionVisible(cv, 'education') && cv.education && cv.education.length > 0 && cv.education.some((e) => e.schoolName || e.degree) && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'education', lang)}</h2>
                    <div className="cv-card-list">
                        {cv.education
                            .filter((e) => e.schoolName || e.degree)
                            .map((row) => (
                                <div key={row.id} className="cv-entry-card">
                                    <div className="cv-entry-head">
                                        <strong>{row.schoolName}</strong>
                                        <span className="cv-entry-range">
                                            {formatRange(row.startDate, row.endDate, lang, region)}
                                        </span>
                                    </div>
                                    {row.degree && <div className="cv-entry-sub">{row.degree}</div>}
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {isSectionVisible(cv, 'companies') && (
            <section className="cv-doc-block">
                <h2 className="cv-doc-section-title">{label('shokumu', 'companies', lang)}</h2>
                {cv.companies.map((c, idx) => (
                    <div key={c.id} className="cv-company-card">
                        <div className="cv-company-card-head">
                            <div>
                                <strong className="cv-company-name">{c.name || `Company ${idx + 1}`}</strong>
                                {c.industry && <span className="cv-company-meta"> — {c.industry}</span>}
                            </div>
                            <span className="cv-company-period">{c.period}</span>
                        </div>
                        {(c.employees || c.capital) && (
                            <div className="cv-company-meta-line">
                                {c.employees && (
                                    <span>{label('shokumu', 'employees', lang)}: {c.employees}</span>
                                )}
                                {c.capital && (
                                    <span>{label('shokumu', 'capital', lang)}: {c.capital}</span>
                                )}
                            </div>
                        )}
                        {c.role && (
                            <div className="cv-company-row">
                                <strong>{label('shokumu', 'role', lang)}:</strong> {c.role}
                            </div>
                        )}
                        {c.description && (
                            <div className="cv-company-row">
                                <strong>{label('shokumu', 'description', lang)}:</strong>
                                <p className="cv-doc-text">{c.description}</p>
                            </div>
                        )}
                        {c.achievements && (
                            <div className="cv-company-row">
                                <strong>{label('shokumu', 'achievements', lang)}:</strong>
                                <p className="cv-doc-text">{c.achievements}</p>
                            </div>
                        )}
                        {c.technologies && (
                            <div className="cv-company-row">
                                <strong>{label('shokumu', 'technologies', lang)}:</strong>{' '}
                                <span className="cv-tech">{c.technologies}</span>
                            </div>
                        )}
                    </div>
                ))}
            </section>
            )}

            {isSectionVisible(cv, 'skills') && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('shokumu', 'skills', lang)}</h2>
                    <table className="cv-table cv-table-skills">
                        <tbody>
                            {(cv.skills || [])
                                .filter((s) => s.category || s.items)
                                .map((s, idx) => (
                                    <tr key={s.id || idx}>
                                        <th>{s.category}</th>
                                        <td>{s.items}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </section>
            )}

            {isSectionVisible(cv, 'languages') && cv.languages && cv.languages.some((l) => l.language) && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('rirekisho', 'languages', lang)}</h2>
                    <div className="cv-lang-list">
                        {cv.languages
                            .filter((l) => l.language)
                            .map((l) => (
                                <div key={l.id} className="cv-lang-pill">
                                    <strong>{l.language}</strong>
                                    {l.level && <span className="cv-lang-level">{l.level}</span>}
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {isSectionVisible(cv, 'qualifications') && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('shokumu', 'qualifications', lang)}</h2>
                    <table className="cv-table cv-table-history">
                        <tbody>
                            {cv.qualifications.map((row) => (
                                <tr key={row.id}>
                                    <td style={{ width: '10%' }}>{row.year}</td>
                                    <td style={{ width: '8%' }}>{row.month}</td>
                                    <td>{row.content}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {isSectionVisible(cv, 'selfPR') && (
                <section className="cv-doc-block">
                    <h2 className="cv-doc-section-title">{label('shokumu', 'selfPR', lang)}</h2>
                    <p className="cv-doc-text">{cv.selfPR}</p>
                </section>
            )}
        </article>
    );
}

function CVPreview({ cv }) {
    if (!cv) return null;
    return cv.kind === CV_TYPES.RIREKISHO ? <RirekishoPreview cv={cv} /> : <ShokumuPreview cv={cv} />;
}

export default CVPreview;
