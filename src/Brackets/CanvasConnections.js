// Canvas-based connection line drawing for tournament brackets
export const createCanvasConnectionScript = () => {
  return `
    // Draw connecting lines using Canvas - back to getBoundingClientRect with print compensation
    window.setupConnections = function() {
      setTimeout(() => {
        console.log('Setting up canvas connections...');
        
        const wrapper = document.querySelector('.bracket-container');
        if (!wrapper) {
          console.log('No bracket container found');
          return;
        }
        
        // Remove any existing canvas
        const existingCanvas = wrapper.querySelector('canvas');
        if (existingCanvas) {
          existingCanvas.remove();
        }
        
        console.log('Found bracket container, creating canvas...');
        
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        
        // Get wrapper size
        canvas.width = wrapper.offsetWidth || 1400;
        canvas.height = wrapper.offsetHeight || 800;
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        console.log('Canvas size: ' + canvas.width + 'x' + canvas.height);
        
        // Detect print context
        const isPrintContext = window.matchMedia && window.matchMedia('print').matches;
        console.log('Is print context: ' + isPrintContext);
        
        // Find all connection elements
        const connectionElements = document.querySelectorAll('[data-target-bracket]');
        console.log('Found ' + connectionElements.length + ' connection elements');
        
        let connectionsDrawn = 0;
        
        connectionElements.forEach(line => {
          const sourceMatch = line.closest('.match-bracket');
          const targetBracketId = line.dataset.targetBracket;
          
          if (!sourceMatch || !targetBracketId) return;
          
          const targetMatch = document.querySelector('[data-bracket-id="' + targetBracketId + '"]');
          if (!targetMatch) return;
          
          // Get positions relative to wrapper
          const sourceRect = sourceMatch.getBoundingClientRect();
          const targetRect = targetMatch.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          
          const isLeftSide = line.classList.contains('line-horizontal-left');
          
          let startX, startY, endX, endY;
          
          if (isLeftSide) {
            // Left side: from right edge of source to left edge of target
            startX = sourceRect.right - wrapperRect.left;
            startY = sourceRect.top + sourceRect.height / 2 - wrapperRect.top;
            endX = targetRect.left - wrapperRect.left;
            endY = targetRect.top + targetRect.height / 2 - wrapperRect.top;
          } else {
            // Right side: from left edge of source to right edge of target  
            startX = sourceRect.left - wrapperRect.left;
            startY = sourceRect.top + sourceRect.height / 2 - wrapperRect.top;
            endX = targetRect.right - wrapperRect.left;
            endY = targetRect.top + targetRect.height / 2 - wrapperRect.top;
          }
          
          // Small print compensation - move lines slightly left in print context
          if (isPrintContext) {
            startX -= 10;
            endX -= 10;
          }
          
          console.log('Drawing connection from ' + sourceMatch.dataset.bracketId + ' to ' + targetBracketId + ': (' + startX.toFixed(1) + ',' + startY.toFixed(1) + ') -> (' + endX.toFixed(1) + ',' + endY.toFixed(1) + ')' + (isPrintContext ? ' [print adjusted]' : ''));
          
          // Draw curved line
          const cpX = (startX + endX) / 2;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(cpX, startY, cpX, endY, endX, endY);
          ctx.stroke();
          
          connectionsDrawn++;
        });
        
        console.log('Canvas connections setup complete. Drew ' + connectionsDrawn + ' connections.');
      }, 300);
    };
  `;
};
