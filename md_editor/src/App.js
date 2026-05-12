import Editor from './screens/editor';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Editor />
    </ThemeProvider>
  );
}

export default App;
