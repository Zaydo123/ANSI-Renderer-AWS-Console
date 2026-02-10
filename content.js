/**
 * Content Script for ANSI Renderer
 * Injects ANSI rendering into AWS CloudWatch Logs and ECS logs
 */

(function() {
  'use strict';

  const CONFIG = {
    processedAttr: 'data-ansi-processed',
    debounceDelay: 100,
    maxTextLength: 1000000
  };

  let debounceTimer = null;
  let pendingMutations = [];

  function isRelevantPage() {
    const url = window.location.href;
    const pathname = window.location.pathname;

    if (url.includes('cloudwatch') &&
        (pathname.includes('/logs') || url.includes('logsV2'))) {
      return true;
    }

    if (url.includes('ecs') &&
        (pathname.includes('/logs') || pathname.includes('/tasks') || url.includes('logConfiguration'))) {
      return true;
    }

    return false;
  }

  function hasAnsiSequences(text) {
    if (!text) return false;
    if (text.includes('\x1b[') || text.includes('\u001b[')) return true;
    return /\[\d+(;\d+)*m/.test(text);
  }

  function processLogCell(cell) {
    if (!cell || cell.hasAttribute(CONFIG.processedAttr)) return false;

    const text = cell.textContent;
    if (!text || !hasAnsiSequences(text)) return false;

    try {
      const html = window.AnsiParser.parse(text);
      cell.innerHTML = html;
      cell.setAttribute(CONFIG.processedAttr, 'true');
      return true;
    } catch (error) {
      console.error('[ANSI Renderer] Error:', error);
      return false;
    }
  }

  function processAllLogCells() {
    const selectors = [
      'td.expanded-event',
      'td[data-testid="expanded-event"]',
      '.cwdb-log-event-message',
      '.log-event__message',
      'code',
      'pre'
    ];

    let processed = 0;
    selectors.forEach(selector => {
      const cells = document.querySelectorAll(selector);
      if (cells.length > 0 && processed === 0) {
        console.log('[ANSI] Found', cells.length, 'cells with selector', selector);
      }
      cells.forEach(cell => {
        if (processLogCell(cell)) processed++;
      });
    });

    return processed;
  }

  function handleMutations(mutations) {
    pendingMutations.push(...mutations);

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      requestAnimationFrame(processAllLogCells);
      debounceTimer = null;
    }, CONFIG.debounceDelay);
  }

  function initialize() {
    if (!window.AnsiParser) {
      setTimeout(initialize, 100);
      return;
    }

    const relevant = isRelevantPage();
    console.log('[ANSI] Init - URL:', location.href, 'Relevant:', relevant);
    if (!relevant) return;

    processAllLogCells();

    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (isRelevantPage()) {
          setTimeout(processAllLogCells, 500);
        }
      }
    }).observe(document.querySelector('head'), {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  setTimeout(initialize, 1000);
  setInterval(processAllLogCells, 2000);
})();
