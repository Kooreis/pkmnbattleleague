async function loadFormats() {
  const res = await fetch('/formats');
  const data = await res.json();
  const list = document.getElementById('formatList');
  data.standard.slice(0, 10).forEach(f => {
    const li = document.createElement('li');
    li.textContent = f.name;
    list.appendChild(li);
  });
}
window.onload = loadFormats;
