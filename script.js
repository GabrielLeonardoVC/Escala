// Variáveis Globais
let dataReferencia = new Date();
let db = JSON.parse(localStorage.getItem('m_divina_v10')) || {};
let temp = []; 
let selDate = ""; 
let photo = ""; 
let editId = null;

// Alternar Tema (Dark/Light)
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const icon = document.getElementById('t-icon');
    icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    lucide.createIcons();
}

// Abrir links externos com validação
function openLink(url) {
    if (!url) return;
    if (url.startsWith('http')) {
        window.open(url, '_blank');
    } else {
        document.getElementById('error-desc').innerHTML = `O link <b>"${url}"</b> não é válido.<br>Use <b>https://</b> no início.`;
        document.getElementById('error-overlay').style.display = 'flex';
    }
}

function closeError() { 
    document.getElementById('error-overlay').style.display = 'none'; 
}

// Controle de Navegação entre Páginas
function showPage(p) {
    document.querySelectorAll('.page, nav button').forEach(el => el.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    document.getElementById('n-' + p).classList.add('active');
    
    if(p === 'admin') renderCal();
    if(p === 'view') renderList();
}

// Lógica do Calendário Dinâmico
function mudarMes(direcao) {
    dataReferencia.setMonth(dataReferencia.getMonth() + direcao);
    renderCal();
}

function renderCal() {
    const grid = document.getElementById('calAdmin');
    const label = document.getElementById('mes-label');
    grid.innerHTML = '';
    
    const ano = dataReferencia.getFullYear();
    const mes = dataReferencia.getMonth();

    const mesesNome = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    label.innerText = `${mesesNome[mes]} ${ano}`;

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    // Espaços vazios
    for(let x = 0; x < primeiroDiaSemana; x++) {
        grid.innerHTML += `<div class="dia vazio"></div>`;
    }

    // Dias do mês
    for(let i = 1; i <= diasNoMes; i++) {
        const d = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const has = db[d] && db[d].length > 0;
        const hoje = new Date();
        const eHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === i;
        
        grid.innerHTML += `
            <div class="dia ${has ? 'tem' : ''} ${selDate === d ? 'sel' : ''}" 
                 style="${eHoje && selDate !== d ? 'border: 2px solid var(--accent)' : ''}"
                 onclick="selectDate('${d}')">${i}</div>`;
    }
    lucide.createIcons();
}

function selectDate(d) {
    selDate = d;
    renderCal();
    document.getElementById('painel').style.display = 'block';
    document.getElementById('edit-badge').style.display = 'none';
    temp = []; 
    editId = null;
    document.getElementById('in-titulo').value = "";
    renderPreview();
}

// Upload de Foto
function previewFile(input) {
    const reader = new FileReader();
    reader.onload = e => {
        photo = e.target.result;
        document.getElementById('img-preview').src = photo;
        document.getElementById('img-preview').style.display = 'block';
        document.getElementById('icon-cam').style.display = 'none';
    };
    reader.readAsDataURL(input.files[0]);
}

// Adicionar música na lista temporária
function addMusica() {
    const n = document.getElementById('in-musica').value;
    if(!n) return;

    let yt = document.getElementById('in-yt').value;
    let cf = document.getElementById('in-cf').value;

    if(!yt) yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(n)}`;
    if(!cf) cf = `https://www.cifraclub.com.br/?q=${encodeURIComponent(n)}`;

    temp.push({ 
        nome: n, 
        tom: document.getElementById('in-tom').value,
        yt: yt, 
        cf: cf, 
        foto: photo 
    });

    // Limpar campos
    document.getElementById('in-musica').value = "";
    document.getElementById('in-tom').value = "";
    document.getElementById('in-yt').value = "";
    document.getElementById('in-cf').value = "";
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('icon-cam').style.display = 'block';
    photo = ""; 
    renderPreview();
}

function renderPreview() {
    const div = document.getElementById('lista-preview');
    div.innerHTML = temp.map((m, i) => `
        <div class="item-musica">
            <span><b>${i+1}.</b> ${m.nome} ${m.tom ? `<span class="tom-badge">${m.tom}</span>` : ''}</span>
            <button onclick="temp.splice(${i},1); renderPreview()" style="color:var(--error)"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
    document.getElementById('btn-save').style.display = temp.length > 0 ? 'block' : 'none';
    lucide.createIcons();
}

// Salvar escala no LocalStorage
function save() {
    if(!db[selDate]) db[selDate] = [];
    const esc = { 
        id: editId || Date.now(), 
        titulo: document.getElementById('in-titulo').value || "Missa", 
        musicas: [...temp] 
    };
    
    if(editId) {
        const idx = db[selDate].findIndex(e => e.id === editId);
        db[selDate][idx] = esc;
    } else {
        db[selDate].push(esc);
    }
    
    localStorage.setItem('m_divina_v10', JSON.stringify(db));
    showPage('view');
}

// Renderizar lista de escalas salvas
function renderList(f = "") {
    const container = document.getElementById('render-list');
    const dates = Object.keys(db).sort().reverse();
    let html = "";
    
    dates.forEach(d => {
        db[d].forEach((esc, eIdx) => {
            const match = esc.titulo.toLowerCase().includes(f.toLowerCase()) || 
                          esc.musicas.some(m => m.nome.toLowerCase().includes(f.toLowerCase()));
            if(!match) return;
            
            html += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px">
                        <div>
                            <h3 style="font-size:16px; font-weight:800">${esc.titulo}</h3>
                            <small style="color:var(--primary)">${d.split('-').reverse().join('/')}</small>
                        </div>
                        <div style="display:flex; gap:10px">
                            <button onclick="edit('${d}', ${eIdx})" style="color:var(--text-light)"><i data-lucide="edit-3" style="width:18px"></i></button>
                            <button onclick="del('${d}', ${eIdx})" style="color:var(--error)"><i data-lucide="trash" style="width:18px"></i></button>
                        </div>
                    </div>
                    ${esc.musicas.map(m => `
                        <div class="item-musica">
                            <span style="font-size:14px; font-weight:500">${m.nome} ${m.tom ? `<span class="tom-badge">${m.tom}</span>` : ''}</span>
                            <div class="actions">
                                <button onclick="openLink('${m.yt}')" style="color:#ff0000"><i data-lucide="youtube"></i></button>
                                ${m.foto ? `<button onclick="openPhoto('${m.foto}')"><i data-lucide="camera"></i></button>` : ''}
                                <button onclick="openLink('${m.cf}')" style="color:#10b981"><i data-lucide="file-text"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        });
    });
    container.innerHTML = html || "<p style='text-align:center; opacity:0.5'>Nenhuma escala encontrada.</p>";
    lucide.createIcons();
}

function openPhoto(s) { 
    document.getElementById('modal-img').src = s; 
    document.getElementById('photo-modal').style.display = 'flex'; 
}

function del(d, i) { 
    if(confirm("Excluir?")) { 
        db[d].splice(i, 1); 
        localStorage.setItem('m_divina_v10', JSON.stringify(db)); 
        renderList(); 
    } 
}

function edit(d, i) {
    const esc = db[d][i]; 
    showPage('admin'); 
    selectDate(d);
    document.getElementById('edit-badge').style.display = 'block';
    document.getElementById('in-titulo').value = esc.titulo;
    temp = [...esc.musicas]; 
    editId = esc.id; 
    renderPreview();
}

// Inicializar ícones e Calendário ao carregar
window.onload = () => {
    lucide.createIcons();
    renderCal();
};