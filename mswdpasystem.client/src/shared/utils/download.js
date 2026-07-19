/**
 * Triggers a browser download for binary data already fetched through `api`
 * (which attaches the bearer token). Uploaded documents and signatures are not
 * publicly reachable, so they must be fetched via axios rather than linked to
 * directly with an <a href> or <img src>.
 */
export function downloadBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
