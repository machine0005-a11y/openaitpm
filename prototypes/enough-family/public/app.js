import { calculate, cleanInstagramLink, durationCandidates, makePlan, formatMinutes } from './core.js';
const $ = id => document.getElementById(id);
let imageURL = null, sample = false, generation = 0, activeWorker = null, loadingOCR = null;
function status(text, error = false) { $('status').textContent = text; $('status').className = error ? 'error' : ''; }
function invalidate() { $('result').hidden = true; $('confirmed').checked = false; sample = false; }
$('form').addEventListener('input', e => {
  if (e.target.id === 'confirmed') { $('result').hidden = true; return; }
  invalidate();
});
$('who').addEventListener('change', () => { $('family').hidden = $('who').value !== 'family'; });
function clearImage() {
  ++generation;
  if (activeWorker) { activeWorker.terminate().catch(() => {}); activeWorker = null; }
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = null; $('file').value = ''; $('preview').removeAttribute('src');
  for (const id of ['preview','ocr','ocrnote','evidence']) $(id).hidden = true;
  $('ocr').disabled = false; $('raw').textContent = ''; $('candidates').replaceChildren();
}
$('demo').onclick = () => {
  clearImage(); $('form').reset(); $('link').value = ''; $('family').hidden = true;
  $('linknote').textContent = 'Sample only. No account was inspected.';
  $('usage').value = '90'; $('period').value = 'daily-average'; $('target').value = '30'; $('available').value = '120';
  $('confirmed').checked = true; sample = true; $('form').requestSubmit();
};
$('file').onchange = () => {
  const file = $('file').files[0]; clearImage(); invalidate(); if (!file) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    status('Choose a PNG, JPG or WebP screenshot under 8 MB.', true); return;
  }
  imageURL = URL.createObjectURL(file); $('preview').src = imageURL;
  for (const id of ['preview','ocr','ocrnote']) $(id).hidden = false;
  status('Review your screenshot. You can read text locally or enter numbers manually.');
};
$('preview').onerror = () => { clearImage(); status('Could not open that image. Try a PNG screenshot.', true); };
async function loadOCR() {
  if (window.Tesseract) return;
  if (!loadingOCR) loadingOCR = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
    script.onload = resolve;
    script.onerror = () => { script.remove(); loadingOCR = null; reject(new Error('OCR could not load. Enter numbers manually.')); };
    document.head.appendChild(script);
  });
  await loadingOCR;
}
$('ocr').onclick = async () => {
  if (!imageURL) return;
  const id = ++generation; let local = null;
  $('ocr').disabled = true; status('Loading the on-device reader. No image upload.');
  try {
    await $('preview').decode(); if (id !== generation) return;
    const img = $('preview');
    if (img.naturalWidth * img.naturalHeight > 20000000) throw new Error('Crop this image to the relevant area before reading it.');
    await loadOCR(); if (id !== generation) return;
    local = await window.Tesseract.createWorker('eng', 1, {
      cacheMethod: 'none',
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: m => { if (id === generation && m.status === 'recognizing text') status('Reading text: ' + Math.round(m.progress * 100) + '%'); }
    });
    if (id !== generation) return; activeWorker = local;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.round(img.naturalWidth * scale); canvas.height = Math.round(img.naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image reader unavailable. Enter numbers manually.');
    context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(img,0,0,canvas.width,canvas.height);
    const { data } = await local.recognize(canvas); if (id !== generation) return;
    $('raw').textContent = String(data.text || '').slice(0,12000); $('evidence').hidden = false; $('candidates').replaceChildren();
    for (const candidate of durationCandidates(data.text || '')) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary';
      button.textContent = candidate.context + ' → ' + candidate.minutes + ' min (verify)';
      button.onclick = () => {
        invalidate(); $('usage').value = String(candidate.minutes); $('period').value = '';
        status('Copied, not verified. Confirm the app, period and value.');
      };
      $('candidates').appendChild(button);
    }
    status('Text is a draft. Select a candidate or enter values yourself. Confirm the reporting period.');
  } catch (e) { if (id === generation) status(e.message || 'OCR failed. Enter values manually.', true); }
  finally { if (local) await local.terminate().catch(() => {}); if (activeWorker === local) activeWorker = null; if (id === generation) $('ocr').disabled = false; }
};
$('checklink').onclick = () => {
  invalidate();
  try { $('link').value = cleanInstagramLink($('link').value); $('linknote').textContent = 'Reference accepted. Tracking parameters removed. No page was fetched.'; status('Usage must be supplied separately.'); }
  catch (e) { status(e.message, true); }
};
$('link').addEventListener('input', () => { invalidate(); $('linknote').textContent = 'Link not checked. No Instagram page is fetched.'; });
$('form').onsubmit = e => {
  e.preventDefault();
  try {
    const input = Object.fromEntries(['who','what','when','where','why','usage','period','target','available'].map(k => [k,$(k).value]));
    input.confirmed = $('confirmed').checked; input.agreed = $('agreed').checked;
    const result = calculate(input);
    $('sample').hidden = !sample; $('metric').textContent = formatMinutes(result.weeklyPotential) + ' / week';
    $('math').textContent = 'Potential difference: max(0, ' + Number(result.baseline.toFixed(2)) + ' − ' + result.target + ') minutes/day × 7.';
    $('summary').textContent = 'Chosen target: ' + result.target + ' min/day · ' + result.targetReductionPercent.toFixed(1) + '% below baseline · ' + formatMinutes(result.remainingLeisureAtTarget) + ' of leisure time left at target.';
    $('cards').replaceChildren();
    makePlan(input,result).forEach(([title,body],i) => {
      const card = document.createElement('article'), heading = document.createElement('h2'), p = document.createElement('p');
      heading.textContent = i + 1 + '. ' + title; p.textContent = body; card.append(heading,p); $('cards').appendChild(card);
    });
    $('result').hidden = false; status(sample ? 'Sample plan ready. No personal data used.' : 'Plan uses only your confirmed values.');
    $('result').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  } catch (e) { $('result').hidden = true; status(e.message, true); }
};
$('share').onclick = async () => {
  const url = location.origin + '/';
  try {
    if (navigator.share) await navigator.share({ title: 'Enough Family — intentional scrolling', url });
    else { await navigator.clipboard.writeText(url); status('Prototype address copied. No image or plan included.'); }
  } catch (e) { if (e.name !== 'AbortError') status('Share this prototype address: ' + url); }
};
$('clear').onclick = () => {
  clearImage(); sample = false; $('form').reset(); $('link').value = ''; $('family').hidden = true; $('result').hidden = true;
  $('linknote').textContent = 'No Instagram page is fetched. A link does not authorize account access.';
  status('This session’s image, extracted text and plan were cleared.');
};
