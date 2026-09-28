/* Periode Bebas v1 — untuk aplikasi Permohonan UC
 * Entry tidak lagi dikelompokkan dari bulan tanggal berangkat.
 * Tiap entry menyimpan "periode" sendiri, jadi tanggal boleh lewat bulan
 * (mis. periode Juli berisi kunjungan tanggal 5 Agustus).
 * Nama periode juga bisa diketik bebas, mis. "Juli – 5 Agustus 2026".
 */
(function () {
  'use strict';
  if (window.__periodeBebas) return;
  window.__periodeBebas = true;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------- periode tiap entry ---------- */
  function periodOf(e) { return e.periode || monthKey(e.tanggalMulai); }
  window.periodOf = periodOf;

  window.getEntriesForMonth = function (mk) {
    return state.entries
      .filter(function (e) { return periodOf(e) === mk; })
      .sort(function (a, b) { return String(a.tanggalMulai).localeCompare(String(b.tanggalMulai)); });
  };

  window.getAvailableMonths = function () {
    var set = new Set();
    state.entries.forEach(function (e) { set.add(periodOf(e)); });
    Object.keys(state.pengajuanPerBulan || {}).forEach(function (k) { set.add(k); });
    Object.keys(state.periodeLabel || {}).forEach(function (k) { set.add(k); });
    set.add(todayISO().substring(0, 7));
    return [].concat(Array.from(set)).sort().reverse();
  };

  /* ---------- nama periode bebas ---------- */
  var baseLabel = window.monthLabelID;
  window.monthLabelID = function (mk) {
    var c = (state.periodeLabel || {})[mk];
    return c && c.trim() ? c.trim() : baseLabel(mk);
  };

  /* ---------- sisipan UI ---------- */
  function injectSettings() {
    if (document.getElementById('metaPeriodeLabel')) return;
    var lokasi = document.getElementById('metaLokasi');
    if (!lokasi) return;
    var wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML =
      '<div><label>Nama periode (dipakai di judul &amp; nama file)</label>' +
      '<input type="text" id="metaPeriodeLabel" placeholder="mis. Juli \u2013 5 Agustus 2026">' +
      '<div class="help">Kosongkan untuk memakai nama bulan biasa.</div></div>';
    var row = lokasi.closest('.row');
    (row && row.parentNode ? row.parentNode : lokasi.parentNode).insertBefore(wrap, row ? row.nextSibling : null);
    document.getElementById('metaPeriodeLabel').addEventListener('input', function (ev) {
      if (!state.periodeLabel) state.periodeLabel = {};
      var v = ev.target.value;
      if (v.trim()) state.periodeLabel[currentMonth] = v; else delete state.periodeLabel[currentMonth];
      document.getElementById('periodLabel').textContent = monthLabelID(currentMonth);
      renderMonthSelect();
      scheduleSave();
    });
  }

  function injectModalField() {
    if (document.getElementById('ePeriode')) return;
    var mulai = document.getElementById('tMulai');
    if (!mulai) return;
    var row = mulai.closest('.row');
    if (!row) return;
    var box = document.createElement('div');
    box.style.marginBottom = '8px';
    box.innerHTML =
      '<label>Masuk periode (untuk pengajuan bulan mana)</label>' +
      '<select id="ePeriode"></select>' +
      '<div class="help">Tanggal di bawah boleh di luar bulan periode, mis. periode Juli dengan tanggal 5 Agustus.</div>';
    row.parentNode.insertBefore(box, row);
  }

  function fillPeriodSelect() {
    var sel = document.getElementById('ePeriode');
    if (!sel || !editingEntry) return;
    var cur = editingEntry.periode || (editingId ? monthKey(editingEntry.tanggalMulai) : currentMonth);
    var list = getAvailableMonths();
    if (list.indexOf(cur) < 0) list.push(cur);
    list.sort().reverse();
    sel.innerHTML = list.map(function (m) {
      return '<option value="' + m + '"' + (m === cur ? ' selected' : '') + '>' + monthLabelID(m) + '</option>';
    }).join('');
    sel.value = cur;
  }

  /* ---------- penanda entry di luar bulan periode ---------- */
  function decorate() {
    getEntriesForMonth(currentMonth).forEach(function (e) {
      var el = document.getElementById('entry-' + e.id);
      if (!el || el.querySelector('.pill-luar')) return;
      if (monthKey(e.tanggalMulai) === periodOf(e)) return;
      var d = el.querySelector('.entry-hdr .date');
      if (!d) return;
      var s = document.createElement('span');
      s.className = 'pill warn pill-luar';
      s.textContent = 'beda bulan';
      s.title = 'Tanggal di luar bulan periode, tetap dihitung di periode ini';
      d.appendChild(document.createTextNode(' '));
      d.appendChild(s);
    });
  }

  /* ---------- bungkus fungsi aplikasi ---------- */
  var baseRenderAll = window.renderAll;
  window.renderAll = function () {
    baseRenderAll();
    injectSettings();
    var i = document.getElementById('metaPeriodeLabel');
    if (i && document.activeElement !== i) i.value = (state.periodeLabel || {})[currentMonth] || '';
    decorate();
  };
  // aplikasi memanggil renderApp() saat Jabatan diganti, tapi fungsinya tidak pernah dibuat
  window.renderApp = window.renderAll;

  var baseOpen = window.openEntryModal;
  window.openEntryModal = function (id) {
    baseOpen(id);
    injectModalField();
    fillPeriodSelect();
  };

  window.saveEntry = function () {
    editingEntry.tanggalMulai = document.getElementById('tMulai').value;
    editingEntry.tanggalSelesai = editingEntry.tipe === 'harian'
      ? editingEntry.tanggalMulai
      : document.getElementById('tSelesai').value;
    editingEntry.namaTrip = document.getElementById('tNama').value.trim();

    if (!editingEntry.tanggalMulai) { toast('Tanggal harus diisi', 'err'); return; }
    if (editingEntry.tipe === 'menginap' && diffDays(editingEntry.tanggalMulai, editingEntry.tanggalSelesai) < 1) {
      toast('Tanggal pulang harus setelah berangkat', 'err'); return;
    }

    editingEntry.biayaLain = (editingEntry.biayaLain || []).filter(function (b) { return b.nama || b.jumlah; });
    editingEntry.tujuan = (editingEntry.tujuan || []).map(function (t) {
      return Object.assign({}, t, { aktivitas: (t.aktivitas || []).filter(function (a) { return a; }) });
    }).filter(function (t) { return t.tempat || t.aktivitas.length; });

    var sel = document.getElementById('ePeriode');
    var periode = (sel && sel.value) || editingEntry.periode || currentMonth;
    editingEntry.periode = periode;

    if (editingId) {
      var idx = state.entries.findIndex(function (e) { return e.id === editingId; });
      state.entries[idx] = editingEntry;
    } else {
      state.entries.push(editingEntry);
    }
    if (!state.pengajuanPerBulan[periode]) state.pengajuanPerBulan[periode] = 3000000;
    if (periode !== currentMonth) {
      currentMonth = periode;
      toast('Masuk periode ' + monthLabelID(periode), 'ok');
    }

    closeEntryModal();
    renderAll();
    saveStore();
    toast('Tersimpan', 'ok');
  };

  ready(function () {
    if (!state.periodeLabel) state.periodeLabel = {};
    renderAll();
  });
})();
