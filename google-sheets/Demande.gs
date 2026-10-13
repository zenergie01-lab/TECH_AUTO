/* =====================================================================
   TECH'AUTO — Demandes de RDV venant de la page client (Demande.gs)
   ---------------------------------------------------------------------
   Analogie : la page client glisse une enveloppe dans la boîte aux lettres
   (onglet RDV) avec la mention « À confirmer ». Elle n'a PAS la clé du
   bureau (le jeton) : elle ne peut ni confirmer, ni envoyer un SMS libre.
   C'est la secrétaire qui confirme en passant la colonne I à « Confirmé »,
   et surEdition() envoie alors le SMS CONFIRMATION (déjà en place).

   INSTALLATION (même projet Apps Script que Code.gs et Stock.gs)
   1. Fichier → + → Script → nommer « Demande » → coller ce fichier.
   2. Dans Code.gs, tout en haut de doPost(e), JUSTE APRÈS la ligne
      « try { body = JSON.parse(...) } catch ... », ajouter :
          if (body.action === 'demande') return json_(demandeClient_(body.rdv || {}));
      (avant le contrôle du jeton : la page publique n'a pas de jeton)
   3. Gérer les déploiements → ✏️ → Nouvelle version (même URL /exec).
   4. Coller l'URL /exec dans demo-rdv-techauto.html, constante SHEET_URL.
   ===================================================================== */

const DEMANDE_MAX_PAR_TEL = 3;    // demandes max par numéro sur 6 h
const DEMANDE_MAX_PAR_HEURE = 40; // demandes max, tous clients, par heure
const DEMANDE_HORIZON_J = 120;    // on n'accepte pas de date au-delà

function demandeClient_(r) {
  // 1. Contrôle des champs : la page est publique, on ne fait confiance à rien
  const err = verifierDemande_(r);
  if (err) return { ok: false, erreur: err };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { ok: false, erreur: 'Serveur occupé, réessayez' };
  try {
    // 2. Anti-abus : quelques demandes par numéro, un plafond global par heure
    const cache = CacheService.getScriptCache();
    const kTel = 'dem_' + demChiffres_(r.tel), kAll = 'dem_all';
    const nTel = Number(cache.get(kTel) || 0), nAll = Number(cache.get(kAll) || 0);
    if (nTel >= DEMANDE_MAX_PAR_TEL) return { ok: false, erreur: 'Trop de demandes pour ce numéro, appelez l\'atelier' };
    if (nAll >= DEMANDE_MAX_PAR_HEURE) return { ok: false, erreur: 'Service saturé, appelez l\'atelier' };

    const sh = SpreadsheetApp.getActive().getSheetByName('RDV');
    // 3. Pas deux fois la même référence
    if (sh.getLastRow() > 1) {
      const refs = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(x => String(x[0]));
      if (refs.indexOf(r.ref) >= 0) return { ok: true, doublon: true };
    }

    // 4. Écriture : A Réf · B Date · C Heure · D Client · E Tél · F Plaque · G Véhicule · H Prestation · I Statut · J Montant · K Rappel · L Pièces
    const [a, m, j] = r.date.split('-').map(Number);
    sh.appendRow([r.ref, new Date(a, m - 1, j), r.heure, demTxt_(r.client), demTxt_(r.tel), r.plaque, demTxt_(r.vehicule),
      demTxt_(r.prestation), 'À confirmer', '', false, r.pieces || '']);
    const row = sh.getLastRow();
    // Infos sans colonne dédiée : en note sur la cellule Client (survol = lecture)
    const mode = { depot: 'Dépose le véhicule', attente: 'Attend sur place', courtoisie: 'Véhicule de courtoisie demandé' }[r.mode] || '';
    const note = ['Demande en ligne du ' + Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm'),
      r.email ? 'E-mail : ' + r.email : '', r.km ? 'Kilométrage : ' + r.km : '', mode, r.symptome ? 'Symptôme : « ' + r.symptome + ' »' : '']
      .filter(String).join('\n');
    sh.getRange(row, 4).setNote(note);

    // 5. Accusé de réception (texte écrit ici, jamais par la page)
    if (r.sms && !dejaEnFile_(r.ref, 'DEMANDE')) {
      ajouterSms_(r.tel, `TECH'AUTO Kourou : votre demande de RDV du ${demDateFr_(r.date)} à ${r.heure} (${r.plaque}) est bien enregistrée. Réf. ${r.ref}. L'atelier la valide et vous confirme par message.`, 'DEMANDE', r.ref);
    }
    cache.put(kTel, String(nTel + 1), 6 * 3600);
    cache.put(kAll, String(nAll + 1), 3600);
  } finally {
    lock.releaseLock();
  }

  // 6. onEdit ne voit pas les écritures par script : on recalcule les réservations de pièces
  if (r.pieces && typeof synchroniserReservations === 'function') {
    try { synchroniserReservations(); } catch (e) { console.error('Réservations : ' + e); }
  }
  return { ok: true };
}

function verifierDemande_(r) {
  const s = k => String(r[k] == null ? '' : r[k]).trim();
  ['ref', 'date', 'heure', 'client', 'tel', 'email', 'plaque', 'vehicule', 'km', 'prestation', 'symptome', 'mode', 'pieces']
    .forEach(k => r[k] = s(k));
  if (!/^TA-\d{4}-\d{1,5}$/.test(r.ref)) return 'Référence invalide';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return 'Date invalide';
  const [a, m, j] = r.date.split('-').map(Number), d = new Date(a, m - 1, j), auj = new Date();
  auj.setHours(0, 0, 0, 0);
  if (isNaN(d) || d < auj || (d - auj) / 864e5 > DEMANDE_HORIZON_J) return 'Date hors période';
  if (d.getDay() === 0 || d.getDay() === 6) return 'Le garage est fermé le week-end';
  if (!/^\d{2}h\d{2}$/.test(r.heure)) return 'Heure invalide';
  if (r.client.length < 3 || r.client.length > 60) return 'Nom invalide';
  if (!/^[+\d][\d .\-]{8,18}$/.test(r.tel) || demChiffres_(r.tel).length < 9) return 'Téléphone invalide';
  if (r.email && (r.email.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))) return 'E-mail invalide';
  if (!/^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(r.plaque)) return 'Immatriculation invalide';
  if (!r.vehicule || r.vehicule.length > 60) return 'Véhicule invalide';
  if (!/^\d{0,7}$/.test(r.km.replace(/[\s.]/g, ''))) return 'Kilométrage invalide';
  if (!r.prestation || r.prestation.length > 200) return 'Prestation invalide';
  if (r.symptome.length > 300) return 'Symptôme trop long';
  if (r.pieces.length > 200 || !/^[A-Za-z0-9_\-;x×* ]*$/.test(r.pieces)) return 'Pièces invalides';
  r.sms = r.sms === true;
  return '';
}

// Un texte tapé par le client ne doit jamais devenir une formule (=, +, -, @ en tête)
function demTxt_(v) { v = String(v); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function demChiffres_(v) { return String(v).replace(/\D/g, ''); }
function demDateFr_(iso) {
  const [a, m, j] = iso.split('-').map(Number), d = new Date(a, m - 1, j);
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${jours[d.getDay()]} ${j} ${mois[m - 1]}`;
}
