// Print functionality for tournament brackets
import { createCanvasConnectionScript } from './CanvasConnections';
import { getBracketPrintStyles } from './BracketStyles';

// Helper function to calculate tournament rounds and matches
const calculateTournamentStructure = (totalParticipants) => {
  if (totalParticipants <= 1) return { rounds: [], totalMatches: 0 };
  
  const rounds = [];
  let participantsInRound = totalParticipants;
  let roundNumber = 1;
  
  while (participantsInRound > 1) {
    const matchesInRound = Math.floor(participantsInRound / 2);
    rounds.push({
      round: roundNumber,
      matches: matchesInRound,
      participants: participantsInRound
    });
    
    // Next round has winners from current round
    participantsInRound = matchesInRound + (participantsInRound % 2); // Add bye if odd
    roundNumber++;
  }
  
  const totalMatches = rounds.reduce((sum, round) => sum + round.matches, 0);
  return { rounds, totalMatches };
};

// Generate complete bracket structure with empty placeholders
const generateCompleteBracketStructure = (totalParticipants, actualRounds) => {
  const tournamentStructure = calculateTournamentStructure(totalParticipants);
  const structure = {};
  
  // Create all rounds with placeholder matches
  tournamentStructure.rounds.forEach(roundInfo => {
    structure[roundInfo.round] = [];
    
    for (let i = 0; i < roundInfo.matches; i++) {
      // Check if actual match exists for this position
      const actualMatch = actualRounds[roundInfo.round]?.[i];
      
      if (actualMatch) {
        // Use actual match data
        structure[roundInfo.round].push(actualMatch);
      } else {
        // Create placeholder match
        structure[roundInfo.round].push({
          bracket_id: `placeholder_r${roundInfo.round}_m${i}`,
          user1: 'TBD',
          user2: 'TBD',
          participant_id1: null,
          participant_id2: null,
          winner: null,
          round: roundInfo.round,
          isPlaceholder: true
        });
      }
    }
  });
  
  return structure;
};

export const printBracket = (tournamentData, division_id) => {
  const printHTML = generatePrintHTML(tournamentData, division_id);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printHTML);
  printWindow.document.close();

  // Wait for content to load, then setup canvas connections only
  printWindow.onload = () => {
    // Call the canvas setup function in the print window with SAME timing as screen
    setTimeout(() => {
      if (printWindow.setupConnections) {
        printWindow.setupConnections();
      }
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
        <style>
          @media print {
            .print-controls {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Tournament Bracket - Division ${division_id}</h1>
          <div style="margin-top: 10px;">
            <strong>Total Matches:</strong> ${stats?.totalMatches || 0} |
            <strong>Completed:</strong> ${stats?.completedMatches || 0} |
            <strong>Remaining:</strong> ${stats?.remainingMatches || 0}
          </div>
          ${lastRefresh ? `<div style="font-size: 10px; color: #666; margin-top: 10px;">Last Updated: ${lastRefresh.toLocaleString()}</div>` : ''}

          <div class="print-controls" style="margin: 20px 0; text-align: center;">
            <button id="printButton" onclick="window.print()" style="
              background: #007bff;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
            ">
              🖨️ Print Bracket
            </button>
            <button onclick="window.close()" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              border-radius: 5px;
              cursor: pointer;
            ">
              ✕ Close
            </button>
          </div>
        </div>

        ${bracketHTML}
        
        <script>
          ${createCanvasConnectionScript()}
          
          // Setup connections after DOM is ready
          setTimeout(function() {
            window.setupConnections();
          }, 100);
        </script>
      </body>
    </html>
  `;
};

const generateTraditionalBracket = (rounds) => {
  if (!rounds || Object.keys(rounds).length === 0) {
    return '<div class="bracket-container"><div class="no-matches">No bracket data available</div></div>';
  }

  // Calculate total participants from Round 1
  const round1Matches = rounds['1'] || [];
  const totalParticipants = round1Matches.length * 2; // Each match has 2 participants
  
  // Pre-generate complete bracket structure with all expected matches
  const bracketStructure = generateCompleteBracketStructure(totalParticipants, rounds);
  
  // Use bracketStructure instead of original rounds for complete bracket display
  const allRounds = Object.keys(bracketStructure).sort((a, b) => parseInt(a) - parseInt(b));
  const finalRound = Math.max(...allRounds.map(r => parseInt(r)));

  // Put all Round 1 matches on the left side to avoid pairing issues
  const leftMatches = [...(bracketStructure['1'] || [])];
  const rightMatches = [];

  // Middle rounds (2, 3, 4, etc.) go in the center - use bracketStructure
  const middleRounds = allRounds.filter(round => parseInt(round) > 1);

  // Create arrays for left and right sides with proper round data
  const leftRounds = leftMatches.length > 0 ? [{ round: 1, matches: leftMatches }] : [];
  const rightRounds = rightMatches.length > 0 ? [{ round: 1, matches: rightMatches }] : [];

  // Pre-build ALL connection lines based on tournament structure
  const connections = {};
  
  allRounds.forEach((currentRound, currentIndex) => {
    const currentRoundMatches = bracketStructure[currentRound] || [];
    
    // For each match in current round, create connection to next round
    currentRoundMatches.forEach((currentMatch, matchIndex) => {
      // For elimination tournaments, winners advance to the next round
      // Each pair of matches feeds into one match in the next round
      const nextRound = parseInt(currentRound) + 1;
      if (bracketStructure[nextRound]) {
        const nextRoundMatchIndex = Math.floor(matchIndex / 2);
        const targetMatch = bracketStructure[nextRound][nextRoundMatchIndex];
        
        if (targetMatch) {
          // Pre-render connection regardless of match completion status
          connections[currentMatch.bracket_id] = targetMatch.bracket_id;
          console.log(`Pre-rendered connection: Bracket ${currentMatch.bracket_id} (Round ${currentRound}) -> Bracket ${targetMatch.bracket_id} (Round ${nextRound})`);
        }
      }
    });
  });

  // Determine champion from bracketStructure
  const finalMatch = bracketStructure[finalRound]?.[0];
  const champion = finalMatch?.winner ? 
    (finalMatch.winner === 'user1' ? finalMatch.user1 : finalMatch.user2) : 
    'TBD';

  const renderMatch = (match, isLeftSide = false, isRightSide = false, hasNextRound = true, matchIndex = 0) => {
    const user1Winner = match.winner === 'user1';
    const user2Winner = match.winner === 'user2';
    const isPlaceholder = match.isPlaceholder;
    const hasWinner = match.winner && match.winner !== null;
    
    // Create connection line - always render if target exists (pre-render all lines)
    const targetBracketId = connections[match.bracket_id];
    let connectionLine = '';
    
    if (targetBracketId) {
      const lineClass = isLeftSide ? 'line-horizontal-left' : (isRightSide ? 'line-horizontal-right' : 'line-horizontal');
      connectionLine = `<div class="${lineClass}" data-target-bracket="${targetBracketId}"></div>`;
    }
    
    // Style placeholder matches differently
    const bracketClass = isPlaceholder ? 'match-bracket placeholder' : 'match-bracket';
    
    return `
      <div class="${bracketClass}" data-bracket-id="${match.bracket_id}">
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
          const roundMatches = bracketStructure[roundNumber] || [];
          const isLastRound = parseInt(roundNumber) === parseInt(finalRound);
          const hasNextRound = !isLastRound; // Center rounds have next rounds except the final one
          return `
            <div class="round-column">
              <div class="round-header-bracket">Round ${roundNumber}${isLastRound && roundMatches.length === 1 ? ' - Final' : ''}</div>
              ${roundMatches.length > 0 ? 
                roundMatches.map((match, index) => renderMatch(match, false, false, hasNextRound, index)).join('') : 
                '<div class="match-bracket">No matches scheduled</div>'
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
