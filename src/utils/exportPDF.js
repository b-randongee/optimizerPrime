import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Prepares the element for PDF capture by:
 * - Uncollapsing all locked/collapsed spaces
 * - Removing sticky positioning from sidebar
 * - Disabling framer-motion animations
 * Returns data needed to restore state later
 */
function prepareElementForCapture(element) {
  const savedStyles = new Map();
  const lockedButtons = [];

  // Find all lock buttons that are currently locked using data attribute
  // Fallback to aria-label for backwards compatibility
  const lockButtons = element.querySelectorAll('button[data-lock-button="locked"], button[aria-label*="Unlock"]');

  if (lockButtons.length === 0) {
    console.warn('PDF Export: No locked buttons found. If rooms should be unlocked for export, check lock button selectors.');
  }

  lockButtons.forEach(button => {
    // Avoid clicking the same button twice if it matches both selectors
    if (!lockedButtons.includes(button)) {
      lockedButtons.push(button);
      // Click to unlock/expand
      button.click();
    }
  });

  // Find and fix sticky sidebar positioning
  const stickyElements = element.querySelectorAll('[class*="sticky"]');
  stickyElements.forEach(el => {
    savedStyles.set(el, {
      position: el.style.position,
      top: el.style.top,
    });
    el.style.position = 'relative';
    el.style.top = 'auto';
  });

  // Disable framer-motion animations
  const animatedElements = element.querySelectorAll('[class*="motion"]');
  animatedElements.forEach(el => {
    savedStyles.set(el, {
      animation: el.style.animation,
      transition: el.style.transition,
    });
    el.style.animation = 'none';
    el.style.transition = 'none';
  });

  return { savedStyles, lockedButtons };
}

/**
 * Restores the element to its original state after capture
 */
function restoreElementAfterCapture(savedData) {
  const { savedStyles, lockedButtons } = savedData;

  // Restore element styles
  savedStyles.forEach((styles, el) => {
    Object.keys(styles).forEach(prop => {
      el.style[prop] = styles[prop] || '';
    });
  });

  // Re-lock the buttons that were originally locked
  lockedButtons.forEach(button => {
    button.click();
  });
}

/**
 * Captures the element to a canvas with high quality settings
 */
async function captureToCanvas(element) {
  const canvas = await html2canvas(element, {
    scale: 2, // 2x resolution for quality
    useCORS: true, // Handle cross-origin images
    logging: false, // Disable console logs
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  return canvas;
}

/**
 * Calculates page breaks to avoid splitting room cards
 * Returns array of y-positions where new pages should start
 */
function calculatePageBreaks(element, pageHeightPx) {
  const cards = element.querySelectorAll(
    '[class*="border-emerald-500"], [class*="border-blue-500"], [class*="border-orange-500"]'
  );

  const pageBreaks = [];
  let currentPageBottom = pageHeightPx;
  const containerTop = element.getBoundingClientRect().top;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardTop = rect.top - containerTop;
    const cardBottom = cardTop + rect.height;

    // If card would be split across page boundary
    if (cardTop < currentPageBottom && cardBottom > currentPageBottom) {
      // Insert page break before card
      pageBreaks.push(cardTop);
      currentPageBottom = cardTop + pageHeightPx;
    }
  });

  return pageBreaks;
}

/**
 * Adds canvas to PDF with intelligent page breaks
 */
function addCanvasToPDF(pdf, canvas, pageBreaks, pdfWidth, pdfHeight) {
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  if (pageBreaks.length === 0 || imgHeight <= pdfHeight) {
    // Single page - no breaks needed
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    return;
  }

  // Multi-page with calculated breaks
  const ctx = canvas.getContext('2d');
  const scale = canvas.width / imgWidth;

  let previousBreak = 0;
  pageBreaks.forEach((breakY, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    const sliceHeight = (breakY - previousBreak) * scale;
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;

    const sliceCtx = sliceCanvas.getContext('2d');
    sliceCtx.drawImage(
      canvas,
      0,
      previousBreak * scale,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
    const sliceImgHeight = sliceHeight / scale;
    pdf.addImage(sliceImgData, 'JPEG', 0, 0, imgWidth, sliceImgHeight);

    previousBreak = breakY;
  });

  // Add remaining content after last break
  if (previousBreak < imgHeight) {
    pdf.addPage();
    const remainingHeight = (canvas.height - previousBreak * scale);
    const remainingCanvas = document.createElement('canvas');
    remainingCanvas.width = canvas.width;
    remainingCanvas.height = remainingHeight;

    const remainingCtx = remainingCanvas.getContext('2d');
    remainingCtx.drawImage(
      canvas,
      0,
      previousBreak * scale,
      canvas.width,
      remainingHeight,
      0,
      0,
      canvas.width,
      remainingHeight
    );

    const remainingImgData = remainingCanvas.toDataURL('image/jpeg', 0.95);
    const remainingImgHeight = remainingHeight / scale;
    pdf.addImage(remainingImgData, 'JPEG', 0, 0, imgWidth, remainingImgHeight);
  }
}

/**
 * Main export function - exports the dashboard to PDF
 * @param {string} elementId - ID of the element to export
 * @param {string} filename - Name of the PDF file to download
 */
export async function exportDashboardToPDF(elementId, filename = 'optimizer-prime-dashboard.pdf') {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // Check if dashboard is very large
  const elementHeight = element.scrollHeight;
  if (elementHeight > 25000) {
    const proceed = window.confirm(
      'Dashboard is very large. Export may take 30-60 seconds. Continue?'
    );
    if (!proceed) {
      return;
    }
  }

  // Give React time to render any loading states
  await new Promise(resolve => setTimeout(resolve, 100));

  let savedData = null;

  try {
    // Step 1: Prepare element for capture (unlock all spaces, fix styles)
    savedData = prepareElementForCapture(element);

    // Step 2: Wait for React to re-render after unlocking spaces
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Capture to canvas
    const canvas = await captureToCanvas(element);

    // Step 3: Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Step 4: Calculate page breaks
    const pageBreaks = calculatePageBreaks(element, pdfHeight * 3.78); // Convert mm to px (approx)

    // Step 5: Add canvas to PDF with page breaks
    addCanvasToPDF(pdf, canvas, pageBreaks, pdfWidth, pdfHeight);

    // Step 6: Download PDF
    pdf.save(filename);

  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  } finally {
    // Step 7: Always restore element to original state (re-lock spaces, restore styles)
    if (savedData) {
      restoreElementAfterCapture(savedData);
    }
  }
}
