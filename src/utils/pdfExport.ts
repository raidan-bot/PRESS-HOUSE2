import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  category?: string;
  content: string; // HTML or text
  imageUrl?: string;
  isRtl?: boolean;
  filename?: string;
}

export async function exportContentToPdf(options: PdfExportOptions): Promise<void> {
  const {
    title,
    subtitle,
    author = 'بيت الصحافة - اليمن',
    date = new Date().toLocaleDateString('ar-YE'),
    category,
    content,
    imageUrl,
    isRtl = true,
    filename = 'presshouse-document.pdf',
  } = options;

  // Create temporary offscreen container with pristine styling
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.direction = isRtl ? 'rtl' : 'ltr';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0;">بيت الصحافة - اليمن</h2>
        <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Press House - Yemen | مؤسسة إعلامية غير حكومية مستقلة</p>
      </div>
      <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 11px; color: #64748b;">
        <div>${date}</div>
        ${category ? `<span style="background-color: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-weight: 600; display: inline-block; margin-top: 4px;">${category}</span>` : ''}
      </div>
    </div>

    ${subtitle ? `<div style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; tracking: 1px; margin-bottom: 8px;">${subtitle}</div>` : ''}

    <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.4; margin: 0 0 16px 0;">
      ${title}
    </h1>

    <div style="display: flex; gap: 16px; font-size: 12px; color: #475569; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
      <span><strong>${isRtl ? 'الكاتب / المصدر:' : 'Author/Source:'}</strong> ${author}</span>
    </div>

    ${imageUrl ? `
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${imageUrl}" crossorigin="anonymous" style="max-width: 100%; max-height: 350px; border-radius: 12px; object-fit: cover;" alt="Header" />
      </div>
    ` : ''}

    <div style="font-size: 14px; line-height: 1.8; color: #334155; white-space: pre-wrap; word-break: break-word;">
      ${content}
    </div>

    <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
      <span>© ${new Date().getFullYear()} بيت الصحافة - اليمن. جميع الحقوق محفوظة.</span>
      <span>www.ph-ye.org</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
