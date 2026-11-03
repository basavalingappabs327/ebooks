const PAGE_SIZE = 15;
let books = [], filtered = [], page = 1;
const typeHue = {};   // each type gets its own colour (hue)
const $ = id => document.getElementById(id);

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// >>> PASTE YOUR APPS SCRIPT WEB APP URL HERE (the one ending in /exec) <<<
const API_URL = 'https://script.google.com/macros/s/AKfycbz4wo67QqwD0ufFSslnBtL5AnUXi5UPg_44dQdeORkl9L3xCAZfXe1TYyvk-q-2Ku_C/exec';

fetch(API_URL)
  .then(r => r.json())
  .then(data => {
    // normalise type (fixes "Medicine" vs "medicine", stray spaces, etc.)
    books = data.map(b => ({...b, type: cap(b.type.toLowerCase().replace(/\s+/g,' '))}));
    const types = [...new Set(books.map(b => b.type).filter(Boolean))].sort();
    types.forEach((t, i) => typeHue[t] = Math.round((i * 137.508) % 360));
  types.forEach(t => $('type').insertAdjacentHTML('beforeend', `<option value="${esc(t)}">${esc(t)}</option>`));
    applyFilters();
  })
  .catch(err => {
    $('body').innerHTML = `<tr><td colspan="3" class="empty">Could not load data: ${esc(err.message)}</td></tr>`;
  });

function applyFilters(){
  const t = $('type').value;
  const q = $('search').value.trim().toLowerCase();
  filtered = books.filter(b =>
    (!t || b.type === t) &&
    (!q || (b.name + ' ' + b.author).toLowerCase().includes(q)));
  page = 1;
  render();
}

function render(){
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  $('body').innerHTML = slice.length ? slice.map(b => `
    <tr>
      <td>${esc(b.author)}</td>
      <td>${b.download ? `<a href="${esc(b.download)}" target="_blank" rel="noopener">${esc(b.name)}</a>` : esc(b.name)}</td>
      <td><span class="tag" style="--h:${typeHue[b.type] ?? 210}">${esc(b.type)}</span></td>
    </tr>`).join('')
    : '<tr><td colspan="3" class="empty">No books found.</td></tr>';

  const from = filtered.length ? start + 1 : 0;
  $('count').textContent = `${from} - ${Math.min(start + PAGE_SIZE, filtered.length)} / ${filtered.length}`;

  const pager = `<button ${page<=1?'disabled':''} onclick="go(${page-1})">‹ Prev</button>
                 <span>${page} / ${pages}</span>
                 <button ${page>=pages?'disabled':''} onclick="go(${page+1})">Next ›</button>`;
  $('pagerTop').innerHTML = $('pagerBottom').innerHTML = pager;
}

function go(p){ page = p; render(); window.scrollTo({top:0,behavior:'smooth'}); }

$('type').addEventListener('change', applyFilters);
$('search').addEventListener('input', applyFilters);
