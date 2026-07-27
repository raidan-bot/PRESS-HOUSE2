import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ObservatoryRepository } from '../repositories/observatory.repository';
import { AIService } from '../services/ai/ai.service';

// Check magic bytes / signatures of files to prevent MIME sniffing/spoofing attacks
function isValidFileSignature(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  
  const hex = buffer.slice(0, 4).toString('hex').toUpperCase();
  
  if (mimetype.includes('image/png')) {
    return hex === '89504E47';
  }
  if (mimetype.includes('image/jpeg')) {
    return hex.startsWith('FFD8FF') || hex.startsWith('FFD8');
  }
  if (mimetype.includes('image/gif')) {
    return hex.startsWith('47494638');
  }
  if (mimetype.includes('application/pdf')) {
    return hex === '25504446'; // %PDF
  }
  if (mimetype.includes('image/webp')) {
    return hex === '52494646'; // RIFF
  }
  if (mimetype.includes('audio/mpeg') || mimetype.includes('audio/mp3')) {
    return hex.startsWith('494433') || hex.startsWith('FFFB') || hex.startsWith('FFF3') || hex.startsWith('FFF2');
  }
  if (mimetype.includes('video/mp4')) {
    if (buffer.length < 8) return false;
    const ftyp = buffer.slice(4, 8).toString('utf8');
    return ftyp === 'ftyp';
  }
  
  return true;
}

export class ObservatoryController {
  static async getAllViolations(req: Request, res: Response) {
    try {
      const violations = await ObservatoryRepository.findAllViolations();
      res.json(violations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching violations' });
    }
  }

  static async submitViolation(req: any, res: Response) {
    try {
      const id = req.body.id || Date.now().toString();
      const data = { ...req.body, id };

      // Validate required fields
      if (!data.description || !data.governorate) {
        return res.status(400).json({ message: 'حقل الوصف والمحافظة مطلوبان لتوثيق البلاغ.' });
      }

      // Handle file if present
      if (req.file) {
        // Verify magic bytes
        if (!isValidFileSignature(req.file.buffer, req.file.mimetype)) {
          return res.status(400).json({ message: 'فشل التحقق من صحة الملف المرفق. لم يتطابق المحتوى الفعلي مع الامتداد.' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        // Whitelist of allowed extensions for evidence
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.mp4', '.mp3', '.wav', '.doc', '.docx'];
        if (!allowedExtensions.includes(ext)) {
          return res.status(400).json({ message: 'امتداد الملف المرفق غير مسموح به كدليل إثبات.' });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + ext;
        
        const folder = req.file.mimetype.startsWith('image/') ? 'images' : 'documents';
        const targetDir = path.join(process.cwd(), 'uploads', folder);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        const relativeUrl = `/uploads/${folder}/${filename}`;
        
        let evidenceLinks = [];
        if (data.evidenceLinks) {
          try {
            evidenceLinks = typeof data.evidenceLinks === 'string' ? JSON.parse(data.evidenceLinks) : data.evidenceLinks;
          } catch (e) {
            evidenceLinks = [data.evidenceLinks];
          }
        }
        evidenceLinks.push(relativeUrl);
        data.evidenceLinks = JSON.stringify(evidenceLinks);
      }

      await ObservatoryRepository.createViolation(data);
      res.json({ id, success: true });
    } catch (error: any) {
      console.error('Submit Violation Error:', error);
      res.status(500).json({ message: 'Error creating violation: ' + error.message });
    }
  }

  static async getCaseDraft(req: Request, res: Response) {
    try {
      const { originalText, victimName } = req.body;
      const prompt = `Draft a formal case file for victim: ${victimName}. Text: ${originalText}`;
      const responseText = await AIService.callAI(prompt, 'You are a Journalist Safety Intelligence Specialist.');
      res.json({ draft: responseText });
    } catch (error: any) {
      res.status(500).json({ message: 'Error generating draft' });
    }
  }
}
