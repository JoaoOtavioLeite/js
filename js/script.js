/* Galeria com LocalStorage
   - Salva imagens como dataURL (redimensionadas para economizar espaço)
   - Estrutura armazenada: [{id, name, dataUrl}] em localStorage key 'imageGallery'
*/
const STORAGE_KEY = 'imageGallery';
const MAX_IMAGES = 30; // limite razoável - ajuste conforme necessário
const MAX_DIMENSION = 1200; // max largura/altura ao salvar para reduzir tamanho

const fileInput = document.getElementById('fileInput');
const addBtn = document.getElementById('addBtn');
const gallery = document.getElementById('gallery');
const info = document.getElementById('info');
const maxCountSpan = document.getElementById('maxCount');

maxCountSpan.textContent = MAX_IMAGES;

// util: ler estado do storage
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro lendo storage', e);
    return [];
  }
}

// util: gravar estado no storage
function writeStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    console.error('Erro salvando no storage (talvez limite atingido):', e);
    return false;
  }
}

// util: gerar id único simples
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

// redimensiona a imagem usando canvas e retorna dataURL (jpeg)
function resizeImage(file, maxDimension = MAX_DIMENSION) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro lendo arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) {
          // não precisa redimensionar
          resolve(reader.result);
          return;
        }
        const ratio = width / height;
        if (width > height) {
          width = maxDimension;
          height = Math.round(maxDimension / ratio);
        } else {
          height = maxDimension;
          width = Math.round(maxDimension * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // qualidade 0.8 para jpeg — reduz tamanho sem perder muito
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erro carregando imagem para redimensionar'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// adiciona imagem selecionada (arquivo)
async function addSelectedImage() {
  const files = fileInput.files;
  if (!files || files.length === 0) return alert('Escolha uma imagem primeiro.');
  const current = readStorage();
  if (current.length >= MAX_IMAGES) return alert(`Limite de ${MAX_IMAGES} imagens atingido.`);
  const file = files[0];
  if (!file.type.startsWith('image/')) return alert('O arquivo selecionado não é uma imagem.');
  addBtn.disabled = true;
  addBtn.textContent = 'Adicionando...';
  try {
    const dataUrl = await resizeImage(file);
    const item = { id: makeId(), name: file.name, dataUrl };
    const newList = [item, ...current];
    const ok = writeStorage(newList);
    if (!ok) {
      alert('Não foi possível salvar no localStorage (limite atingido). Tente remover imagens ou reduzir tamanho.');
      return;
    }
    renderGallery();
    fileInput.value = ''; // limpa input
  } catch (e) {
    console.error(e);
    alert('Erro ao processar a imagem. Veja o console para mais detalhes.');
  } finally {
    addBtn.disabled = false;
    addBtn.textContent = 'Adicionar imagem';
  }
}

// remove imagem por id
function removeImageById(id) {
  const list = readStorage();
  const filtered = list.filter(i => i.id !== id);
  if (filtered.length === list.length) return; // nada removido
  const ok = writeStorage(filtered);
  if (!ok) alert('Erro salvando alteração no localStorage.');
  renderGallery();
}

// cria card DOM para imagem
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = item.id;
  const img = document.createElement('img');
  img.src = item.dataUrl;
  img.alt = item.name || 'Imagem da galeria';
  img.title = 'Clique para remover';
  img.addEventListener('click', () => {
    if (confirm('Remover esta imagem?')) removeImageById(item.id);
  });
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = item.name || '';
  const btn = document.createElement('button');
  btn.className = 'remove';
  btn.textContent = 'Remover';
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm('Remover esta imagem?')) removeImageById(item.id); });
  card.appendChild(img);
  card.appendChild(btn);
  card.appendChild(meta);
  return card;
}

// renderiza galeria a partir do storage
function renderGallery() {
  const list = readStorage();
  gallery.innerHTML = '';
  if (list.length === 0) {
    gallery.innerHTML = '<p>Nenhuma imagem. Adicione uma usando o formulário acima.</p>';
  } else {
    const fragment = document.createDocumentFragment();
    list.forEach(item => fragment.appendChild(createCard(item)));
    gallery.appendChild(fragment);
  }
  info.textContent = `${list.length} imagem${list.length === 1 ? '' : 's'}`;
  addBtn.disabled = list.length >= MAX_IMAGES;
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  addBtn.addEventListener('click', addSelectedImage);
  // permitir adicionar apertando Enter no input (quando arquivo selecionado)
  fileInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSelectedImage(); });
});
