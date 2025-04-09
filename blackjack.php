<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Fissi Blackjack</title>
  <link rel="stylesheet" href="black.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
  <h1 class="game-title">Fissi Blackjack</h1>
  
  <div class="game-container">
    <div class="scores">
      <div class="score-box">
        <span class="score-label">Balance:</span>
        <span id="balance">1000</span>
      </div>
      <div class="score-box">
        <span class="score-label">Bet:</span>
        <span id="current-bet">0</span>
      </div>
    </div>
    
    <div id="bet-controls" class="bet-section">
      <div class="slider-container">
        <input type="range" min="10" max="1000" step="1" value="25" class="bet-slider" id="bet-slider">
        <div class="current-slider-value" id="slider-value">25</div>
      </div>
      <button id="place-bet" class="btn bet-btn"><i class="fas fa-coins"></i> Place Bet</button>
      <button id="deal-button" class="btn deal-btn" disabled><i class="fas fa-play"></i> Deal</button>
    </div>
    
    <div class="cards-container">
      <div class="dealer-section">
        <h2 class="section-title">Dealer: <span id="dealer-score">0</span></h2>
        <div class="cards" id="dealer-cards"></div>
      </div>
      
      <div class="player-hands">
        <div class="player-section" id="player-hand-main">
          <h2 class="section-title">Player: <span id="player-score">0</span></h2>
          <div class="cards" id="player-cards"></div>
          <div id="game-controls-main" class="game-controls" style="display: none;">
            <button id="hit-button" class="btn action-btn hit-btn"><i class="fas fa-plus"></i> Hit</button>
            <button id="stand-button" class="btn action-btn stand-btn"><i class="fas fa-stop"></i> Stand</button>
            <button id="double-button" class="btn action-btn double-btn"><i class="fas fa-times-circle"></i> Double</button>
            <button id="split-button" class="btn action-btn split-btn" style="display: none;"><i class="fas fa-columns"></i> Split</button>
          </div>
        </div>
        
        <div class="player-section" id="player-hand-split" style="display: none;">
          <h2 class="section-title">Split Hand: <span id="split-score">0</span></h2>
          <div class="cards" id="split-cards"></div>
          <div id="game-controls-split" class="game-controls" style="display: none;">
            <button id="hit-split-button" class="btn action-btn hit-btn"><i class="fas fa-plus"></i> Hit</button>
            <button id="stand-split-button" class="btn action-btn stand-btn"><i class="fas fa-stop"></i> Stand</button>
            <button id="double-split-button" class="btn action-btn double-btn"><i class="fas fa-times-circle"></i> Double</button>
          </div>
        </div>
      </div>
    </div>
    
    <div id="message" class="message"></div>
    
    <!-- Muokattu stats-osio, jossa leaderboard-nappi mukana -->
    <div class="stats-container">
      <div class="stats">
        <div class="stat-box"><div>Wins</div><div id="wins">0</div></div>
        <div class="stat-box"><div>Losses</div><div id="losses">0</div></div>
        <div class="stat-box"><div>Draws</div><div id="draws">0</div></div>
        <div class="stat-box leaderboard-stat">
          <button id="show-leaderboard" class="leaderboard-btn">
            <i class="fas fa-trophy"></i> Leaderboard
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Leaderboard Modal -->
  <div id="leaderboard-overlay" class="modal-overlay">
    <div class="leaderboard-modal">
      <button id="close-leaderboard" class="modal-close"><i class="fas fa-times"></i></button>
      <h2 class="leaderboard-title"><i class="fas fa-trophy"></i> Leaderboard</h2>
      <ul id="leaderboard">
        <?php
        $leaderboardFile = 'leaderboard.json';
        if (file_exists($leaderboardFile)) {
            $leaderboard = json_decode(file_get_contents($leaderboardFile), true);
            if (is_array($leaderboard) && !empty($leaderboard)) {
                $position = 1;
                foreach ($leaderboard as $entry) {
                    $safeUsername = htmlspecialchars($entry['username'], ENT_QUOTES, 'UTF-8');
                    echo "<li><span class='position'>{$position}</span><span class='player-name'>{$safeUsername}</span><span class='player-score'>{$entry['balance']}</span></li>";
                    $position++;
                }
            } else {
                echo "<li><span class='player-name'>Ei vielä tuloksia.</span></li>";
            }
        } else {
            echo "<li><span class='player-name'>Ei vielä tuloksia.</span></li>";
        }
        ?>
      </ul>
      <div class="leaderboard-footer">
        Päivittyy pelin jälkeen
      </div>
    </div>
  </div>

  <script src="black.js"></script>
  
  <!-- Leaderboard Modal JavaScript -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const showLeaderboardBtn = document.getElementById('show-leaderboard');
      const closeLeaderboardBtn = document.getElementById('close-leaderboard');
      const leaderboardOverlay = document.getElementById('leaderboard-overlay');
      
      // Show leaderboard modal
      showLeaderboardBtn.addEventListener('click', function() {
        leaderboardOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
      });
      
      // Close leaderboard modal
      closeLeaderboardBtn.addEventListener('click', function() {
        leaderboardOverlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
      });
      
      // Close modal when clicking outside the modal content
      leaderboardOverlay.addEventListener('click', function(event) {
        if (event.target === leaderboardOverlay) {
          leaderboardOverlay.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
      
      // Close modal with Escape key
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && leaderboardOverlay.style.display === 'flex') {
          leaderboardOverlay.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
  </script>
</body>
</html>