let currentTMA = 10;
let isBurning = false;
let damActive = false;
let hydroTimer = null;

function stopHydroFlow() {
  if (hydroTimer) {
    clearInterval(hydroTimer);
    hydroTimer = null;
  }
}

function updateSimulatorUI() {
  const slider = document.getElementById('tmaSlider');
  slider.value = currentTMA;
  document.getElementById('sliderValText').textContent = `-${currentTMA} cm`;

  const waterY = 148 + (currentTMA / 90) * 127;
  const waterH = 290 - waterY;

  const peatWater = document.getElementById('peatWater');
  const waterLine = document.getElementById('waterLine');
  const canalWater = document.getElementById('canalWater');
  const tmaLabel = document.getElementById('tmaLabel');

  peatWater.setAttribute('y', waterY);
  peatWater.setAttribute('height', waterH);
  waterLine.setAttribute('y1', waterY);
  waterLine.setAttribute('y2', waterY);

  tmaLabel.textContent = `Muka Air Tanah (TMA): -${currentTMA} cm`;
  tmaLabel.setAttribute('y', currentTMA > 75 ? waterY - 8 : waterY + 18);

  const canalY = damActive ? Math.max(155, waterY - 14) : Math.min(282, waterY + 18);
  canalWater.setAttribute('y', canalY);
  canalWater.setAttribute('height', 290 - canalY);

  const soilCracks = document.getElementById('soilCracks');
  const peatUpper = document.getElementById('peatUpper');
  const canopy1 = document.getElementById('canopy1');
  const canopy2 = document.getElementById('canopy2');

  if (currentTMA > 40) {
    soilCracks.style.display = 'block';
    peatUpper.setAttribute('fill', '#5d3a2e');
    canopy1.setAttribute('fill', isBurning ? '#44403c' : '#ca8a04');
    canopy2.setAttribute('fill', isBurning ? '#292524' : '#a16207');
  } else {
    soilCracks.style.display = 'none';
    peatUpper.setAttribute('fill', '#3e2723');
    canopy1.setAttribute('fill', '#10b981');
    canopy2.setAttribute('fill', '#059669');
  }

  if (currentTMA <= 40 && isBurning) {
    isBurning = false;
  }

  document.getElementById('fireGroup').style.display = isBurning ? 'block' : 'none';
  document.getElementById('smokeGroup').style.display = isBurning ? 'block' : 'none';
  document.getElementById('skyTop').setAttribute('stop-color', isBurning ? '#431407' : '#0f2e2b');
  document.getElementById('skyBot').setAttribute('stop-color', isBurning ? '#9a3412' : '#1e4e48');

  document.getElementById('canalDam').style.display = damActive ? 'block' : 'none';
  document.getElementById('btnToggleDam').textContent = damActive ? 'Lepas Sekat Kanal' : 'Pasang Sekat Kanal';

  const banner = document.getElementById('simStatusBanner');
  const statusText = document.getElementById('statusText');
  const riskBadge = document.getElementById('riskBadge');
  const narration = document.getElementById('simNarration');

  banner.className = 'status-banner';
  if (isBurning) {
    banner.classList.add('status-fire');
    statusText.textContent = `BAHAYA: KEBAKARAN BAWAH TANAH (TMA -${currentTMA} cm)`;
    riskBadge.textContent = 'Risiko: AKTIF TERBAKAR';
    narration.innerHTML = '<strong>Api Bawah Tanah Menyala!</strong> Bara api membakar serat gambut kering di bawah permukaan dan menghasilkan kabut asap tebal. Pasang sekat kanal untuk menaikkan muka air tanah hingga api padam.';
  } else if (currentTMA > 40) {
    banner.classList.add('status-warn');
    statusText.textContent = `WASPADA: GAMBUT KERING KRITIS (TMA -${currentTMA} cm)`;
    riskBadge.textContent = 'Risiko Kebakaran: SANGAT TINGGI';
    narration.innerHTML = '<strong>Kanal Terbuka Menguras Air (-40 cm Terlewati):</strong> Tanpa sekat, air gambut terus mengalir keluar ke kanal. Lapisan atas retak, mengering, dan sangat mudah terbakar jika terkena percikan api.';
  } else {
    banner.classList.add('status-safe');
    statusText.textContent = `STATUS: AMAN & BASAH (TMA -${currentTMA} cm)`;
    riskBadge.textContent = 'Risiko Kebakaran: RENDAH';
    narration.innerHTML = damActive
      ? '<strong>Sekat Kanal Aktif (Rewetting):</strong> Sekat menahan air di dalam kanal sehingga meresap kembali membasahi gambut dan menjaga TMA tetap aman di atas -40 cm.'
      : '<strong>Kondisi Basah:</strong> Tinggi muka air masih berada di atas batas kritis (-40 cm). Namun karena sekat kanal terbuka, air akan perlahan surut ke saluran drainase.';
  }
}

function setStage(stage) {
  stopHydroFlow();
  document.querySelectorAll('.btn-stage').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.stage) === stage);
  });
  document.getElementById('sparkSizzle').style.display = 'none';

  if (stage === 1) {
    currentTMA = 10;
    damActive = false;
    isBurning = false;
  } else if (stage === 2) {
    currentTMA = 55;
    damActive = false;
    isBurning = false;
  } else if (stage === 3) {
    currentTMA = 78;
    damActive = false;
    isBurning = true;
  } else if (stage === 4) {
    currentTMA = 15;
    damActive = true;
    isBurning = false;
  }
  updateSimulatorUI();
}

function onSliderChange(val) {
  stopHydroFlow();
  currentTMA = Number(val);
  document.querySelectorAll('.btn-stage').forEach(btn => btn.classList.remove('active'));
  document.getElementById('sparkSizzle').style.display = 'none';
  updateSimulatorUI();
}

function igniteSpark() {
  const sizzle = document.getElementById('sparkSizzle');
  if (currentTMA > 40) {
    isBurning = true;
    sizzle.style.display = 'none';
    updateSimulatorUI();
  } else {
    isBurning = false;
    sizzle.style.display = 'block';
    setTimeout(() => {
      sizzle.style.display = 'none';
    }, 2600);
  }
}

function toggleDam() {
  stopHydroFlow();
  damActive = !damActive;
  document.querySelectorAll('.btn-stage').forEach(btn => btn.classList.remove('active'));
  document.getElementById('sparkSizzle').style.display = 'none';
  updateSimulatorUI();

  if (damActive) {
    hydroTimer = setInterval(() => {
      if (currentTMA > 15) {
        currentTMA = Math.max(15, currentTMA - 2);
        updateSimulatorUI();
      } else {
        stopHydroFlow();
      }
    }, 90);
  } else {
    hydroTimer = setInterval(() => {
      if (currentTMA < 65) {
        currentTMA = Math.min(65, currentTMA + 2);
        updateSimulatorUI();
      } else {
        stopHydroFlow();
      }
    }, 110);
  }
}

let score = 0;
let solvedCount = 0;
let selectedCardEl = null;

const cardExplanations = {
  sekat: 'Tepat (+100)! Sekat kanal memperlambat keluarnya air dari saluran drainase sehingga gambut kembali basah (Rewetting).',
  pltb: 'Benar (+100)! Pembukaan Lahan Tanpa Bakar (PLTB) memanfaatkan serasah menjadi kompos tanpa memicu api bawah tanah.',
  tanam: 'Hebat (+100)! Belangeran dan purun adalah tumbuhan asli rawa gambut yang mampu bertahan di tanah asam dan tergenang.',
  bakar: 'Tepat diblokir (+100)! Membakar semak di lahan gambut memicu bara tersembunyi yang menjalar di bawah tanah.',
  parit: 'Tepat diblokir (+100)! Menggali parit baru mempercepat pengeringan gambut hingga melewati batas kritis -40 cm.',
  puntung: 'Tepat diblokir (+100)! Puntung rokok yang masih menyala dapat menyulut lapisan gambut kering yang mudah terbakar.'
};

function shakeElement(el) {
  if (!el || !el.animate) return;
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-7px)' },
      { transform: 'translateX(7px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 360, easing: 'ease-in-out' }
  );
}

function initDragAndDrop() {
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      selectCard(card);
    });
  });

  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.querySelector(`.action-card[data-id="${cardId}"]`);
      if (card) evaluateDrop(card, zone);
    });
  });
}

function selectCard(card) {
  if (card.classList.contains('used')) return;
  document.querySelectorAll('.action-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedCardEl = card;
}

function tapZone(zone) {
  if (!selectedCardEl) return;
  evaluateDrop(selectedCardEl, zone);
}

function evaluateDrop(card, zone) {
  if (card.classList.contains('used')) return;
  const feedback = document.getElementById('gameFeedback');
  const targetZone = card.dataset.target;
  const chosenZone = zone.dataset.zone;

  if (targetZone === chosenZone) {
    card.classList.remove('selected');
    card.classList.add('used');
    selectedCardEl = null;

    score += 100;
    solvedCount += 1;
    document.getElementById('gameScore').textContent = score;
    document.getElementById('gameProgressText').textContent = `${solvedCount} / 6`;
    document.getElementById('gameProgressBar').style.width = `${(solvedCount / 6) * 100}%`;

    const badge = document.createElement('span');
    badge.className = 'dropped-badge';
    badge.textContent = card.querySelector('h4').textContent;
    document.getElementById(`list-${chosenZone}`).appendChild(badge);

    if (chosenZone === 'zona-larangan') {
      if (document.getElementById('list-zona-larangan').children.length === 3) {
        zone.classList.add('solved-danger');
      }
    } else {
      zone.classList.add('solved-eco');
    }

    feedback.className = 'game-feedback success';
    feedback.textContent = cardExplanations[card.dataset.id];

    if (solvedCount === 6) {
      document.getElementById('victoryBanner').classList.add('show');
    }
  } else {
    score -= 20;
    document.getElementById('gameScore').textContent = score;

    shakeElement(zone);
    shakeElement(card);

    const prevBorder = zone.style.borderColor;
    const prevBg = zone.style.backgroundColor;
    zone.style.borderColor = '#ef4444';
    zone.style.backgroundColor = 'rgba(239, 68, 68, 0.16)';
    setTimeout(() => {
      zone.style.borderColor = prevBorder;
      zone.style.backgroundColor = prevBg;
    }, 550);

    feedback.className = 'game-feedback error';
    if (targetZone === 'zona-larangan' && chosenZone !== 'zona-larangan') {
      feedback.textContent = 'Salah Zona (-20 Poin)! Tindakan ini berbahaya dan memicu kebakaran gambut—seharusnya diblokir ke Zona Larangan!';
    } else if (targetZone !== 'zona-larangan' && chosenZone === 'zona-larangan') {
      feedback.textContent = 'Salah Zona (-20 Poin)! Ini adalah aksi pemulihan lahan yang bermanfaat, bukan tindakan terlarang.';
    } else {
      feedback.textContent = 'Salah Kategori (-20 Poin)! Kartu ini memang solusi restorasi, tetapi kurang sesuai dengan fungsi zona tersebut.';
    }
  }
}

function resetGame() {
  score = 0;
  solvedCount = 0;
  selectedCardEl = null;
  document.getElementById('gameScore').textContent = '0';
  document.getElementById('gameProgressText').textContent = '0 / 6';
  document.getElementById('gameProgressBar').style.width = '0%';
  document.getElementById('victoryBanner').classList.remove('show');

  const feedback = document.getElementById('gameFeedback');
  feedback.className = 'game-feedback';
  feedback.textContent = 'Petunjuk: Tempatkan 3 aksi restorasi ke zona lahan yang sesuai, dan blokir 3 tindakan berbahaya ke Zona Larangan!';

  document.querySelectorAll('.action-card').forEach(c => {
    c.classList.remove('used', 'selected');
  });
  document.querySelectorAll('.drop-zone').forEach(z => {
    z.classList.remove('solved-eco', 'solved-danger', 'drag-over');
  });
  document.querySelectorAll('.zone-dropped-list').forEach(list => {
    list.innerHTML = '';
  });
}

const compareData = {
  karbon: {
    hMetric: 'Penyerap & Penyimpan Karbon',
    hDesc: 'Kondisi tergenang air memperlambat pembusukan sisa tumbuhan selama ribuan tahun, mengunci jutaan ton karbon agar tidak lepas ke atmosfer.',
    bMetric: 'Emisi Gas Rumah Kaca Masif',
    bDesc: 'Satu kali kebakaran besar di lahan gambut melepaskan karbon yang tersimpan ratusan tahun dalam hitungan minggu, mempercepat pemanasan global.'
  },
  udara: {
    hMetric: 'Udara Bersih & Iklim Mikro Sejuk',
    hDesc: 'Kelembapan tinggi menjaga suhu lokal tetap sejuk dan menyaring partikel polutan udara di sekitar kawasan permukiman.',
    bMetric: 'Kabut Asap Pekat & Lonjakan ISPA',
    bDesc: 'Pembakaran tidak sempurna (smoldering) menghasilkan partikel halus PM2.5 beracun yang memicu infeksi saluran pernapasan akut (ISPA).'
  },
  satwa: {
    hMetric: 'Habitat Keanekaragaman Hayati',
    hDesc: 'Menjadi rumah bagi ikan rawa (gabus, papuyu, toman), burung air, serta primata dilindungi seperti orangutan dan bekantan.',
    bMetric: 'Hilangnya Ruang Hidup Satwa',
    bDesc: 'Pohon sarang musnah dan perairan rawa menjadi asam serta tercemar abu pembakaran, mengancam populasi ikan dan satwa endemik.'
  },
  ekonomi: {
    hMetric: 'Sumber Pangan & Paludikultur Berkelanjutan',
    hDesc: 'Masyarakat dapat memanen ikan rawa, madu kelulut, purun untuk kerajinan anyaman, serta tanaman sagu dan jelutung tanpa merusak tanah.',
    bMetric: 'Sekolah Diliburkan & Transportasi Lumpuh',
    bDesc: 'Jarak pandang menurun drastis melumpuhkan penerbangan, pelayaran sungai, aktivitas belajar mengajar, serta menimbulkan kerugian ekonomi miliaran rupiah.'
  }
};

function switchCompare(key, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('healthyMetric').textContent = compareData[key].hMetric;
  document.getElementById('healthyDesc').textContent = compareData[key].hDesc;
  document.getElementById('burnedMetric').textContent = compareData[key].bMetric;
  document.getElementById('burnedDesc').textContent = compareData[key].bDesc;
}

const quizQuestions = [
  {
    q: '1. Sebuah kawasan gambut mengalami penurunan muka air hingga -65 cm akibat kanal tua. Langkah 3R pertama yang paling mendesak dilakukan adalah...',
    options: [
      'Rewetting (Pembasahan kembali) dengan membangun sekat kanal',
      'Membuat lebih banyak parit agar air cepat mengalir ke sungai',
      'Membakar lapisan atas supaya abu menyuburkan tanah'
    ],
    answer: 0,
    exp: 'Rewetting adalah fondasi utama restorasi gambut. Tanpa menaikkan Tinggi Muka Air di atas -40 cm, bibit tanaman baru akan mati kekeringan dan rawan terbakar lagi.'
  },
  {
    q: '2. Setelah gambut kembali basah, jenis tanaman apa yang paling tepat dipilih untuk tahap Revegetation?',
    options: [
      'Tanaman lahan kering pegunungan',
      'Spesies asli rawa gambut seperti Belangeran, Jelutung Rawa, dan Purun',
      'Tanaman musiman yang membutuhkan pengeringan total'
    ],
    answer: 1,
    exp: 'Spesies endemik rawa gambut memiliki adaptasi akar terhadap kondisi tergenang dan tingkat keasaman tinggi.'
  },
  {
    q: '3. Bagaimana wujud nyata tahap Revitalization (Revitalisasi Ekonomi) agar masyarakat tidak lagi membuka lahan dengan cara membakar?',
    options: [
      'Melarang seluruh aktivitas warga tanpa memberikan alternatif mata pencaharian',
      'Mengembangkan budidaya perikanan rawa, madu kelulut, dan kerajinan anyaman purun (paludikultur)',
      'Mengeringkan seluruh rawa untuk perkebunan monokultur kering'
    ],
    answer: 1,
    exp: 'Revitalization memastikan masyarakat sekitar gambut memperoleh penghasilan berkelanjutan dari komoditas ramah air tanpa perlu membakar lahan.'
  }
];

function renderQuiz() {
  const container = document.getElementById('quizContainer');
  container.innerHTML = quizQuestions.map((item, qIdx) => `
    <div class="quiz-item">
      <div class="quiz-q">${item.q}</div>
      <div class="quiz-options">
        ${item.options.map((opt, oIdx) => `
          <button class="quiz-opt" onclick="answerQuiz(${qIdx}, ${oIdx}, this)">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-exp" id="exp-${qIdx}">${item.exp}</div>
    </div>
  `).join('');
}

function answerQuiz(qIdx, oIdx, btn) {
  const item = quizQuestions[qIdx];
  const parent = btn.parentElement;
  const buttons = parent.querySelectorAll('.quiz-opt');
  buttons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === item.answer) b.classList.add('correct');
    else if (idx === oIdx) b.classList.add('wrong');
  });
  document.getElementById(`exp-${qIdx}`).classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  updateSimulatorUI();
  initDragAndDrop();
  renderQuiz();
});