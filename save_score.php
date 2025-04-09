<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

$username = isset($_POST['username']) ? htmlspecialchars($_POST['username'], ENT_QUOTES, 'UTF-8') : 'Tuntematon';
$balance = isset($_POST['balance']) ? (int)$_POST['balance'] : 0;

$leaderboardFile = 'leaderboard.json';

$leaderboard = [];
if (file_exists($leaderboardFile)) {
    $fileContent = file_get_contents($leaderboardFile);
    if ($fileContent !== false) {
        $decoded = json_decode($fileContent, true);
        if (is_array($decoded)) {
            $leaderboard = $decoded;
        }
    }
}

$userExists = false;
for ($i = 0; $i < count($leaderboard); $i++) {
    if ($leaderboard[$i]['username'] === $username) {
        if ($balance > $leaderboard[$i]['balance']) {
            $leaderboard[$i]['balance'] = $balance;
        }
        $userExists = true;
        break;
    }
}

if (!$userExists) {
    $leaderboard[] = ['username' => $username, 'balance' => $balance];
}

usort($leaderboard, function($a, $b) {
    return $b['balance'] - $a['balance'];
});

$leaderboard = array_slice($leaderboard, 0, 10);

if (file_put_contents($leaderboardFile, json_encode($leaderboard, JSON_PRETTY_PRINT)) === false) {
    die("Virhe: Ei voitu kirjoittaa tiedostoon $leaderboardFile");
}

echo "Saldo tallennettu!";
?>