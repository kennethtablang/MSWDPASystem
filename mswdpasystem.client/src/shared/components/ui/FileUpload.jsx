import { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Drag-and-drop file picker. Calls `onFiles(File[])` whenever the selection
 * changes. Selection state lives here; parent receives the current list.
 */
export default function FileUpload({
  accept,
  multiple = false,
  maxSizeMb = 10,
  hint,
  onFiles,
  className = '',
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const applyFiles = (incoming) => {
    const list = Array.from(incoming);
    const tooBig = list.find((f) => f.size > maxSizeMb * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${maxSizeMb} MB. Choose a smaller file.`);
      return;
    }
    setError('');
    const next = multiple ? [...files, ...list] : list.slice(0, 1);
    setFiles(next);
    onFiles?.(next);
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFiles?.(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          applyFiles(e.dataTransfer.files);
        }}
        className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
        }`}
      >
        <UploadCloud size={28} className="text-primary-600" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700">
          Drag files here or <span className="text-primary-700">browse</span>
        </span>
        <span className="text-xs text-gray-400">{hint ?? `Up to ${maxSizeMb} MB${accept ? ` · ${accept}` : ''}`}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => applyFiles(e.target.files)}
        aria-label="Choose files"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-accent-700">
          {error}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-100 px-3 py-2"
            >
              <FileIcon size={16} className="text-primary-600 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                className="p-1 rounded text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
