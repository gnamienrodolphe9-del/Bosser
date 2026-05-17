const BACKEND_URL = "https://bosser.onrender.com";

    /* ═══════════════════════════════════════
       PWA
    ═══════════════════════════════════════ */
    const manifestData = { name: "StudyOS — Révise plus fort", short_name: "StudyOS", description: "Fiches, Quiz, Exercices et Planning pour étudiants", start_url: "./", display: "standalone", background_color: "#01123d", theme_color: "#01123d", orientation: "portrait-primary", icons: [{ src: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='36' fill='%2301123d'/><text x='50%' y='57%' dominant-baseline='middle' text-anchor='middle' font-size='110'>📚</text></svg>`), sizes: "192x192", type: "image/svg+xml" }] };
    const mBlob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
    document.getElementById('pwaManifest').href = URL.createObjectURL(mBlob);
    const swCode = `const CACHE='studyos-v4';self.addEventListener('install',e=>{self.skipWaiting();});self.addEventListener('activate',e=>{self.clients.claim();});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`;
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode], { type: 'application/javascript' })), { scope: './' }).catch(() => { }); }
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtnDesktop').classList.add('visible'); document.getElementById('installBanner').classList.add('show'); });
    window.addEventListener('appinstalled', () => { document.getElementById('installBanner').classList.remove('show'); document.getElementById('installBtnDesktop').classList.remove('visible'); });
    async function installApp() { if (!deferredPrompt) { alert('Pour installer StudyOS :\n\niPhone → Partager → "Sur l\'écran d\'accueil"\nAndroid → Menu → "Ajouter à l\'écran d\'accueil"'); return; } deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; document.getElementById('installBanner').classList.remove('show'); }

    /* ═══════════════════════════════════════
       THEME
    ═══════════════════════════════════════ */
    let isDark = true;
    const moonSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    const sunSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

    function toggleTheme() {
      isDark = !isDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.getElementById('themeBtnIcon').innerHTML = isDark ? moonSVG : sunSVG;
      document.getElementById('themeBtnMobile').innerHTML = isDark ? moonSVG : sunSVG;
      document.getElementById('themeBtn').querySelector('.tip').textContent = isDark ? 'Mode clair' : 'Mode sombre';
      document.getElementById('themeColor').content = isDark ? '#01123d' : '#dffafa';
      localStorage.setItem('studyos-theme', isDark ? 'dark' : 'light');
    }
    (function () { if (localStorage.getItem('studyos-theme') === 'light') toggleTheme(); })();

    /* ═══════════════════════════════════════
       NAVIGATION
    ═══════════════════════════════════════ */
    const navHistory = [];

function goto(page, btn) {
  // Sauvegarder la page actuelle avant de naviguer
  const currentPanel = document.querySelector('.panel.active');
  if (currentPanel) {
    const currentId = currentPanel.id.replace('page-', '');
    if (currentId !== page) {
      navHistory.push(currentId);
    }
  }

  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn,.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('[data-page="' + page + '"]').forEach(b => b.classList.add('active'));
  document.getElementById('pageTitle').innerHTML = titles[page] || page;
  window.scrollTo(0, 0);

  // Gérer la visibilité du bouton retour
  const backBtn = document.getElementById('backBtn');
  if (page === 'home') {
    backBtn.classList.remove('visible');
    navHistory.length = 0;
  } else {
    backBtn.classList.add('visible');
  }
}

function goBack() {
  if (navHistory.length > 0) {
    const previousPage = navHistory.pop();
    goto(previousPage, null);
  } else {
    goto('home', null);
  }
}

    /* ═══════════════════════════════════════
       STATS DYNAMIQUES
    ═══════════════════════════════════════ */
    const userId = localStorage.getItem('studyos-uid') || ('u_' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('studyos-uid', userId);

    async function loadStats() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/stats/${userId}`);
        const data = await res.json();
        document.getElementById('statFiches').textContent = data.fiches || 0;
        document.getElementById('statQuestions').textContent = data.questions || 0;
        document.getElementById('statScore').textContent = data.score_moyen > 0 ? data.score_moyen + '%' : '—';
      } catch (e) { console.log('Stats non disponibles'); }
    }

    async function updateStat(action, value = null) {
      try {
        await fetch(`${BACKEND_URL}/api/stats/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action, value })
        });
        loadStats();
      } catch (e) { }
    }

    loadStats();

    /* ═══════════════════════════════════════
       API CLAUDE
    ═══════════════════════════════════════ */
    async function callClaude(prompt, system = '') {
      const res = await fetch(`${BACKEND_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }], system }) });
      const data = await res.json();
      return data.content?.[0]?.text || "Erreur de l'API.";
    }

    /* ═══════════════════════════════════════
       PDF - EXTRACTION & IMPORT DE TEXTE
    ═══════════════════════════════════════ */

    // Configure PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Extrait le texte d'un fichier PDF
    async function extractTextFromPDF(file) {
      // Convertit le fichier en ArrayBuffer
      // (format binaire que PDF.js peut lire)
      const arrayBuffer = await file.arrayBuffer();

      // Charge le PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Parcourt chaque page du PDF
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Assemble le texte de la page
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');

        fullText += pageText + '\n';
      }

      return fullText;
    }

    /* ═══════════════════════════════════════
       PDF IMPORT — Gestion des onglets
    ═══════════════════════════════════════ */
    const pdfTabState = { fiche: 'text', quiz: 'text', exo: 'text' };
    const pdfSelectedFiles = { fiche: null, quiz: null, exo: null };
    const pdfSelectedTexts = { fiche: '', quiz: '', exo: '' };

    function setPdfTab(tab, section, btn) {
        // Mettre à jour l'état
        pdfTabState[section] = tab;

        console.log('tab:', tab);
        console.log('section:', section);
        console.log('subTabs element:', document.getElementById(`${section}-sub-tabs`));

      // Mettre à jour l'onglet actif
      btn.closest('.pdf-tabs')
        .querySelectorAll('.pdf-tab')
        .forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      // Cacher toutes les zones
      document.getElementById(`${section}-text-zone`).classList.remove('visible');
      document.getElementById(`${section}-upload-zone`).classList.remove('visible');
      document.getElementById(`${section}-existing-zone`).classList.remove('visible');

      // Gérer les sous-boutons
      const subTabs = document.getElementById(`${section}-sub-tabs`);

      if (tab === 'text') {
        // Cacher les sous-boutons
        subTabs.classList.remove('visible');
        // Afficher la zone texte
        document.getElementById(`${section}-text-zone`).classList.add('visible');

      } else if (tab === 'pdf') {
        // Afficher les sous-boutons
        subTabs.classList.add('visible');
        // Par défaut activer "Nouveau PDF"
        document.getElementById(`${section}-upload-zone`).classList.add('visible');
        // Activer le premier sous-bouton
        subTabs.querySelectorAll('.pdf-sub-btn')[0].classList.add('active');
        subTabs.querySelectorAll('.pdf-sub-btn')[1].classList.remove('active');
      }
    }

    function setPdfSubTab(subTab, section, btn) {
      // Mettre à jour le sous-bouton actif
      btn.closest('.pdf-sub-tabs')
        .querySelectorAll('.pdf-sub-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Cacher les deux zones PDF
      document.getElementById(`${section}-upload-zone`).classList.remove('visible');
      document.getElementById(`${section}-existing-zone`).classList.remove('visible');

      // Afficher la bonne zone
      if (subTab === 'upload') {
        document.getElementById(`${section}-upload-zone`).classList.add('visible');
      } else if (subTab === 'existing') {
        document.getElementById(`${section}-existing-zone`).classList.add('visible');
        // Charger la liste des PDFs existants
        loadPdfList(section);
      }
    }

    async function handlePdfUpload(section, input) {
      const file = input.files[0];
      if (!file) return;

      // Affiche un message de chargement
      const infoEl = document.getElementById(`${section}-selected-info`);
      const nameEl = document.getElementById(`${section}-selected-name`);
      nameEl.textContent = 'Extraction du texte en cours…';
      infoEl.classList.add('show');

      try {
        // Étape 1 — Extraire le texte du PDF
        const text = await extractTextFromPDF(file);

        // Étape 2 — Mettre le texte dans la variable de contenu
        pdfSelectedTexts[section] = text;

        // Étape 3 — Afficher la confirmation
        nameEl.textContent = `${file.name} (${text.length} caractères extraits)`;

        // Étape 4 — Upload le fichier sur Drive pour usage futur
        const formData = new FormData();
        formData.append('pdf', file);
        const res = await fetch(`${BACKEND_URL}/api/files/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          pdfSelectedFiles[section] = data.file;
        }

      } catch (e) {
        nameEl.textContent = 'Erreur extraction. Réessaie.';
        console.error(e);
      }
    }

    async function loadPdfList(section) {
      const listEl = document.getElementById(`${section}-pdf-list`);
      listEl.innerHTML = '<p style="font-size:13px;color:var(--muted);text-align:center;padding:16px">Chargement…</p>';
      try {
        const res = await fetch(`${BACKEND_URL}/api/files/list`);
        const data = await res.json();
        if (!data.files || data.files.length === 0) {
          listEl.innerHTML = '<p style="font-size:13px;color:var(--muted);text-align:center;padding:16px">Aucun PDF disponible. Uploadez-en un d\'abord.</p>';
          return;
        }
        listEl.innerHTML = data.files.map(f => `
      <div class="pdf-item" onclick="selectExistingPdf('${section}','${f.id}','${f.name}',this)">
        <span class="pdf-item-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
        <span class="pdf-item-name">${f.name}</span>
        <span class="pdf-item-size">${f.size ? Math.round(f.size / 1024) + 'KB' : ''}</span>
      </div>
    `).join('');
      } catch (e) {
        listEl.innerHTML = '<p style="font-size:13px;color:var(--danger);text-align:center;padding:16px">Erreur chargement.</p>';
      }
    }

    async function selectExistingPdf(section, fileId, fileName, el) {
      // Désélectionner les autres
      document.querySelectorAll(`#${section}-pdf-list .pdf-item`)
        .forEach(i => i.classList.remove('selected'));
      el.classList.add('selected');

      // Afficher chargement
      el.querySelector('.pdf-item-name').textContent = 'Chargement…';

      try {
        // Télécharger le PDF depuis le backend
        const res = await fetch(
          `${BACKEND_URL}/api/files/download/${fileId}`
        );

        // Convertir la réponse en Blob (format fichier)
        const blob = await res.blob();

        // Créer un objet File à partir du Blob
        // pour pouvoir l'utiliser avec extractTextFromPDF
        const file = new File([blob], fileName, {
          type: 'application/pdf'
        });

        // Extraire le texte
        const text = await extractTextFromPDF(file);
        pdfSelectedTexts[section] = text;

        // Restaurer le nom
        el.querySelector('.pdf-item-name').textContent = fileName;

      } catch (e) {
        el.querySelector('.pdf-item-name').textContent = 'Erreur. Réessaie.';
        console.error(e);
      }
    }

    function getCourseContent(section) {
  const tab = pdfTabState[section];
  
  if (tab === 'text') {
    const inputId = section === 'fiche' ? 'ficheInput' 
                  : section === 'quiz' ? 'quizInput' 
                  : 'exoCours';
    return document.getElementById(inputId).value.trim();
  }
  
  // tab === 'pdf' — retourner le texte extrait
  if (pdfSelectedTexts[section]) {
    return pdfSelectedTexts[section];
  }
  
  // Aucun texte extrait
  return '';
}

    /* ═══════════════════════════════════════
       EXPORT PDF
    ═══════════════════════════════════════ */
    function exportPDF(containerId, filename) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const el = document.getElementById(containerId);
      const content = el.innerText || el.textContent;
      const lines = doc.splitTextToSize(content, 180);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      let y = 20;
      lines.forEach(line => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 7;
      });
      doc.save(`${filename}_StudyOS.pdf`);
    }

    /* ═══════════════════════════════════════
       FICHE
    ═══════════════════════════════════════ */
    function clearFiche() {
      document.getElementById('ficheInput').value = '';
      const r = document.getElementById('ficheResult');
      r.classList.remove('show');
      document.getElementById('ficheResultContent').innerHTML = '';
    }

    async function genFiche() {
      const cours = getCourseContent('fiche');
      if (!cours) return alert('Ajoute ton cours d\'abord !');
      const loader = document.getElementById('ficheLoader');
      const result = document.getElementById('ficheResult');
      loader.classList.add('show'); result.classList.remove('show');
      const prompt = `Tu es un assistant pédagogique expert. Génère une fiche de révision synthétique en français.\nInclus : titre, définitions clés en gras, points essentiels en liste, résumé en 4-5 phrases.\nCours : """${cours}"""\nRéponds directement en HTML simple (h3, ul, li, strong, p).`;
      const html = await callClaude(prompt);
      loader.classList.remove('show');
      document.getElementById('ficheResultContent').innerHTML = html;
      result.classList.add('show');
      updateStat('fiche');
    }

    /* ═══════════════════════════════════════
       QUIZ
    ═══════════════════════════════════════ */
    let quizData = [], currentQ = 0, score = 0, selectedQType = 'qcm';
    let quizResumeSaved = '', quizNbSaved = 5;

    function setQType(type, el) { selectedQType = type; document.querySelectorAll('[data-qtype]').forEach(p => p.classList.remove('active')); el.classList.add('active'); }

    async function genQuiz() {
      const cours = getCourseContent('quiz');
      if (!cours) return alert('Ajoute ton cours d\'abord !');
      quizNbSaved = document.getElementById('quizNb').value;
      const loader = document.getElementById('quizLoader');
      const loaderText = document.getElementById('quizLoaderText');
      const area = document.getElementById('quizArea');
      const resumeBox = document.getElementById('quizResume');
      loader.classList.add('show');
      loaderText.textContent = 'Résumé du cours en cours…';
      area.innerHTML = '';
      resumeBox.classList.remove('show');
      const resumePrompt = `Tu es un assistant pédagogique. Fais un résumé clair et structuré en français du cours suivant.\nCours : """${cours}"""\nRéponds en HTML simple (p, strong, ul, li). Pas de titre h1.`;
      const resume = await callClaude(resumePrompt);
      quizResumeSaved = cours;
      loader.classList.remove('show');
      document.getElementById('quizResumeContent').innerHTML = resume;
      resumeBox.classList.add('show');
    }

    async function startQuizFromResume() {
      const loader = document.getElementById('quizLoader');
      const loaderText = document.getElementById('quizLoaderText');
      const area = document.getElementById('quizArea');
      const resumeBox = document.getElementById('quizResume');
      loader.classList.add('show');
      loaderText.textContent = 'Génération des questions…';
      resumeBox.classList.remove('show');
      area.innerHTML = '';
      const typeLabel = selectedQType === 'qcm' ? 'QCM à 4 choix (une seule bonne réponse)' : 'Questions Vrai/Faux';
      const prompt = `Génère exactement ${quizNbSaved} questions de type ${typeLabel} en français.\nCours : """${quizResumeSaved}"""\nRéponds UNIQUEMENT en JSON valide sans markdown.\nFormat : [{"q":"question","options":["A","B","C","D"],"answer":0,"explication":"..."}]`;
      const raw = await callClaude(prompt);
      loader.classList.remove('show');
      try {
        // quizData = JSON.parse(raw.replace(/```json|```/g, '').trim());
        const jsonStart = raw.indexOf('[');
        const jsonEnd = raw.lastIndexOf(']') + 1;
        const jsonString = raw.substring(jsonStart, jsonEnd);
        quizData = JSON.parse(jsonString);
        currentQ = 0; score = 0; renderQuestion();
      } catch { area.innerHTML = `<p style="color:var(--danger);padding:12px">Erreur. Réessaie.</p>`; }
    }

    function renderQuestion() {
      const area = document.getElementById('quizArea');
      if (currentQ >= quizData.length) {
        const pct = Math.round((score / quizData.length) * 100);
        updateStat('score', pct);
        area.innerHTML = `<div class="score-display show">
      <div class="score-big">${pct}%</div>
      <div class="score-label">${score} / ${quizData.length} bonnes réponses</div>
      <p style="font-size:13px;color:var(--muted);margin-top:8px">${pct >= 70 ? 'Excellent ! Continue comme ça.' : pct >= 50 ? 'Bien, tu peux encore progresser.' : 'Revois ce cours et réessaie.'}</p>
      <button class="export-btn" style="margin-top:12px" onclick="exportQuizResults(${pct},${score},${quizData.length})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Télécharger les résultats
      </button>
      <button class="btn btn-ghost" style="margin-top:8px" onclick="document.getElementById('quizArea').innerHTML='';quizData=[]">Nouveau quiz</button>
    </div>`;
        return;
      }
      const q = quizData[currentQ];
      const pct = Math.round((currentQ / quizData.length) * 100);
      area.innerHTML = `<div class="quiz-card show">
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--muted)">Q ${currentQ + 1} / ${quizData.length}</span>
        <span style="font-size:12px;color:var(--accent)">Score : ${score}</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="question-text">${q.q}</div>
    <div class="options-list">${q.options.map((o, i) => `<button class="option-btn" onclick="checkAnswer(${i})">${o}</button>`).join('')}</div>
    <div class="feedback-msg" id="feedbackMsg"></div>
    <button class="btn btn-ghost btn-sm" id="nextBtn" style="display:none;align-self:flex-end" onclick="nextQ()">Suivant →</button>
  </div>`;
    }

    function checkAnswer(idx) {
      const q = quizData[currentQ];
      document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      document.querySelectorAll('.option-btn')[q.answer].classList.add('correct');
      const fb = document.getElementById('feedbackMsg');
      if (idx === q.answer) { score++; fb.textContent = '✓ ' + (q.explication || 'Bonne réponse !'); fb.className = 'feedback-msg show ok'; }
      else { document.querySelectorAll('.option-btn')[idx].classList.add('wrong'); fb.textContent = '✗ ' + (q.explication || 'Mauvaise réponse.'); fb.className = 'feedback-msg show ko'; }
      document.getElementById('nextBtn').style.display = 'flex';
      updateStat('question');
    }

    function nextQ() { currentQ++; renderQuestion(); }

    function exportQuizResults(pct, score, total) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Résultats du Quiz — StudyOS', 15, 20);
      doc.setFontSize(12);
      doc.text(`Score : ${score} / ${total} (${pct}%)`, 15, 35);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, 45);
      let y = 60;
      quizData.forEach((q, i) => {
        doc.setFontSize(11);
        const qLines = doc.splitTextToSize(`Q${i + 1}. ${q.q}`, 180);
        qLines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 6; });
        const corrLines = doc.splitTextToSize(`Réponse : ${q.options[q.answer]}`, 180);
        doc.setTextColor(5, 150, 105);
        corrLines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 6; });
        doc.setTextColor(0, 0, 0);
        y += 4;
      });
      doc.save('Quiz_Resultats_StudyOS.pdf');
    }

    /* ═══════════════════════════════════════
       EXERCICES
    ═══════════════════════════════════════ */
    let selectedEType = 'exercice';
    let exoCoursCache = '', exoMatiereCache = '', exoNiveauCache = '', exoNbCache = 3;
    let exoResultData = [];

    function setEType(type, el) { selectedEType = type; document.querySelectorAll('[data-etype]').forEach(p => p.classList.remove('active')); el.classList.add('active'); }

    function resetExo() {
      document.getElementById('exoMatiere').value = '';
      document.getElementById('exoCours').value = '';
      const r = document.getElementById('exoResult'); r.style.display = 'none'; r.innerHTML = '';
      document.getElementById('exoResume').classList.remove('show');
    }

    const exoConfig = {
      exercice: { label: 'exercices guidés avec sous-questions numérotées', badge: 'Exercice guidé', badgeClass: 'badge-exercice', consigne: 'Sous-questions numérotées (1. 2. 3.) guidant pas à pas. Correction détaillée.' },
      devoir: { label: 'exercices type devoir surveillé', badge: 'Devoir type', badgeClass: 'badge-devoir', consigne: 'Style devoir maison avec barème indicatif. Correction complète.' },
      examen: { label: 'exercices type examen blanc officiel', badge: 'Examen blanc', badgeClass: 'badge-examen', consigne: 'Style examen officiel. Parties distinctes, durée indicative, barème sur 20. Correction type.' }
    };

    async function genExercices() {
      const matiere = document.getElementById('exoMatiere').value.trim();
      const cours = getCourseContent('exo');
      if (!matiere) return alert('Indique la matière et le sujet !');
      if (!cours) return alert('Ajoute ton cours — il est nécessaire !');
      exoMatiereCache = matiere;
      exoNiveauCache = { college: 'Collège (6ème...BEPC)', lycee: 'Lycée (2nde...Baccalauréat)', superieur: 'Supérieur (BTS / Licence)', concours: 'Concours' }[document.getElementById('exoNiveau').value];
      exoNbCache = document.getElementById('exoNb').value;
      exoCoursCache = cours;
      const loader = document.getElementById('exoLoader');
      const loaderText = document.getElementById('exoLoaderText');
      const result = document.getElementById('exoResult');
      const resumeBox = document.getElementById('exoResume');
      loader.classList.add('show');
      loaderText.textContent = 'Résumé du cours en cours…';
      result.style.display = 'none'; result.innerHTML = '';
      resumeBox.classList.remove('show');
      const resumePrompt = `Tu es professeur expert en ${matiere}. Fais un résumé pédagogique clair en français, en mettant en avant les notions clés et formules importantes.\nCours : """${cours}"""\nRéponds en HTML simple (p, strong, ul, li). Pas de titre h1.`;
      const resume = await callClaude(resumePrompt);
      loader.classList.remove('show');
      document.getElementById('exoResumeContent').innerHTML = resume;
      resumeBox.classList.add('show');
    }

    async function startExoFromResume() {
      const loader = document.getElementById('exoLoader');
      const loaderText = document.getElementById('exoLoaderText');
      const result = document.getElementById('exoResult');
      const resumeBox = document.getElementById('exoResume');
      const cfg = exoConfig[selectedEType];
      loader.classList.add('show');
      loaderText.textContent = 'Création de tes exercices…';
      resumeBox.classList.remove('show');
      result.style.display = 'none'; result.innerHTML = '';
      const prompt = `Tu es professeur expert en ${exoMatiereCache} niveau ${exoNiveauCache}. Génère exactement ${exoNbCache} ${cfg.label} en français.\nCours : """${exoCoursCache}"""\n${cfg.consigne}\nRéponds UNIQUEMENT en JSON valide sans markdown :\n[{"titre":"Exercice 1 — Titre","duree":"20 min","bareme":"/ 5 pts","enonce":"Énoncé complet","correction":"Correction détaillée"}]`;
      const raw = await callClaude(prompt);
      loader.classList.remove('show');
      try {
        exoResultData = JSON.parse(raw.replace(/```json|```/g, '').trim());
        result.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
        <button class="export-btn" onclick="exportExercices()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Télécharger tous les exercices
        </button>
      </div>
      ${exoResultData.map((exo, i) => `
      <div class="exo-block">
        <div class="exo-header">
          <div class="exo-num">${exo.titre || 'Exercice ' + (i + 1)}</div>
          <div class="exo-meta">
            <span class="mode-badge ${cfg.badgeClass}">${cfg.badge}</span>
            <span style="font-size:11px;color:var(--muted)">⏱ ${exo.duree || '—'} · ${exo.bareme || ''}</span>
          </div>
        </div>
        <div class="exo-question">${(exo.enonce || '').replace(/\n/g, '<br>')}</div>
        <div class="section-label" style="margin-bottom:6px">Ta réponse</div>
        <textarea rows="4" placeholder="Écris ta réponse avant de voir la correction…" style="margin-bottom:12px"></textarea>
        <button class="btn btn-ghost btn-sm" onclick="toggleCorr(this)">Voir la correction</button>
        <div class="exo-correction" id="corr-${i}">
          <div class="correction-label">Correction</div>
          ${(exo.correction || '').replace(/\n/g, '<br>')}
        </div>
      </div>`).join('')}`;
        result.style.display = 'block';
      } catch { result.innerHTML = `<p style="color:var(--danger);padding:12px">Erreur. Réessaie.</p>`; result.style.display = 'block'; }
    }

    function toggleCorr(btn) { const c = btn.nextElementSibling; c.classList.toggle('show'); btn.textContent = c.classList.contains('show') ? 'Masquer la correction' : 'Voir la correction'; }

    function exportExercices() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Exercices — ${exoMatiereCache}`, 15, 20);
      doc.setFontSize(11);
      doc.text(`Niveau : ${exoNiveauCache} | Type : ${exoConfig[selectedEType].badge}`, 15, 30);
      let y = 45;
      exoResultData.forEach((exo, i) => {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        const tLines = doc.splitTextToSize(exo.titre || `Exercice ${i + 1}`, 180);
        tLines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 7; });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const eLines = doc.splitTextToSize(exo.enonce || '', 180);
        eLines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 6; });
        y += 4;
        doc.setTextColor(5, 150, 105);
        doc.text('--- Correction ---', 15, y); y += 6;
        const cLines = doc.splitTextToSize(exo.correction || '', 180);
        cLines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 6; });
        doc.setTextColor(0, 0, 0);
        y += 8;
      });
      doc.save(`Exercices_${exoMatiereCache}_StudyOS.pdf`);
    }

    /* ═══════════════════════════════════════
       ASSISTANT
    ═══════════════════════════════════════ */
    const chatHistory = [];
    async function sendChat() {
      const input = document.getElementById('chatInput');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      appendMsg('user', msg);
      chatHistory.push({ role: 'user', content: msg });
      const typingEl = appendMsg('ai', '…');
      const system = `Tu es StudyOS, assistant pédagogique pour élèves francophones. Tu expliques clairement avec des exemples simples. Tu guides sans faire le travail à leur place. Bienveillant, direct, motivant. Réponds toujours en français.`;
      const res = await fetch(`${BACKEND_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: chatHistory, system }) });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Je n'ai pas compris, reformule.";
      typingEl.innerHTML = fmtChat(reply);
      chatHistory.push({ role: 'assistant', content: reply });
      document.getElementById('chatMessages').scrollTop = 9999;
    }

    function appendMsg(role, text) {
      const msgs = document.getElementById('chatMessages');
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      const avatarSvg = role === 'ai'
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      div.innerHTML = `<div class="msg-avatar">${avatarSvg}</div><div class="msg-bubble">${fmtChat(text)}</div>`;
      msgs.appendChild(div); msgs.scrollTop = 9999;
      return div.querySelector('.msg-bubble');
    }
    function fmtChat(t) { return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }

    /* ═══════════════════════════════════════
       PLANNING
    ═══════════════════════════════════════ */
    async function genPlanning() {
      const exam = document.getElementById('examName').value.trim();
      const date = document.getElementById('examDate').value;
      const hours = document.getElementById('hoursDay').value;
      const subs = document.getElementById('subjects').value.trim();
      if (!exam || !date || !subs) return alert('Remplis tous les champs !');
      const loader = document.getElementById('planLoader');
      const result = document.getElementById('planResult');
      loader.classList.add('show'); result.style.display = 'none';
      const today = new Date().toISOString().split('T')[0];
      const prompt = `Coach scolaire. Planning de révision 7 jours.\nExamen: ${exam} | Date: ${date} | Aujourd'hui: ${today} | Heures/jour: ${hours}h | Matières: ${subs}\nJSON valide sans markdown : [{"jour":"Lundi 12 Mai","taches":["Matière : Sujet (Xmin)"]}]\nExactement 7 jours.`;
      const raw = await callClaude(prompt);
      loader.classList.remove('show');
      console.log('Réponse brute du planning:', raw);
      try {
        const jsonStart = raw.indexOf('[');
        const jsonEnd = raw.lastIndexOf(']') + 1;
        const jsonStr = raw.slice(jsonStart, jsonEnd);
        const plan = JSON.parse(jsonStr);
        result.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="section-label" style="margin-bottom:0">Planning — ${hours}h/jour</div>
        <button class="export-btn" onclick="exportPlanning(${JSON.stringify(plan).replace(/"/g, '&quot;')},'${exam}','${hours}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Télécharger PDF
        </button>
      </div>
      <div class="week-grid">${plan.map(d => `
        <div class="day-card">
          <div class="day-name">${d.jour}</div>
          ${d.taches.map(t => { const m = t.match(/\((\d+)min\)/); return `<div class="day-task">${t.replace(/\(\d+min\)/, '').trim()}</div>${m ? `<div class="day-duration">⏱ ${m[1]} min</div>` : ''}` }).join('')}
        </div>`).join('')}
      </div>`;
        result.style.display = 'block';
      } catch { result.innerHTML = `<p style="color:var(--danger)">Erreur. Réessaie.</p>`; result.style.display = 'block'; }
    }

    function exportPlanning(plan, exam, hours) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Planning de révision — ${exam}`, 15, 20);
      doc.setFontSize(11);
      doc.text(`${hours}h par jour | ${new Date().toLocaleDateString('fr-FR')}`, 15, 30);
      let y = 45;
      plan.forEach(day => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(day.jour, 15, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        day.taches.forEach(t => {
          const lines = doc.splitTextToSize(`• ${t}`, 175);
          lines.forEach(l => { if (y > 275) { doc.addPage(); y = 20; } doc.text(l, 20, y); y += 6; });
        });
        y += 4;
      });
      doc.save(`Planning_${exam}_StudyOS.pdf`);
    }

    /* ═══════════════════════════════════════
       NOTATION
    ═══════════════════════════════════════ */
    let sessionStart = Date.now();
    let ratingShown = false;

    setInterval(() => {
      const elapsed = (Date.now() - sessionStart) / 1000 / 60;
      if (elapsed >= 1 && !ratingShown) { ratingShown = true; showRatingPopup(); }
    }, 60000);

    function showRatingPopup() { document.getElementById('ratingPopup').style.display = 'flex'; }
    function closeRating() { document.getElementById('ratingPopup').style.display = 'none'; }

    function setRating(note) {
      document.querySelectorAll('.star-btn').forEach((s, i) => { s.style.color = i < note ? '#fbbf24' : 'var(--muted)'; });
      document.getElementById('ratingPopup').dataset.note = note;
    }

    async function submitRating() {
      const note = document.getElementById('ratingPopup').dataset.note;
      const commentaire = document.getElementById('ratingComment').value.trim();
      const duree = Math.round((Date.now() - sessionStart) / 1000 / 60) + ' min';
      if (!note) return alert('Donne une note d\'abord !');
      if (!commentaire) return alert('Ton commentaire est obligatoire — ton avis nous aide !');
      try {
        await fetch(`${BACKEND_URL}/api/rating`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: parseInt(note), commentaire, duree }) });
      } catch (e) { }
      document.getElementById('ratingPopup').style.display = 'none';
      alert('Merci pour ton avis !');
    }