// CV data model and factories for rirekisho / shokumu keirekisho.

export const CV_TYPES = {
    RIREKISHO: 'rirekisho',
    SHOKUMU: 'shokumu',
};

export const LANGUAGES = ['jp', 'en', 'bilingual'];

export const REGIONS = ['jp', 'international'];

export const THEMES = [
    'jis', 'minimal', 'sakura', 'corporate', 'zen',
    'aurora', 'brutalist', 'editorial', 'neon', 'sunset',
];

export function emptyRirekisho() {
    return {
        id: crypto.randomUUID(),
        kind: CV_TYPES.RIREKISHO,
        title: '新しい履歴書',
        theme: 'jis',
        language: 'bilingual',
        region: 'jp',
        photo: null,
        personal: {
            fullName: '',
            fullNameKana: '',
            birthDate: '',
            age: '',
            gender: '',
            nationality: '',
            postalCode: '',
            country: '',
            address: '',
            addressKana: '',
            phone: '',
            email: '',
            linkedin: '',
            website: '',
            contactAddress: '',
            contactPhone: '',
        },
        summary: '',
        sections: defaultSections(CV_TYPES.RIREKISHO),
        education: [emptyEducationItem()],
        workHistory: [emptyWorkItem()],
        skills: [emptySkill()],
        languages: [emptyLanguage()],
        licenses: [emptyLicenseRow()],
        motivation: '',
        personalRequests: '',
        commute: '',
        dependents: '',
        spouse: '',
        spouseSupport: '',
        updatedAt: Date.now(),
    };
}

export function emptyShokumu() {
    return {
        id: crypto.randomUUID(),
        kind: CV_TYPES.SHOKUMU,
        title: '新しい職務経歴書',
        theme: 'minimal',
        language: 'bilingual',
        region: 'jp',
        photo: null,
        personal: {
            fullName: '',
            fullNameKana: '',
            birthDate: '',
            phone: '',
            email: '',
            address: '',
            country: '',
            nationality: '',
            linkedin: '',
            website: '',
        },
        summary: '',
        sections: defaultSections(CV_TYPES.SHOKUMU),
        education: [emptyEducationItem()],
        companies: [emptyCompany()],
        skills: [emptySkill()],
        languages: [emptyLanguage()],
        qualifications: [emptyLicenseRow()],
        selfPR: '',
        updatedAt: Date.now(),
    };
}

export function emptyHistoryRow() {
    return { id: crypto.randomUUID(), year: '', month: '', content: '' };
}

export function emptyLicenseRow() {
    return { id: crypto.randomUUID(), year: '', month: '', content: '' };
}

export function emptyEducationItem() {
    return {
        id: crypto.randomUUID(),
        schoolName: '',
        degree: '',
        startDate: '',
        endDate: '',
    };
}

export function emptyWorkItem() {
    return {
        id: crypto.randomUUID(),
        jobTitle: '',
        companyName: '',
        contractType: '',
        description: '',
        startDate: '',
        endDate: '',
    };
}

export function emptySkill() {
    return { id: crypto.randomUUID(), category: '', items: '' };
}

export function emptyLanguage() {
    return { id: crypto.randomUUID(), language: '', level: '' };
}

export const RIREKISHO_SECTIONS = [
    { key: 'summary', labelJp: '自己紹介', labelEn: 'Summary' },
    { key: 'education', labelJp: '学歴', labelEn: 'Education' },
    { key: 'workHistory', labelJp: '職歴', labelEn: 'Work History' },
    { key: 'skills', labelJp: 'スキル', labelEn: 'Skills' },
    { key: 'languages', labelJp: '語学', labelEn: 'Languages' },
    { key: 'licenses', labelJp: '免許・資格', labelEn: 'Licenses' },
    { key: 'motivation', labelJp: '志望動機', labelEn: 'Motivation' },
    { key: 'personalRequests', labelJp: '本人希望', labelEn: 'Personal Requests' },
];

export const SHOKUMU_SECTIONS = [
    { key: 'summary', labelJp: '職務要約', labelEn: 'Summary' },
    { key: 'education', labelJp: '学歴', labelEn: 'Education' },
    { key: 'companies', labelJp: '職務経歴', labelEn: 'Work Experience' },
    { key: 'skills', labelJp: 'スキル', labelEn: 'Skills' },
    { key: 'languages', labelJp: '語学', labelEn: 'Languages' },
    { key: 'qualifications', labelJp: '資格', labelEn: 'Qualifications' },
    { key: 'selfPR', labelJp: '自己PR', labelEn: 'Self PR' },
];

function defaultSections(kind) {
    const keys = (kind === CV_TYPES.SHOKUMU ? SHOKUMU_SECTIONS : RIREKISHO_SECTIONS).map((s) => s.key);
    return Object.fromEntries(keys.map((k) => [k, true]));
}

export function isSectionVisible(cv, key) {
    if (!cv || !cv.sections) return true;
    return cv.sections[key] !== false;
}

export const LANGUAGE_LEVELS = [
    { id: '', label: '—' },
    { id: 'native', label: 'Native / 母語' },
    { id: 'fluent', label: 'Fluent / 流暢' },
    { id: 'business', label: 'Business / ビジネスレベル' },
    { id: 'conversational', label: 'Conversational / 日常会話' },
    { id: 'basic', label: 'Basic / 初級' },
    { id: 'C2', label: 'CEFR C2' },
    { id: 'C1', label: 'CEFR C1' },
    { id: 'B2', label: 'CEFR B2' },
    { id: 'B1', label: 'CEFR B1' },
    { id: 'A2', label: 'CEFR A2' },
    { id: 'A1', label: 'CEFR A1' },
    { id: 'JLPT-N1', label: 'JLPT N1' },
    { id: 'JLPT-N2', label: 'JLPT N2' },
    { id: 'JLPT-N3', label: 'JLPT N3' },
    { id: 'JLPT-N4', label: 'JLPT N4' },
    { id: 'JLPT-N5', label: 'JLPT N5' },
];

export function migrateLegacyCV(cv) {
    if (!cv) return cv;
    const migrated = { ...cv };
    const migrateEduRow = (r) => {
        if (!r) return emptyEducationItem();
        if (r.schoolName !== undefined) return r;
        if (r.content !== undefined) {
            return {
                id: r.id || crypto.randomUUID(),
                schoolName: r.content || '',
                degree: '',
                startDate: r.year ? `${r.year}-${String(r.month || 1).padStart(2, '0')}` : '',
                endDate: '',
            };
        }
        return emptyEducationItem();
    };
    const migrateWorkRow = (r) => {
        if (!r) return emptyWorkItem();
        if (r.jobTitle !== undefined) return r;
        if (r.content !== undefined) {
            return {
                id: r.id || crypto.randomUUID(),
                jobTitle: '',
                companyName: r.content || '',
                contractType: '',
                description: '',
                startDate: r.year ? `${r.year}-${String(r.month || 1).padStart(2, '0')}` : '',
                endDate: '',
            };
        }
        return emptyWorkItem();
    };
    if (Array.isArray(migrated.education)) {
        migrated.education = migrated.education.map(migrateEduRow);
    }
    if (Array.isArray(migrated.workHistory)) {
        migrated.workHistory = migrated.workHistory.map(migrateWorkRow);
    }
    if (Array.isArray(migrated.skills)) {
        migrated.skills = migrated.skills.map((s) =>
            s && s.id ? s : { id: crypto.randomUUID(), category: s?.category || '', items: s?.items || '' }
        );
    } else {
        migrated.skills = [emptySkill()];
    }
    if (!migrated.region) migrated.region = 'jp';
    if (!migrated.sections || typeof migrated.sections !== 'object') {
        migrated.sections = defaultSections(migrated.kind);
    } else {
        const defaults = defaultSections(migrated.kind);
        migrated.sections = { ...defaults, ...migrated.sections };
    }
    if (migrated.summary === undefined) migrated.summary = '';
    if (!Array.isArray(migrated.languages) || migrated.languages.length === 0) {
        migrated.languages = [emptyLanguage()];
    } else {
        migrated.languages = migrated.languages.map((l) =>
            l && l.id ? l : { id: crypto.randomUUID(), language: l?.language || '', level: l?.level || '' }
        );
    }
    if (!migrated.personal) migrated.personal = {};
    const p = migrated.personal;
    ['country', 'nationality', 'linkedin', 'website'].forEach((k) => {
        if (p[k] === undefined) p[k] = '';
    });
    return migrated;
}

export const CONTRACT_TYPES = [
    { id: '', label: '—' },
    { id: '正社員', label: '正社員 / Full-time' },
    { id: '契約社員', label: '契約社員 / Contract' },
    { id: 'パート', label: 'パート / Part-time' },
    { id: '派遣', label: '派遣 / Dispatch' },
    { id: 'インターン', label: 'インターン / Internship' },
    { id: 'フリーランス', label: 'フリーランス / Freelance' },
    { id: 'アルバイト', label: 'アルバイト / Casual' },
];

export function emptyCompany() {
    return {
        id: crypto.randomUUID(),
        name: '',
        period: '',
        industry: '',
        employees: '',
        capital: '',
        role: '',
        description: '',
        achievements: '',
        technologies: '',
    };
}

// ── i18n labels ──────────────────────────────────────────────────
export const LABELS = {
    rirekisho: {
        title: { jp: '履歴書', en: 'Curriculum Vitae' },
        date: { jp: '記入日', en: 'Date' },
        photo: { jp: '写真', en: 'Photo' },
        photoHint: { jp: '縦4cm × 横3cm', en: '4cm × 3cm' },
        fullName: { jp: '氏名', en: 'Full Name' },
        fullNameKana: { jp: 'ふりがな', en: 'Furigana' },
        birthDate: { jp: '生年月日', en: 'Date of Birth' },
        age: { jp: '満 ... 歳', en: 'Age' },
        gender: { jp: '性別', en: 'Gender' },
        male: { jp: '男', en: 'Male' },
        female: { jp: '女', en: 'Female' },
        address: { jp: '現住所', en: 'Address' },
        addressKana: { jp: 'ふりがな', en: 'Address (Kana)' },
        postalCode: { jp: '〒', en: 'Postal Code' },
        phone: { jp: '電話', en: 'Phone' },
        email: { jp: 'E-mail', en: 'Email' },
        contact: { jp: '連絡先', en: 'Contact' },
        country: { jp: '国', en: 'Country' },
        nationality: { jp: '国籍', en: 'Nationality' },
        linkedin: { jp: 'LinkedIn', en: 'LinkedIn' },
        website: { jp: 'ウェブサイト', en: 'Website' },
        education: { jp: '学歴', en: 'Education' },
        workHistory: { jp: '職歴', en: 'Work History' },
        schoolName: { jp: '学校名', en: 'School / University' },
        degree: { jp: '学位・専攻', en: 'Degree / Major' },
        startDate: { jp: '開始', en: 'Start' },
        endDate: { jp: '終了', en: 'End' },
        jobTitle: { jp: '職種', en: 'Job Title' },
        companyName: { jp: '会社名', en: 'Company' },
        contractType: { jp: '雇用形態', en: 'Contract Type' },
        jobDescription: { jp: '業務内容', en: 'Description' },
        skills: { jp: 'スキル', en: 'Skills' },
        summary: { jp: '自己紹介', en: 'Professional Summary' },
        languages: { jp: '語学', en: 'Languages' },
        languageName: { jp: '言語', en: 'Language' },
        languageLevel: { jp: 'レベル', en: 'Level' },
        licenses: { jp: '免許・資格', en: 'Licenses & Certifications' },
        motivation: { jp: '志望の動機', en: 'Motivation' },
        personalRequests: { jp: '本人希望記入欄', en: 'Personal Requests' },
        commute: { jp: '通勤時間', en: 'Commute Time' },
        dependents: { jp: '扶養家族', en: 'Dependents' },
        spouse: { jp: '配偶者', en: 'Spouse' },
        spouseSupport: { jp: '配偶者の扶養義務', en: 'Spouse Support' },
        year: { jp: '年', en: 'Year' },
        month: { jp: '月', en: 'Month' },
        content: { jp: '学歴・職歴の内容', en: 'Details' },
        endMarker: { jp: '以上', en: 'End' },
    },
    shokumu: {
        title: { jp: '職務経歴書', en: 'Professional Résumé' },
        summary: { jp: '職務要約', en: 'Career Summary' },
        companies: { jp: '職務経歴', en: 'Work Experience' },
        company: { jp: '会社名', en: 'Company' },
        period: { jp: '在籍期間', en: 'Period' },
        industry: { jp: '業種', en: 'Industry' },
        employees: { jp: '従業員数', en: 'Employees' },
        capital: { jp: '資本金', en: 'Capital' },
        role: { jp: '担当業務', en: 'Role' },
        description: { jp: '職務内容', en: 'Description' },
        achievements: { jp: '実績・成果', en: 'Achievements' },
        technologies: { jp: '使用技術', en: 'Technologies' },
        skills: { jp: '活かせるスキル', en: 'Skills' },
        qualifications: { jp: '資格・免許', en: 'Qualifications' },
        selfPR: { jp: '自己PR', en: 'Self PR' },
    },
};

export function label(section, key, lang) {
    const entry = LABELS[section]?.[key];
    if (!entry) return key;
    if (lang === 'jp') return entry.jp;
    if (lang === 'en') return entry.en;
    return `${entry.jp} / ${entry.en}`;
}

// ── theme metadata ───────────────────────────────────────────────
export const THEME_META = {
    jis: {
        name: 'Traditional JIS',
        nameJp: '伝統的JIS',
        description: '日本工業規格準拠の伝統的なフォーマット',
        accent: '#1c1812',
        font: 'serif',
    },
    minimal: {
        name: 'Modern Minimal',
        nameJp: 'モダン・ミニマル',
        description: 'ミニマリストな現代風レイアウト',
        accent: '#0f172a',
        font: 'sans',
    },
    sakura: {
        name: 'Sakura Elegant',
        nameJp: '桜エレガント',
        description: '桜色を基調とした優雅なデザイン',
        accent: '#c2185b',
        font: 'serif',
    },
    corporate: {
        name: 'Corporate Navy',
        nameJp: 'コーポレート・ネイビー',
        description: '企業向けの紺青色フォーマル',
        accent: '#1e3a5f',
        font: 'sans',
    },
    zen: {
        name: 'Zen Monochrome',
        nameJp: '禅・モノクローム',
        description: '墨絵のような静謐なモノクローム',
        accent: '#2d2d2d',
        font: 'serif',
        region: 'jp',
    },
    aurora: {
        name: 'Aurora Gradient',
        nameJp: 'オーロラ',
        description: 'Vibrant gradient with bold typography — Europe/US',
        accent: '#7c3aed',
        font: 'sans',
        region: 'international',
    },
    brutalist: {
        name: 'Brutalist Bold',
        nameJp: 'ブルータリスト',
        description: 'High-contrast B/W, giant display type — Europe/US',
        accent: '#000000',
        font: 'sans',
        region: 'international',
    },
    editorial: {
        name: 'Editorial Magazine',
        nameJp: 'エディトリアル',
        description: 'Magazine-style with drop-caps and columns — Europe',
        accent: '#7c2d12',
        font: 'serif',
        region: 'international',
    },
    neon: {
        name: 'Neon Cyber',
        nameJp: 'ネオン・サイバー',
        description: 'Dark mode with neon green accents — tech creative',
        accent: '#10b981',
        font: 'mono',
        region: 'international',
    },
    sunset: {
        name: 'Sunset Warm',
        nameJp: 'サンセット',
        description: 'Warm gradient palette with expressive type — Europe/US',
        accent: '#ea580c',
        font: 'sans',
        region: 'international',
    },
};

// Backfill region tag on the original 5 themes.
THEME_META.jis.region = 'jp';
THEME_META.minimal.region = 'both';
THEME_META.sakura.region = 'jp';
THEME_META.corporate.region = 'both';
THEME_META.zen.region = 'jp';
