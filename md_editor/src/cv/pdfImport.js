// PDF text extraction + heuristic field mapping for rirekisho/shokumu keirekisho.
// Uses pdfjs-dist; worker is sourced from CDN to avoid bundler config in CRA/craco.

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { emptyRirekisho, emptyShokumu, CV_TYPES } from './model';

function toMonthInput(year, month) {
    if (!year) return '';
    const m = String(month || 1).padStart(2, '0');
    return `${year}-${m}`;
}

const PDFJS_VERSION = pdfjsLib.version || '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items
            .filter((it) => 'str' in it)
            .map((it) => ({
                str: it.str,
                x: it.transform?.[4] ?? 0,
                y: it.transform?.[5] ?? 0,
            }));
        const lines = groupItemsByLine(items);
        pages.push(lines);
    }
    return pages;
}

function groupItemsByLine(items, tolerance = 3) {
    const sorted = items.slice().sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    let current = null;
    for (const it of sorted) {
        if (!current || Math.abs(current.y - it.y) > tolerance) {
            current = { y: it.y, parts: [it] };
            lines.push(current);
        } else {
            current.parts.push(it);
        }
    }
    return lines.map((line) =>
        line.parts
            .sort((a, b) => a.x - b.x)
            .map((p) => p.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
    ).filter(Boolean);
}

function detectKind(text) {
    if (/職務経歴書|Professional\s*Résumé|Professional\s*Resume/i.test(text)) {
        return CV_TYPES.SHOKUMU;
    }
    return CV_TYPES.RIREKISHO;
}

function findValue(lines, patterns) {
    for (const line of lines) {
        for (const pattern of patterns) {
            const m = line.match(pattern);
            if (m && m[1]) return m[1].trim();
        }
    }
    return '';
}

function findEmail(text) {
    const m = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return m ? m[0] : '';
}

function findPhone(text) {
    const m = text.match(/(?:\+?\d[\d\s\-()]{7,}\d)/);
    return m ? m[0].trim() : '';
}

function findPostal(text) {
    const m = text.match(/〒?\s*(\d{3}-\d{4})/);
    return m ? m[1] : '';
}

function findBirthDate(text) {
    const m =
        text.match(/(\d{4})[年./-](\d{1,2})[月./-](\d{1,2})/) ||
        text.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '';
    const [, y, mo, d] = m;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function extractHistoryRows(lines, startMarkers, endMarkers) {
    const out = [];
    let inSection = false;
    for (const line of lines) {
        if (startMarkers.some((m) => line.includes(m))) {
            inSection = true;
            continue;
        }
        if (inSection && endMarkers.some((m) => line.includes(m))) {
            break;
        }
        if (!inSection) continue;
        const m = line.match(/^(\d{4})\s*[年./-]?\s*(\d{1,2})\s*[月./-]?\s+(.+)$/);
        if (m) {
            out.push({
                id: crypto.randomUUID(),
                year: m[1],
                month: m[2],
                content: m[3].trim(),
            });
        }
    }
    return out;
}

function pairRowsIntoEducation(rows) {
    const items = [];
    let current = null;
    for (const r of rows) {
        const isStart = /入学|入校|enrolled|started/i.test(r.content);
        const isEnd = /卒業|修了|graduated|completed/i.test(r.content);
        const cleanedName = r.content.replace(/(入学|入校|卒業|修了|enrolled|graduated|started|completed)/gi, '').trim();
        if (isStart) {
            current = {
                id: crypto.randomUUID(),
                schoolName: cleanedName,
                degree: '',
                startDate: toMonthInput(r.year, r.month),
                endDate: '',
            };
            items.push(current);
        } else if (isEnd && current && current.schoolName === cleanedName) {
            current.endDate = toMonthInput(r.year, r.month);
            current = null;
        } else {
            items.push({
                id: crypto.randomUUID(),
                schoolName: cleanedName,
                degree: '',
                startDate: toMonthInput(r.year, r.month),
                endDate: '',
            });
        }
    }
    return items;
}

function pairRowsIntoWork(rows) {
    const items = [];
    let current = null;
    for (const r of rows) {
        const isJoin = /入社|joined|started/i.test(r.content);
        const isLeave = /退職|left|ended/i.test(r.content);
        const cleanedCompany = r.content.replace(/(入社|退職|joined|left|started|ended)/gi, '').trim();
        if (isJoin) {
            current = {
                id: crypto.randomUUID(),
                jobTitle: '',
                companyName: cleanedCompany,
                contractType: '',
                description: '',
                startDate: toMonthInput(r.year, r.month),
                endDate: '',
            };
            items.push(current);
        } else if (isLeave && current && current.companyName === cleanedCompany) {
            current.endDate = toMonthInput(r.year, r.month);
            current = null;
        } else {
            items.push({
                id: crypto.randomUUID(),
                jobTitle: '',
                companyName: cleanedCompany,
                contractType: '',
                description: '',
                startDate: toMonthInput(r.year, r.month),
                endDate: '',
            });
        }
    }
    return items;
}

export function parseRirekishoFromText(pages) {
    const allLines = pages.flat();
    const text = allLines.join('\n');
    const cv = emptyRirekisho();

    cv.personal.email = findEmail(text);
    cv.personal.phone = findPhone(text);
    cv.personal.postalCode = findPostal(text);
    cv.personal.birthDate = findBirthDate(text);

    cv.personal.fullName = findValue(allLines, [
        /(?:氏名|Name)[:：\s]+([^\s]+(?:\s+[^\s]+)?)/,
    ]);
    cv.personal.fullNameKana = findValue(allLines, [
        /(?:ふりがな|フリガナ|Furigana)[:：\s]+([^\s]+(?:\s+[^\s]+)?)/,
    ]);
    cv.personal.address = findValue(allLines, [
        /(?:現住所|住所|Address)[:：\s]+(.+)/,
    ]);

    const education = extractHistoryRows(
        allLines,
        ['学歴', 'Education'],
        ['職歴', 'Work History', 'Work Experience']
    );
    const work = extractHistoryRows(
        allLines,
        ['職歴', 'Work History', 'Work Experience'],
        ['免許', '資格', 'Licenses', '志望', 'Motivation']
    );
    const licenses = extractHistoryRows(
        allLines,
        ['免許', '資格', 'Licenses'],
        ['志望', 'Motivation', '本人希望', 'Personal']
    );

    if (education.length) cv.education = pairRowsIntoEducation(education);
    if (work.length) cv.workHistory = pairRowsIntoWork(work);
    if (licenses.length) cv.licenses = licenses;

    cv.motivation = findValue(allLines, [/(?:志望(?:の)?動機|Motivation)[:：\s]+(.+)/]);
    cv.personalRequests = findValue(allLines, [
        /(?:本人希望(?:記入欄)?|Personal Requests)[:：\s]+(.+)/,
    ]);

    return cv;
}

export function parseShokumuFromText(pages) {
    const allLines = pages.flat();
    const text = allLines.join('\n');
    const cv = emptyShokumu();

    cv.personal.email = findEmail(text);
    cv.personal.phone = findPhone(text);
    cv.personal.birthDate = findBirthDate(text);

    cv.personal.fullName = findValue(allLines, [
        /(?:氏名|Name)[:：\s]+([^\s]+(?:\s+[^\s]+)?)/,
    ]);
    cv.personal.address = findValue(allLines, [/(?:住所|Address)[:：\s]+(.+)/]);

    cv.summary = findValue(allLines, [
        /(?:職務要約|Summary|Career Summary)[:：\s]+(.+)/,
    ]);
    cv.selfPR = findValue(allLines, [/(?:自己PR|Self PR|Self-PR)[:：\s]+(.+)/]);

    return cv;
}

export async function importPDF(file) {
    const pages = await extractTextFromPDF(file);
    const text = pages.flat().join('\n');
    const kind = detectKind(text);
    const cv = kind === CV_TYPES.SHOKUMU
        ? parseShokumuFromText(pages)
        : parseRirekishoFromText(pages);
    return { cv, rawText: text };
}
