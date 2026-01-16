import { useEffect } from 'react';
import { exportDashboardToPDF } from '../utils/exportPDF';

/**
 * Custom hook for keyboard navigation shortcuts
 * @param {string} selectedItemId - Currently selected room/demolition ID
 * @param {Function} setSelectedItemId - Function to update selected ID
 * @param {Array} rooms - Array of all rooms
 */
export function useKeyboardShortcuts(selectedItemId, setSelectedItemId, rooms) {
  useEffect(() => {
    function handleKeyDown(event) {
      // Don't interfere with typing in inputs
      const target = event.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Build sorted list: demolition + interior rooms + exterior rooms
      const allItems = [
        { id: 'demolition', isExterior: false },
        ...rooms.filter(r => !r.isExterior),
        ...rooms.filter(r => r.isExterior)
      ];

      const currentIndex = allItems.findIndex(item => item.id === selectedItemId);

      switch (event.key) {
        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          if (currentIndex > 0) {
            setSelectedItemId(allItems[currentIndex - 1].id);
          }
          break;

        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          if (currentIndex < allItems.length - 1) {
            setSelectedItemId(allItems[currentIndex + 1].id);
          }
          break;

        case 'Escape':
          event.preventDefault();
          // Return to demolition
          setSelectedItemId('demolition');
          break;

        case 's':
          // Cmd/Ctrl + S to export PDF
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            exportDashboardToPDF('dashboard-root', 'optimizer-prime-dashboard.pdf')
              .catch(err => console.error('PDF export failed:', err));
          }
          break;

        case '?':
          // Show keyboard shortcuts help (could be implemented later)
          event.preventDefault();
          console.log('Keyboard Shortcuts:\n' +
            '↑/k - Previous room\n' +
            '↓/j - Next room\n' +
            'Esc - Return to demolition\n' +
            'Cmd/Ctrl + S - Export to PDF'
          );
          break;

        default:
          break;
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId, setSelectedItemId, rooms]);
}
