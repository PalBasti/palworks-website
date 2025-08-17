// lib/pdf/helpers/PDFLayoutManager.js

/**
 * PDFLayoutManager - Zentrale Layout-Engine für alle PDF-Generatoren
 * Automatisches Y-Management, konsistente Formatierung, modulare Komponenten
 */

export class PDFLayoutManager {
  constructor(pdf, config = {}) {
    this.pdf = pdf;
    
    // Standard-Konfiguration mit Override-Möglichkeit
    this.config = {
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      lineHeight: 6,
      sectionSpacing: 8,
      checkboxSize: 3,
      inputFieldHeight: 8,
      pageWidth: 210,
      pageHeight: 297,
      ...config
    };
    
    this.currentY = this.config.margins.top;
  }

  // Automatische Seitenumbruch-Prüfung
  checkPageBreak(neededSpace = 20) {
    if (this.currentY + neededSpace > this.config.pageHeight - this.config.margins.bottom) {
      this.pdf.addPage();
      this.currentY = this.config.margins.top;
      return true;
    }
    return false;
  }

  // Text mit automatischem Wrapping und Spacing
  addText(text, options = {}) {
    const {
      x = this.config.margins.left,
      fontSize = 11,
      style = 'normal',
      maxWidth = this.config.pageWidth - this.config.margins.left - this.config.margins.right,
      spacing = this.config.lineHeight
    } = options;

    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', style);
    
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    // Seitenumbruch prüfen
    this.checkPageBreak(lines.length * spacing + 5);
    
    this.pdf.text(lines, x, this.currentY);
    this.currentY += lines.length * spacing;
    
    return this.currentY;
  }

  // Section-Header mit konsistentem Spacing
  addSection(title, options = {}) {
    const {
      fontSize = 12,
      style = 'bold',
      spacingBefore = this.config.sectionSpacing,
      spacingAfter = 4
    } = options;

    this.currentY += spacingBefore;
    this.checkPageBreak(15);
    
    this.addText(title, { fontSize, style });
    this.currentY += spacingAfter;
    
    return this.currentY;
  }

  // Checkbox mit Label
  addCheckbox(label, options = {}) {
    const {
      x = this.config.margins.left + 5,
      checked = false,
      spacing = 6
    } = options;

    this.checkPageBreak(10);
    
    // Checkbox zeichnen
    const checkY = this.currentY - 3;
    this.pdf.rect(x, checkY, this.config.checkboxSize, this.config.checkboxSize);
    
    // Häkchen falls checked
    if (checked) {
      this.pdf.text('✓', x + 0.5, this.currentY - 0.5);
    }
    
    // Label
    this.pdf.text(label, x + this.config.checkboxSize + 2, this.currentY);
    this.currentY += spacing;
    
    return this.currentY;
  }

  // Checkbox-Gruppe horizontal
  addCheckboxGroup(options, groupOptions = {}) {
    const {
      startX = this.config.margins.left,
      spacing = 40,
      itemSpacing = 6
    } = groupOptions;

    this.checkPageBreak(10);
    
    let currentX = startX;
    const baseY = this.currentY;
    
    options.forEach((option, index) => {
      const checkY = baseY - 3;
      
      // Checkbox
      this.pdf.rect(currentX, checkY, this.config.checkboxSize, this.config.checkboxSize);
      
      // Häkchen falls checked
      if (option.checked) {
        this.pdf.text('✓', currentX + 0.5, baseY - 0.5);
      }
      
      // Label
      this.pdf.text(option.label, currentX + this.config.checkboxSize + 2, baseY);
      
      currentX += spacing;
    });
    
    this.currentY += itemSpacing;
    return this.currentY;
  }

  // Eingabefeld mit Linie
  addInputField(label, options = {}) {
    const {
      width = 100,
      showLabel = true,
      x = this.config.margins.left,
      spacing = this.config.lineHeight
    } = options;

    this.checkPageBreak(10);
    
    let currentX = x;
    
    // Label links
    if (showLabel && label) {
      this.pdf.text(label, currentX, this.currentY);
      currentX += this.pdf.getTextWidth(label) + 5;
    }
    
    // Eingabelinie
    this.pdf.line(currentX, this.currentY + 1, currentX + width, this.currentY + 1);
    
    this.currentY += spacing;
    return this.currentY;
  }

  // Tabelle mit automatischem Layout
  addTable(headers, rows, options = {}) {
    const {
      startX = this.config.margins.left,
      columnWidths = null,
      headerHeight = 8,
      rowHeight = 8,
      borderStyle = true
    } = options;

    // Auto-calculate column widths if not provided
    const totalWidth = this.config.pageWidth - this.config.margins.left - this.config.margins.right;
    const cols = headers.length;
    const defaultColumnWidth = totalWidth / cols;
    const widths = columnWidths || Array(cols).fill(defaultColumnWidth);

    this.checkPageBreak(headerHeight + (rows.length * rowHeight) + 10);
    
    // Header
    this.pdf.setFont('helvetica', 'bold');
    let currentX = startX;
    
    headers.forEach((header, index) => {
      this.pdf.text(header, currentX, this.currentY);
      currentX += widths[index];
    });
    
    this.currentY += headerHeight;
    
    // Header-Linie
    if (borderStyle) {
      this.pdf.line(startX, this.currentY - 2, startX + totalWidth, this.currentY - 2);
    }
    
    this.currentY += 2;
    
    // Rows
    this.pdf.setFont('helvetica', 'normal');
    
    rows.forEach(row => {
      this.checkPageBreak(rowHeight + 5);
      
      currentX = startX;
      row.forEach((cell, index) => {
        if (typeof cell === 'object' && cell.type === 'input') {
          // Eingabefeld in Tabelle
          this.pdf.line(currentX, this.currentY + 1, currentX + widths[index] - 2, this.currentY + 1);
        } else if (typeof cell === 'object' && cell.type === 'checkbox') {
          // Checkbox in Tabelle
          const checkX = currentX + (widths[index] / 2) - (this.config.checkboxSize / 2);
          const checkY = this.currentY - 3;
          this.pdf.rect(checkX, checkY, this.config.checkboxSize, this.config.checkboxSize);
        } else {
          // Text in Tabelle
          this.pdf.text(cell.toString(), currentX, this.currentY);
        }
        currentX += widths[index];
      });
      
      this.currentY += rowHeight;
    });
    
    return this.currentY;
  }

  // Unterschrifts-Bereich
  addSignatureSection(signers, options = {}) {
    const {
      spacingBefore = 15,
      spacingBetween = 20,
      lineWidth = 80,
      showDate = true
    } = options;

    this.currentY += spacingBefore;
    this.checkPageBreak(60);

    // Datum und Ort
    if (showDate) {
      const dateText = `Ort, Datum: _________________, den ${new Date().toLocaleDateString('de-DE')}`;
      this.addText(dateText);
      this.currentY += spacingBetween;
    }

    // Unterschrifts-Felder
    const availableWidth = this.config.pageWidth - 2 * this.config.margins.left;
    const signerWidth = availableWidth / signers.length;
    
    let currentX = this.config.margins.left;
    
    signers.forEach((signer, index) => {
      // Linie
      this.pdf.line(currentX, this.currentY, currentX + lineWidth, this.currentY);
      
      // Label unter der Linie
      this.pdf.text(signer.label, currentX, this.currentY + 5);
      
      // Name in Klammern (falls vorhanden)
      if (signer.name) {
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.text(`(${signer.name})`, currentX, this.currentY + 10);
        this.pdf.setFont('helvetica', 'normal');
      }
      
      currentX += signerWidth;
    });

    this.currentY += 25;
    return this.currentY;
  }

  // Footer hinzufügen
  addFooter(text, options = {}) {
    const {
      fontSize = 8,
      style = 'italic',
      position = 'left'
    } = options;

    const footerY = this.config.pageHeight - 10;
    const footerX = position === 'center' 
      ? this.config.pageWidth / 2 
      : this.config.margins.left;

    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', style);
    
    if (position === 'center') {
      this.pdf.text(text, footerX, footerY, { align: 'center' });
    } else {
      this.pdf.text(text, footerX, footerY);
    }
  }

  // Aktuelle Y-Position abrufen/setzen
  getCurrentY() {
    return this.currentY;
  }

  setCurrentY(y) {
    this.currentY = y;
  }

  // Spacing hinzufügen
  addSpacing(amount) {
    this.currentY += amount;
    return this.currentY;
  }

  // Linie hinzufügen
  addLine(options = {}) {
    const {
      startX = this.config.margins.left,
      endX = this.config.pageWidth - this.config.margins.right,
      spacing = 6
    } = options;

    this.checkPageBreak(5);
    this.pdf.line(startX, this.currentY, endX, this.currentY);
    this.currentY += spacing;
    
    return this.currentY;
  }

  // Seitenwechsel erzwingen
  addPageBreak() {
    this.pdf.addPage();
    this.currentY = this.config.margins.top;
    return this.currentY;
  }
}
