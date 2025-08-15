// Print functionality for tournament brackets
import { createCanvasConnectionScript } from './CanvasConnections';
import { getBracketPrintStyles } from './BracketStyles';

export const printBracket = (tournamentData, division_id) => {
  const printHTML = generatePrintHTML(tournamentData, division_id);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printHTML);
  printWindow.document.close();
  
  // Wait for content to load, then setup canvas and print
  printWindow.onload = () => {
    // Call the canvas setup function in the print window with SAME timing as screen
    setTimeout(() => {
      if (printWindow.setupConnections) {
        printWindow.setupConnections();
      }
      
      // Print after canvas setup completes - same delay as screen
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 800);
    }, 300);
  };
};

const generatePrintHTML = (data, division_id) => {
  const { rounds, stats, lastRefresh } = data;
  
  // Generate traditional tournament bracket structure
  const bracketHTML = generateTraditionalBracket(rounds);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tournament Bracket - Division ${division_id}</title>
        ${getBracketPrintStyles()}
      </head>
      <body>
        <div class="print-header">
          <h1>Tournament Bracket - Division ${division_id}</h1>
          <div style="margin-top: 10px;">
            <strong>Total Matches:</strong> ${stats?.totalMatches || 0} | 
            <strong>Completed:</strong> ${stats?.completedMatches || 0} | 
            <strong>Remaining:</strong> ${stats?.remainingMatches || 0}
          </div>
          ${lastRefresh ? `<div style="font-size: 10px; color: #666; margin-top: 10px;">Printed: ${lastRefresh.toLocaleString()}</div>` : ''}
        </div>
        
        ${bracketHTML}
        
        <script>
          ${createCanvasConnectionScript()}
          
          // Setup connections after DOM is ready
          setTimeout(function() {
            window.setupConnections();
          }, 800);
        </script>
      </body>
    </html>
  `;
};

const generateTraditionalBracket = (rounds) => {
  if (!rounds || Object.keys(rounds).length === 0) {
    return '<div class="bracket-container"><div class="no-matches">No bracket data available</div></div>';
  }

  const sortedRounds = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));
  const finalRound = Math.max(...sortedRounds.map(r => parseInt(r)));

  // Split Round 1 matches between left and right sides
  const round1Matches = rounds['1'] || [];
  const leftMatches = round1Matches.slice(0, Math.ceil(round1Matches.length / 2));
  const rightMatches = round1Matches.slice(Math.ceil(round1Matches.length / 2));

  // Middle rounds (2, 3, 4, etc.) go in the center
  const middleRounds = sortedRounds.filter(round => parseInt(round) > 1);

  // Create arrays for left and right sides with proper round data
  const leftRounds = leftMatches.length > 0 ? [{ round: 1, matches: leftMatches }] : [];
  const rightRounds = rightMatches.length > 0 ? [{ round: 1, matches: rightMatches }] : [];

  // Build connection mapping based on participant IDs between consecutive rounds
  const connections = {};
  
  for (let i = 0; i < sortedRounds.length - 1; i++) {
    const currentRound = sortedRounds[i];
    const nextRound = sortedRounds[i + 1];
    
    const currentRoundMatches = rounds[currentRound] || [];
    const nextRoundMatches = rounds[nextRound] || [];
    
    // For each match in current round, find which next round match it connects to
    currentRoundMatches.forEach(currentMatch => {
      // Only create connection if current match has a winner
      if (!currentMatch.winner) return;
      
      // Find next round match that contains the winner's participant_id
      const winnerParticipantId = currentMatch.winner === 'user1' ? 
        currentMatch.participant_id1 : currentMatch.participant_id2;
      
      const targetMatch = nextRoundMatches.find(nextMatch => 
        nextMatch.participant_id1 === winnerParticipantId || 
        nextMatch.participant_id2 === winnerParticipantId
      );
      
      if (targetMatch) {
        connections[currentMatch.bracket_id] = targetMatch.bracket_id;
      }
    });
  }

  // Determine champion
  const champion = rounds[finalRound]?.[0]?.winner ? 
    (rounds[finalRound][0].winner === 'user1' ? rounds[finalRound][0].user1 : rounds[finalRound][0].user2) : 
    'TBD';

  const renderMatch = (match, isLeftSide = false, isRightSide = false, hasNextRound = true, matchIndex = 0) => {
    const user1Winner = match.winner === 'user1';
    const user2Winner = match.winner === 'user2';
    
    // Create connection line based on bracket ID mapping (using bracket_id not id)
    const targetBracketId = connections[match.bracket_id];
    let connectionLine = '';
    
    if (targetBracketId && hasNextRound) {
      const lineClass = isLeftSide ? 'line-horizontal-left' : (isRightSide ? 'line-horizontal-right' : 'line-horizontal');
      connectionLine = `<div class="${lineClass}" data-target-bracket="${targetBracketId}"></div>`;
    }
    
    return `
      <div class="match-bracket" data-bracket-id="${match.bracket_id}">
        <div class="match-participant ${user1Winner ? 'winner' : ''}">${match.user1 || 'TBD'}</div>
        <div class="match-participant ${user2Winner ? 'winner' : ''}">${match.user2 || 'TBD'}</div>
        ${connectionLine}
      </div>
    `;
  };

  const renderRoundColumn = (roundData) => {
    return `
      <div class="round-column">
        <div class="round-header-bracket">Round ${roundData.round}</div>
        ${roundData.matches.map(match => renderMatch(match)).join('')}
      </div>
    `;
  };

  // Group rounds by side and render them in order
  const renderSide = (roundsArray, side) => {
    // Group by round number
    const roundGroups = {};
    roundsArray.forEach(roundData => {
      if (!roundGroups[roundData.round]) {
        roundGroups[roundData.round] = [];
      }
      roundGroups[roundData.round] = roundGroups[roundData.round].concat(roundData.matches);
    });

    const sortedRoundNumbers = Object.keys(roundGroups).sort((a, b) => parseInt(a) - parseInt(b));
    
    return sortedRoundNumbers.map(roundNumber => {
      const hasNextRound = parseInt(roundNumber) < parseInt(finalRound);
      const isLeftSide = side === 'left';
      const isRightSide = side === 'right';
      
      return `
        <div class="round-column" data-round="${roundNumber}" data-side="${side}">
          <div class="round-header-bracket">Round ${roundNumber}</div>
          ${roundGroups[roundNumber].map((match, index) => 
            renderMatch(match, isLeftSide, isRightSide, hasNextRound, index)
          ).join('')}
        </div>
      `;
    }).join('');
  };

  // Generate left side (rounds progress right to left toward center)
  const leftSideHTML = renderSide(leftRounds, 'left');
  
  // Generate right side (rounds progress left to right toward center)  
  const rightSideHTML = renderSide(rightRounds, 'right');

  return `
    <div class="bracket-container">
      <div class="bracket-left">
        <div class="bracket-side">
          ${leftSideHTML}
        </div>
      </div>

      <div class="bracket-center">
        ${middleRounds.map(roundNumber => {
          const roundMatches = rounds[roundNumber] || [];
          const isLastRound = parseInt(roundNumber) === parseInt(finalRound);
          const hasNextRound = !isLastRound; // Center rounds have next rounds except the final one
          return `
            <div class="round-column">
              <div class="round-header-bracket">Round ${roundNumber}${isLastRound && roundMatches.length === 1 ? ' - Final' : ''}</div>
              ${roundMatches.length > 0 ? 
                roundMatches.map((match, index) => renderMatch(match, false, false, hasNextRound, index)).join('') : 
                '<div class="match-bracket">No matches yet</div>'
              }
              
              ${isLastRound && roundMatches.length === 1 && champion !== 'TBD' ? `
                <div class="champion-area">
                  <div class="champion-title">🏆 CHAMPION</div>
                  <div class="champion-name">${champion}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="bracket-right">
        <div class="bracket-side">
          ${rightSideHTML}
        </div>
      </div>
    </div>
  `;
};
