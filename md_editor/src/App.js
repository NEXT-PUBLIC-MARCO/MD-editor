import { useEffect, useState } from 'react';
import Editor from './screens/editor';
import CVEditor from './screens/cvEditor';

function App() {
    const [mode, setMode] = useState(() => localStorage.getItem('app-mode') || 'markdown');

    useEffect(() => {
        localStorage.setItem('app-mode', mode);
    }, [mode]);

    if (mode === 'cv') {
        return <CVEditor onSwitchToMarkdown={() => setMode('markdown')} />;
    }
    return <Editor onSwitchToCV={() => setMode('cv')} />;
}

export default App;
