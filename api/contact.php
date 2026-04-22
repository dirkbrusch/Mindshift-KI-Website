<?php
/**
 * Mindshift KI — Kontaktformular-Handler
 * Empfängt POST-Daten vom Formular und sendet sie per SMTP als E-Mail.
 * Keine Datenspeicherung — DSGVO-konform.
 *
 * Deployment: Auf IONOS-Webhosting unter Subdomain api.mindshift-ki.de → /api/contact.php
 * NICHT auf GitHub Pages (kein PHP-Support dort)
 */

// === KONFIGURATION ===
$empfaenger = 'dirk.brusch@mindshift-ki.de';
$absender_email = 'noreply@mindshift-ki.de';
$absender_name = 'Mindshift KI Website';
$betreff_prefix = '[Mindshift KI] Neue Anfrage';

// Erlaubte Herkunft (CORS) — Haupt-Website und www
$allowed_origins = [
    'https://mindshift-ki.de',
    'https://www.mindshift-ki.de'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://mindshift-ki.de');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Preflight-Request beantworten
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Nur POST erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Nur POST erlaubt']);
    exit;
}

// === HONEYPOT SPAM-SCHUTZ ===
if (!empty($_POST['_gotcha'])) {
    // Bot erkannt — still akzeptieren, aber nicht senden
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// === FORMULARDATEN LESEN ===
$vorname     = trim($_POST['vorname'] ?? '');
$nachname    = trim($_POST['nachname'] ?? '');
$email       = trim($_POST['email'] ?? '');
$telefon     = trim($_POST['telefon'] ?? '');
$unternehmen = trim($_POST['unternehmen'] ?? '');
$rolle       = trim($_POST['rolle'] ?? '');
$groesse     = trim($_POST['groesse'] ?? '');
$standort    = trim($_POST['standort'] ?? '');
$nachricht   = trim($_POST['nachricht'] ?? '');
// Legacy-Feld, falls alte Formulare noch aktiv sind
$interesse   = trim($_POST['interesse'] ?? '');

// === MAPPING: Select-Werte auf lesbare Labels ===
$rolle_labels = [
    'vorstand-gf'     => 'Vorstand / Geschäftsführung',
    'bereichsleitung' => 'Bereichs-/Abteilungsleitung',
    'hr-people'       => 'HR / People & Culture',
    'transformation'  => 'Transformation / Change',
    'it-digital'      => 'IT / Digital',
    'sonstige'        => 'Sonstige',
];
$groesse_labels = [
    'lt-50'     => 'Unter 50 Mitarbeitende',
    '50-250'    => '50 – 250 Mitarbeitende',
    '250-1000'  => '250 – 1.000 Mitarbeitende',
    'gt-1000'   => 'Über 1.000 Mitarbeitende',
];
$standort_labels = [
    'am-anfang'   => 'Noch am Anfang — tastet sich heran',
    'pilot-stuck' => 'Erste Piloten laufen — skalieren aber nicht',
    'neustart'    => 'Braucht einen echten Neustart',
    'skalieren'   => 'Bereits weit — will systematisch skalieren',
];

$rolle_label    = $rolle_labels[$rolle] ?? $rolle;
$groesse_label  = $groesse_labels[$groesse] ?? $groesse;
$standort_label = $standort_labels[$standort] ?? $standort;

// === VALIDIERUNG ===
$fehler = [];
if (empty($vorname))                                             $fehler[] = 'Vorname fehlt';
if (empty($nachname))                                            $fehler[] = 'Nachname fehlt';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $fehler[] = 'Gültige E-Mail erforderlich';
if (empty($telefon))                                             $fehler[] = 'Telefonnummer fehlt';
if (empty($unternehmen))                                         $fehler[] = 'Unternehmen fehlt';
if (empty($rolle) || !isset($rolle_labels[$rolle]))              $fehler[] = 'Rolle fehlt oder ungültig';
if (empty($groesse) || !isset($groesse_labels[$groesse]))        $fehler[] = 'Unternehmensgröße fehlt oder ungültig';
if (empty($standort) || !isset($standort_labels[$standort]))    $fehler[] = 'KI-Standort fehlt oder ungültig';

if (!empty($fehler)) {
    http_response_code(400);
    echo json_encode(['error' => implode(', ', $fehler)]);
    exit;
}

// === LEAD-QUALIFIKATIONS-SCORE (einfache Heuristik für Triage) ===
$score = 0;
if (in_array($rolle, ['vorstand-gf', 'bereichsleitung', 'transformation'])) $score += 2;
if (in_array($groesse, ['50-250', '250-1000', 'gt-1000']))                  $score += 2;
if (in_array($standort, ['pilot-stuck', 'neustart', 'skalieren']))          $score += 1;
$score_label = $score >= 4 ? 'HOCH' : ($score >= 2 ? 'MITTEL' : 'NIEDRIG');

// === E-MAIL ZUSAMMENSTELLEN ===
$betreff = $betreff_prefix . ' [' . $score_label . '] von ' . $vorname . ' ' . $nachname;

$text  = "Neue Anfrage über mindshift-ki.de\n";
$text .= "============================================\n\n";
$text .= "Lead-Score:    $score_label ($score/5)\n\n";
$text .= "--- KONTAKT ---\n";
$text .= "Name:          $vorname $nachname\n";
$text .= "E-Mail:        $email\n";
$text .= "Telefon:       $telefon\n";
$text .= "Unternehmen:   $unternehmen\n\n";
$text .= "--- QUALIFIKATION ---\n";
$text .= "Rolle:         $rolle_label\n";
$text .= "Größe:         $groesse_label\n";
$text .= "KI-Standort:   $standort_label\n";
if (!empty($interesse)) {
    $text .= "Interesse:     $interesse\n";
}
$text .= "\n--- NACHRICHT ---\n";
$text .= "--------------------------------------------\n";
$text .= ($nachricht ?: '(keine Nachricht hinterlegt)') . "\n";
$text .= "--------------------------------------------\n\n";
$text .= "Gesendet am: " . date('d.m.Y H:i') . " Uhr\n";

// === E-MAIL SENDEN ===
$headers = "From: $absender_name <$absender_email>\r\n";
$headers .= "Reply-To: $vorname $nachname <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: Mindshift-KI-Website\r\n";

$gesendet = mail($empfaenger, $betreff, $text, $headers);

if ($gesendet) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Nachricht gesendet']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'E-Mail konnte nicht gesendet werden']);
}
