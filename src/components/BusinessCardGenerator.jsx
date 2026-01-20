import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

export default function BusinessCardGenerator({ profile, role }) {
  const generateBusinessCard = () => {
    // Standard business card size: 90mm x 55mm (3.5" x 2")
    // PDF uses points: 1mm = 2.834645 points
    const cardWidth = 90 * 2.834645; // 255.12 points
    const cardHeight = 55 * 2.834645; // 155.91 points
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [cardWidth, cardHeight]
    });

    // Background gradient (simulated with rectangles)
    pdf.setFillColor(139, 92, 246); // violet-600
    pdf.rect(0, 0, cardWidth, cardHeight, 'F');
    
    pdf.setFillColor(99, 102, 241); // indigo-600
    pdf.setGState(new pdf.GState({ opacity: 0.3 }));
    pdf.circle(cardWidth * 0.8, cardHeight * 0.3, 60, 'F');
    
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // Company logo area (top left)
    pdf.setFillColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BeyondWalls', 20, 30);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('A Linkzone Global FZ-LLC Company', 20, 42);

    // Divider line
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, cardWidth - 20, 55);

    // Name and title (center-left)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(profile.name, 20, 75);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(role, 20, 88);

    // Contact information (bottom)
    pdf.setFontSize(8);
    const contactY = cardHeight - 40;
    
    pdf.text('✉', 20, contactY);
    pdf.text(profile.email, 32, contactY);
    
    pdf.text('☎', 20, contactY + 12);
    pdf.text(profile.phone || '+971 55 614 0067', 32, contactY + 12);
    
    pdf.text('🌐', 20, contactY + 24);
    pdf.text('www.beyondwalls.ae', 32, contactY + 24);

    // Print specifications on second page
    pdf.addPage([cardWidth, cardHeight]);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, cardWidth, cardHeight, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRINT SPECIFICATIONS', 20, 30);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Final Size: 90mm x 55mm (Rounded Corners)', 20, 50);
    pdf.text('Before Cutting: 95mm x 60mm (includes bleed)', 20, 65);
    pdf.text('Paper Type: Art Paper 400gsm', 20, 80);
    pdf.text('Finish: Glossy Lamination', 20, 95);
    pdf.text('Safe Zone: 5mm from each edge', 20, 110);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Important: Keep all critical information within the safe zone.', 20, 130);
    pdf.text('Bleed zone elements may be trimmed during cutting.', 20, 142);

    // Save the PDF
    pdf.save(`${profile.name.replace(/\s+/g, '_')}_BusinessCard.pdf`);
  };

  return (
    <Button
      onClick={generateBusinessCard}
      className="bg-white text-violet-600 hover:bg-slate-100 border border-violet-200 shadow-lg"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Business Card
    </Button>
  );
}