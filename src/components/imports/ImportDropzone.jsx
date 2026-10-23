import { useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function ImportDropzone({ kind, description }) {
  const ref = useRef(null);
  const { importFile, notify } = useApp();

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      notify(`"${file.name}" is not a JSON file.`);
      return;
    }
    importFile(file);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
    e.target.value = ''; // reset so same file can be re-imported (shows duplicate msg)
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  return (
    <div
      className="drop"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <h3>{kind}</h3>
      <p className="muted" style={{ margin: '4px 0 12px' }}>{description}</p>
      <p className="small muted" style={{ marginBottom: 12 }}>
        Drag &amp; drop a <code>.json</code> file here, or click to browse.
      </p>
      <input
        ref={ref}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleChange}
      />
      <button className="btn primary" type="button" onClick={() => ref.current.click()}>
        Choose JSON file
      </button>
    </div>
  );
}
