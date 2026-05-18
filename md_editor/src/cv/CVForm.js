import {
    CV_TYPES,
    emptyHistoryRow,
    emptyCompany,
    emptyEducationItem,
    emptyWorkItem,
    emptySkill,
    emptyLanguage,
    CONTRACT_TYPES,
    LANGUAGE_LEVELS,
    label,
} from './model';

function Field({ label: lbl, children }) {
    return (
        <label className="cv-field">
            <span className="cv-field-label">{lbl}</span>
            {children}
        </label>
    );
}

function HistoryEditor({ rows, onChange, lang, sectionKey }) {
    const update = (id, key, value) => {
        onChange(rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    };
    const add = () => onChange([...rows, emptyHistoryRow()]);
    const remove = (id) => onChange(rows.filter((r) => r.id !== id));

    return (
        <div className="cv-history">
            {rows.map((row) => (
                <div key={row.id} className="cv-history-row">
                    <input
                        className="cv-input cv-input-sm"
                        placeholder={label('rirekisho', 'year', lang)}
                        value={row.year}
                        onChange={(e) => update(row.id, 'year', e.target.value)}
                    />
                    <input
                        className="cv-input cv-input-sm"
                        placeholder={label('rirekisho', 'month', lang)}
                        value={row.month}
                        onChange={(e) => update(row.id, 'month', e.target.value)}
                    />
                    <input
                        className="cv-input cv-input-grow"
                        placeholder={label('rirekisho', 'content', lang)}
                        value={row.content}
                        onChange={(e) => update(row.id, 'content', e.target.value)}
                    />
                    <button
                        type="button"
                        className="cv-row-remove"
                        onClick={() => remove(row.id)}
                        title="削除 / Remove"
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {sectionKey === 'education'
                    ? label('rirekisho', 'education', lang)
                    : sectionKey === 'workHistory'
                    ? label('rirekisho', 'workHistory', lang)
                    : label('rirekisho', 'licenses', lang)}
            </button>
        </div>
    );
}

function EducationEditor({ items, onChange, lang }) {
    const update = (id, key, value) => {
        onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
    };
    const add = () => onChange([...items, emptyEducationItem()]);
    const remove = (id) => onChange(items.filter((it) => it.id !== id));

    return (
        <div className="cv-companies">
            {items.map((it, idx) => (
                <div key={it.id} className="cv-company">
                    <div className="cv-company-head">
                        <span className="cv-company-num">#{idx + 1}</span>
                        <button type="button" className="cv-row-remove" onClick={() => remove(it.id)}>
                            ✕
                        </button>
                    </div>
                    <Field lbl={label('rirekisho', 'schoolName', lang)}>
                        <input
                            className="cv-input"
                            value={it.schoolName}
                            onChange={(e) => update(it.id, 'schoolName', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'degree', lang)}>
                        <input
                            className="cv-input"
                            placeholder="Bachelor of Computer Science / 工学修士"
                            value={it.degree}
                            onChange={(e) => update(it.id, 'degree', e.target.value)}
                        />
                    </Field>
                    <div className="cv-grid-2">
                        <Field lbl={label('rirekisho', 'startDate', lang)}>
                            <input
                                className="cv-input"
                                type="month"
                                value={it.startDate}
                                onChange={(e) => update(it.id, 'startDate', e.target.value)}
                            />
                        </Field>
                        <Field lbl={label('rirekisho', 'endDate', lang)}>
                            <input
                                className="cv-input"
                                type="month"
                                value={it.endDate}
                                onChange={(e) => update(it.id, 'endDate', e.target.value)}
                            />
                        </Field>
                    </div>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {label('rirekisho', 'education', lang)}
            </button>
        </div>
    );
}

function WorkEditor({ items, onChange, lang }) {
    const update = (id, key, value) => {
        onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
    };
    const add = () => onChange([...items, emptyWorkItem()]);
    const remove = (id) => onChange(items.filter((it) => it.id !== id));

    return (
        <div className="cv-companies">
            {items.map((it, idx) => (
                <div key={it.id} className="cv-company">
                    <div className="cv-company-head">
                        <span className="cv-company-num">#{idx + 1}</span>
                        <button type="button" className="cv-row-remove" onClick={() => remove(it.id)}>
                            ✕
                        </button>
                    </div>
                    <Field lbl={label('rirekisho', 'jobTitle', lang)}>
                        <input
                            className="cv-input"
                            placeholder="Software Engineer / ソフトウェアエンジニア"
                            value={it.jobTitle}
                            onChange={(e) => update(it.id, 'jobTitle', e.target.value)}
                        />
                    </Field>
                    <div className="cv-grid-2">
                        <Field lbl={label('rirekisho', 'companyName', lang)}>
                            <input
                                className="cv-input"
                                value={it.companyName}
                                onChange={(e) => update(it.id, 'companyName', e.target.value)}
                            />
                        </Field>
                        <Field lbl={label('rirekisho', 'contractType', lang)}>
                            <select
                                className="cv-input"
                                value={it.contractType}
                                onChange={(e) => update(it.id, 'contractType', e.target.value)}
                            >
                                {CONTRACT_TYPES.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <div className="cv-grid-2">
                        <Field lbl={label('rirekisho', 'startDate', lang)}>
                            <input
                                className="cv-input"
                                type="month"
                                value={it.startDate}
                                onChange={(e) => update(it.id, 'startDate', e.target.value)}
                            />
                        </Field>
                        <Field lbl={label('rirekisho', 'endDate', lang)}>
                            <input
                                className="cv-input"
                                type="month"
                                placeholder="present"
                                value={it.endDate}
                                onChange={(e) => update(it.id, 'endDate', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field lbl={label('rirekisho', 'jobDescription', lang)}>
                        <textarea
                            className="cv-input cv-textarea"
                            rows={3}
                            value={it.description}
                            onChange={(e) => update(it.id, 'description', e.target.value)}
                        />
                    </Field>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {label('rirekisho', 'workHistory', lang)}
            </button>
        </div>
    );
}

function SkillsEditor({ skills, onChange, lang }) {
    const update = (id, key, value) => {
        onChange(skills.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    };
    const add = () => onChange([...skills, emptySkill()]);
    const remove = (id) => onChange(skills.filter((s) => s.id !== id));

    return (
        <div>
            {skills.map((s) => (
                <div key={s.id} className="cv-skill-row">
                    <input
                        className="cv-input cv-input-sm"
                        placeholder="Languages / Tools / ..."
                        value={s.category}
                        onChange={(e) => update(s.id, 'category', e.target.value)}
                        style={{ maxWidth: '140px' }}
                    />
                    <input
                        className="cv-input cv-input-grow"
                        placeholder="React, TypeScript, AWS..."
                        value={s.items}
                        onChange={(e) => update(s.id, 'items', e.target.value)}
                    />
                    <button type="button" className="cv-row-remove" onClick={() => remove(s.id)}>
                        ✕
                    </button>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {label('rirekisho', 'skills', lang)}
            </button>
        </div>
    );
}

function LanguagesEditor({ languages, onChange, lang }) {
    const update = (id, key, value) => {
        onChange(languages.map((l) => (l.id === id ? { ...l, [key]: value } : l)));
    };
    const add = () => onChange([...languages, emptyLanguage()]);
    const remove = (id) => onChange(languages.filter((l) => l.id !== id));

    return (
        <div>
            {languages.map((l) => (
                <div key={l.id} className="cv-skill-row">
                    <input
                        className="cv-input cv-input-grow"
                        placeholder={label('rirekisho', 'languageName', lang)}
                        value={l.language}
                        onChange={(e) => update(l.id, 'language', e.target.value)}
                    />
                    <select
                        className="cv-input"
                        value={l.level}
                        onChange={(e) => update(l.id, 'level', e.target.value)}
                        style={{ maxWidth: '180px' }}
                    >
                        {LANGUAGE_LEVELS.map((lv) => (
                            <option key={lv.id} value={lv.id}>
                                {lv.label}
                            </option>
                        ))}
                    </select>
                    <button type="button" className="cv-row-remove" onClick={() => remove(l.id)}>
                        ✕
                    </button>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {label('rirekisho', 'languages', lang)}
            </button>
        </div>
    );
}

function CompaniesEditor({ companies, onChange, lang }) {
    const update = (id, key, value) => {
        onChange(companies.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    };
    const add = () => onChange([...companies, emptyCompany()]);
    const remove = (id) => onChange(companies.filter((c) => c.id !== id));

    return (
        <div className="cv-companies">
            {companies.map((c, idx) => (
                <div key={c.id} className="cv-company">
                    <div className="cv-company-head">
                        <span className="cv-company-num">#{idx + 1}</span>
                        <button
                            type="button"
                            className="cv-row-remove"
                            onClick={() => remove(c.id)}
                        >
                            ✕
                        </button>
                    </div>
                    <Field lbl={label('shokumu', 'company', lang)}>
                        <input
                            className="cv-input"
                            value={c.name}
                            onChange={(e) => update(c.id, 'name', e.target.value)}
                        />
                    </Field>
                    <div className="cv-grid-2">
                        <Field lbl={label('shokumu', 'period', lang)}>
                            <input
                                className="cv-input"
                                placeholder="2020/04 - 2024/03"
                                value={c.period}
                                onChange={(e) => update(c.id, 'period', e.target.value)}
                            />
                        </Field>
                        <Field lbl={label('shokumu', 'industry', lang)}>
                            <input
                                className="cv-input"
                                value={c.industry}
                                onChange={(e) => update(c.id, 'industry', e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="cv-grid-2">
                        <Field lbl={label('shokumu', 'employees', lang)}>
                            <input
                                className="cv-input"
                                value={c.employees}
                                onChange={(e) => update(c.id, 'employees', e.target.value)}
                            />
                        </Field>
                        <Field lbl={label('shokumu', 'capital', lang)}>
                            <input
                                className="cv-input"
                                value={c.capital}
                                onChange={(e) => update(c.id, 'capital', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field lbl={label('shokumu', 'role', lang)}>
                        <input
                            className="cv-input"
                            value={c.role}
                            onChange={(e) => update(c.id, 'role', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('shokumu', 'description', lang)}>
                        <textarea
                            className="cv-input cv-textarea"
                            rows={3}
                            value={c.description}
                            onChange={(e) => update(c.id, 'description', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('shokumu', 'achievements', lang)}>
                        <textarea
                            className="cv-input cv-textarea"
                            rows={3}
                            value={c.achievements}
                            onChange={(e) => update(c.id, 'achievements', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('shokumu', 'technologies', lang)}>
                        <input
                            className="cv-input"
                            placeholder="React, TypeScript, AWS..."
                            value={c.technologies}
                            onChange={(e) => update(c.id, 'technologies', e.target.value)}
                        />
                    </Field>
                </div>
            ))}
            <button type="button" className="cv-row-add" onClick={add}>
                + {label('shokumu', 'company', lang)}
            </button>
        </div>
    );
}

function RirekishoForm({ cv, update, lang }) {
    const p = cv.personal;
    const setP = (key, value) => update({ ...cv, personal: { ...p, [key]: value } });
    const isJP = cv.region !== 'international';

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => update({ ...cv, photo: reader.result });
        reader.readAsDataURL(file);
    };

    return (
        <>
            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'photo', lang)}</h3>
                <div className="cv-photo-wrap">
                    {cv.photo ? (
                        <img src={cv.photo} alt="" className="cv-photo-preview" />
                    ) : (
                        <div className="cv-photo-placeholder">
                            {label('rirekisho', 'photoHint', lang)}
                        </div>
                    )}
                    <div className="cv-photo-actions">
                        <label className="cv-row-add" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhoto}
                                style={{ display: 'none' }}
                            />
                            + {label('rirekisho', 'photo', lang)}
                        </label>
                        {cv.photo && (
                            <button
                                type="button"
                                className="cv-row-remove"
                                onClick={() => update({ ...cv, photo: null })}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">基本情報 / Personal</h3>
                {isJP && (
                    <Field lbl={label('rirekisho', 'fullNameKana', lang)}>
                        <input
                            className="cv-input"
                            value={p.fullNameKana}
                            onChange={(e) => setP('fullNameKana', e.target.value)}
                        />
                    </Field>
                )}
                <Field lbl={label('rirekisho', 'fullName', lang)}>
                    <input
                        className="cv-input"
                        value={p.fullName}
                        onChange={(e) => setP('fullName', e.target.value)}
                    />
                </Field>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'birthDate', lang)}>
                        <input
                            className="cv-input"
                            type="date"
                            value={p.birthDate}
                            onChange={(e) => setP('birthDate', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'gender', lang)}>
                        <select
                            className="cv-input"
                            value={p.gender}
                            onChange={(e) => setP('gender', e.target.value)}
                        >
                            <option value="">—</option>
                            <option value="male">{label('rirekisho', 'male', lang)}</option>
                            <option value="female">{label('rirekisho', 'female', lang)}</option>
                        </select>
                    </Field>
                </div>
                <Field lbl={label('rirekisho', 'nationality', lang)}>
                    <input
                        className="cv-input"
                        value={p.nationality}
                        onChange={(e) => setP('nationality', e.target.value)}
                    />
                </Field>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'country', lang)}>
                        <input
                            className="cv-input"
                            placeholder={isJP ? '日本' : 'Italy / France / ...'}
                            value={p.country}
                            onChange={(e) => setP('country', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'postalCode', lang)}>
                        <input
                            className="cv-input"
                            placeholder={isJP ? '000-0000' : 'ZIP / Postal'}
                            value={p.postalCode}
                            onChange={(e) => setP('postalCode', e.target.value)}
                        />
                    </Field>
                </div>
                {isJP && (
                    <Field lbl={label('rirekisho', 'addressKana', lang)}>
                        <input
                            className="cv-input"
                            value={p.addressKana}
                            onChange={(e) => setP('addressKana', e.target.value)}
                        />
                    </Field>
                )}
                <Field lbl={label('rirekisho', 'address', lang)}>
                    <input
                        className="cv-input"
                        value={p.address}
                        onChange={(e) => setP('address', e.target.value)}
                    />
                </Field>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'phone', lang)}>
                        <input
                            className="cv-input"
                            placeholder={isJP ? '090-0000-0000' : '+39 ...'}
                            value={p.phone}
                            onChange={(e) => setP('phone', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'email', lang)}>
                        <input
                            className="cv-input"
                            type="email"
                            value={p.email}
                            onChange={(e) => setP('email', e.target.value)}
                        />
                    </Field>
                </div>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'linkedin', lang)}>
                        <input
                            className="cv-input"
                            placeholder="linkedin.com/in/..."
                            value={p.linkedin}
                            onChange={(e) => setP('linkedin', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'website', lang)}>
                        <input
                            className="cv-input"
                            placeholder="example.com"
                            value={p.website}
                            onChange={(e) => setP('website', e.target.value)}
                        />
                    </Field>
                </div>
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'summary', lang)}</h3>
                <textarea
                    className="cv-input cv-textarea"
                    rows={4}
                    placeholder={lang === 'jp'
                        ? '簡潔な自己紹介を書いてください...'
                        : 'A short professional summary...'}
                    value={cv.summary || ''}
                    onChange={(e) => update({ ...cv, summary: e.target.value })}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'education', lang)}</h3>
                <EducationEditor
                    items={cv.education}
                    onChange={(items) => update({ ...cv, education: items })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'workHistory', lang)}</h3>
                <WorkEditor
                    items={cv.workHistory}
                    onChange={(items) => update({ ...cv, workHistory: items })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'skills', lang)}</h3>
                <SkillsEditor
                    skills={cv.skills || []}
                    onChange={(skills) => update({ ...cv, skills })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'languages', lang)}</h3>
                <LanguagesEditor
                    languages={cv.languages || []}
                    onChange={(languages) => update({ ...cv, languages })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'licenses', lang)}</h3>
                <HistoryEditor
                    rows={cv.licenses}
                    onChange={(rows) => update({ ...cv, licenses: rows })}
                    lang={lang}
                    sectionKey="licenses"
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'motivation', lang)}</h3>
                <textarea
                    className="cv-input cv-textarea"
                    rows={5}
                    value={cv.motivation}
                    onChange={(e) => update({ ...cv, motivation: e.target.value })}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'personalRequests', lang)}</h3>
                <textarea
                    className="cv-input cv-textarea"
                    rows={4}
                    value={cv.personalRequests}
                    onChange={(e) => update({ ...cv, personalRequests: e.target.value })}
                />
            </section>

            {isJP && (
                <section className="cv-section">
                    <div className="cv-grid-2">
                        <Field lbl={label('rirekisho', 'commute', lang)}>
                            <input
                                className="cv-input"
                                placeholder="約 30 分"
                                value={cv.commute}
                                onChange={(e) => update({ ...cv, commute: e.target.value })}
                            />
                        </Field>
                        <Field lbl={label('rirekisho', 'dependents', lang)}>
                            <input
                                className="cv-input"
                                value={cv.dependents}
                                onChange={(e) => update({ ...cv, dependents: e.target.value })}
                            />
                        </Field>
                    </div>
                    <div className="cv-grid-2">
                        <Field lbl={label('rirekisho', 'spouse', lang)}>
                            <select
                                className="cv-input"
                                value={cv.spouse}
                                onChange={(e) => update({ ...cv, spouse: e.target.value })}
                            >
                                <option value="">—</option>
                                <option value="有">有 / Yes</option>
                                <option value="無">無 / No</option>
                            </select>
                        </Field>
                        <Field lbl={label('rirekisho', 'spouseSupport', lang)}>
                            <select
                                className="cv-input"
                                value={cv.spouseSupport}
                                onChange={(e) => update({ ...cv, spouseSupport: e.target.value })}
                            >
                                <option value="">—</option>
                                <option value="有">有 / Yes</option>
                                <option value="無">無 / No</option>
                            </select>
                        </Field>
                    </div>
                </section>
            )}
        </>
    );
}

function ShokumuForm({ cv, update, lang }) {
    const p = cv.personal;
    const setP = (key, value) => update({ ...cv, personal: { ...p, [key]: value } });
    const isJP = cv.region !== 'international';

    return (
        <>
            <section className="cv-section">
                <h3 className="cv-section-title">基本情報 / Personal</h3>
                <Field lbl={label('rirekisho', 'fullName', lang)}>
                    <input
                        className="cv-input"
                        value={p.fullName}
                        onChange={(e) => setP('fullName', e.target.value)}
                    />
                </Field>
                {isJP && (
                    <Field lbl={label('rirekisho', 'fullNameKana', lang)}>
                        <input
                            className="cv-input"
                            value={p.fullNameKana}
                            onChange={(e) => setP('fullNameKana', e.target.value)}
                        />
                    </Field>
                )}
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'birthDate', lang)}>
                        <input
                            className="cv-input"
                            type="date"
                            value={p.birthDate}
                            onChange={(e) => setP('birthDate', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'nationality', lang)}>
                        <input
                            className="cv-input"
                            value={p.nationality}
                            onChange={(e) => setP('nationality', e.target.value)}
                        />
                    </Field>
                </div>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'phone', lang)}>
                        <input
                            className="cv-input"
                            value={p.phone}
                            onChange={(e) => setP('phone', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'email', lang)}>
                        <input
                            className="cv-input"
                            type="email"
                            value={p.email}
                            onChange={(e) => setP('email', e.target.value)}
                        />
                    </Field>
                </div>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'country', lang)}>
                        <input
                            className="cv-input"
                            placeholder={isJP ? '日本' : 'Italy / France / ...'}
                            value={p.country}
                            onChange={(e) => setP('country', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'address', lang)}>
                        <input
                            className="cv-input"
                            value={p.address}
                            onChange={(e) => setP('address', e.target.value)}
                        />
                    </Field>
                </div>
                <div className="cv-grid-2">
                    <Field lbl={label('rirekisho', 'linkedin', lang)}>
                        <input
                            className="cv-input"
                            placeholder="linkedin.com/in/..."
                            value={p.linkedin}
                            onChange={(e) => setP('linkedin', e.target.value)}
                        />
                    </Field>
                    <Field lbl={label('rirekisho', 'website', lang)}>
                        <input
                            className="cv-input"
                            placeholder="example.com"
                            value={p.website}
                            onChange={(e) => setP('website', e.target.value)}
                        />
                    </Field>
                </div>
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('shokumu', 'summary', lang)}</h3>
                <textarea
                    className="cv-input cv-textarea"
                    rows={4}
                    value={cv.summary}
                    onChange={(e) => update({ ...cv, summary: e.target.value })}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'education', lang)}</h3>
                <EducationEditor
                    items={cv.education || []}
                    onChange={(items) => update({ ...cv, education: items })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('shokumu', 'companies', lang)}</h3>
                <CompaniesEditor
                    companies={cv.companies}
                    onChange={(companies) => update({ ...cv, companies })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('shokumu', 'skills', lang)}</h3>
                <SkillsEditor
                    skills={(cv.skills || []).map((s) =>
                        s.id ? s : { ...s, id: crypto.randomUUID() }
                    )}
                    onChange={(skills) => update({ ...cv, skills })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('rirekisho', 'languages', lang)}</h3>
                <LanguagesEditor
                    languages={cv.languages || []}
                    onChange={(languages) => update({ ...cv, languages })}
                    lang={lang}
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('shokumu', 'qualifications', lang)}</h3>
                <HistoryEditor
                    rows={cv.qualifications}
                    onChange={(rows) => update({ ...cv, qualifications: rows })}
                    lang={lang}
                    sectionKey="licenses"
                />
            </section>

            <section className="cv-section">
                <h3 className="cv-section-title">{label('shokumu', 'selfPR', lang)}</h3>
                <textarea
                    className="cv-input cv-textarea"
                    rows={6}
                    value={cv.selfPR}
                    onChange={(e) => update({ ...cv, selfPR: e.target.value })}
                />
            </section>
        </>
    );
}

function CVForm({ cv, onChange }) {
    if (!cv) return null;
    const lang = cv.language;
    const props = { cv, update: onChange, lang };
    return (
        <div className="cv-form">
            {cv.kind === CV_TYPES.RIREKISHO ? (
                <RirekishoForm {...props} />
            ) : (
                <ShokumuForm {...props} />
            )}
        </div>
    );
}

export default CVForm;
