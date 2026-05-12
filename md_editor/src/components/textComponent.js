function TextComponent({ text, onTextChange }) {
  return (
    <textarea
      className="atelier-editor"
      value={text}
      onChange={(e) => onTextChange(e.target.value)}
      spellCheck={false}
      placeholder="Start writing. Or don't. The page is patient."
    />
  );
}

export default TextComponent;
