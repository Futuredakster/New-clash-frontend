// CSS styles for tournament bracket printing
export const getBracketPrintStyles = () => {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      @page {
        size: landscape;
        margin: 0.5in;
      }

      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
        overflow-x: auto;
      }

      .bracket-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        min-height: 100vh;
        gap: 100px;
        padding: 20px;
        position: relative;
      }

      .bracket-left, .bracket-right {
        flex: 0 0 auto;
        width: 200px;
      }

      .bracket-center {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 20px;
      }

      .bracket-side {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .round-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 200px;
      }

      .round-header-bracket {
        font-weight: bold;
        text-align: center;
        padding: 10px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 10px;
      }

      .match-bracket {
        border: 2px solid #2c3e50;
        border-radius: 6px;
        padding: 14px;
        background-color: #fff;
        box-shadow: 0 4px 8px rgba(44,62,80,0.15);
        margin-bottom: 20px;
        position: relative;
        width: 100%;
        min-height: 85px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10; /* Ensure brackets appear above canvas lines */
      }

      .match-bracket.placeholder {
        border: 2px dashed #95a5a6;
        background-color: #ecf0f1;
        opacity: 0.7;
      }

      .match-bracket.placeholder .match-participant {
        background-color: #ecf0f1;
        color: #7f8c8d;
        font-style: italic;
      }
      
      .match-bracket:hover {
        box-shadow: 0 6px 12px rgba(44,62,80,0.25);
        transform: translateY(-1px);
      }

      .match-participant {
        padding: 6px 8px;
        border: 1px solid #ddd;
        margin: 2px 0;
        border-radius: 4px;
        background-color: #f9f9f9;
        font-size: 11px;
        font-weight: 500;
      }

      .winner {
        background-color: #d4edda !important;
        border-color: #28a745 !important;
        font-weight: bold;
      }

      .champion-area {
        text-align: center;
        margin-top: 20px;
        padding: 20px;
        background-color: #fff3cd;
        border: 3px solid #ffc107;
        border-radius: 10px;
      }

      .champion-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #856404;
      }

      .champion-name {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }

      canvas {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        pointer-events: none !important;
        z-index: 1 !important;
      }

      @media print {
        body {
          overflow: visible;
        }
        
        .bracket-container {
          min-height: auto;
        }
      }

      /* Simple Connection Lines - Hidden, using canvas instead */
      .line-horizontal,
      .line-horizontal-left,
      .line-horizontal-right {
        display: none;
      }

      /* Connection arrows - Hidden, using canvas instead */
      .arrow-right,
      .arrow-left {
        display: none;
      }
    </style>
  `;
};
