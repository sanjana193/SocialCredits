function downloadCSV(tableId, filename) {
  const rows = Array.from(document.querySelectorAll(`#${tableId} tr`));
  const csv = rows.map(r => Array.from(r.cells).map(c => `"${c.innerText}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function filterTables() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('table tbody tr').forEach(row => {
    row.style.display = [...row.cells].some(c => c.innerText.toLowerCase().includes(q)) ? '' : 'none';
  });
}
