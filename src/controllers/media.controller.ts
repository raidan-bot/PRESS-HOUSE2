import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { MediaRepository } from '../repositories/media.repository';

// Helper to sanitize paths and prevent Path Traversal
function getSafeFilePath(relativeUrl: string): string | null {
  if (!relativeUrl) return null;
  // Remove leading slashes and decode URI components
  const cleanUrl = decodeURIComponent(relativeUrl).replace(/^\/+/, '');
  const resolvedPath = path.resolve(process.cwd(), cleanUrl);
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  
  if (resolvedPath.startsWith(uploadsDir)) {
    return resolvedPath;
  }
  return null;
}

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
  
  // Permissive default for other formats, but validate common types strictly
  return true;
}

export class MediaController {
  static async getAll(req: Request, res: Response) {
    try {
      const media = await MediaRepository.findAll();
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching media' });
    }
  }

  static async upload(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Phase 2.4: Verify magic bytes
      if (!isValidFileSignature(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ message: 'File signature verification failed. The content does not match the file extension.' });
      }
      
      let folder = 'others';
      const ext = path.extname(req.file.originalname).toLowerCase();
      
      // Whitelist of allowed extensions
      const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.mp3', '.mp4', '.wav', '.doc', '.docx', '.xls', '.xlsx'];
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({ message: 'Disallowed file extension.' });
      }

      if (req.file.mimetype.startsWith('image/')) folder = 'images';
      else if (req.file.mimetype.startsWith('video/')) folder = 'videos';
      else if (req.file.mimetype.startsWith('audio/')) folder = 'audio';
      else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('document')) folder = 'documents';
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + ext;
      
      const uploadDir = path.join(process.cwd(), 'uploads');
      const targetDir = path.join(uploadDir, folder);
      
      if (!fs.existsSync(targetDir)) {
         fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      const url = `/uploads/${folder}/${filename}`;
      
      const result = await MediaRepository.create({
        name: req.file.originalname,
        url,
        type: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user?.uid || 'admin'
      });

      res.json({ 
        id: (result as any).insertId, 
        name: req.file.originalname, 
        url, 
        type: req.file.mimetype, 
        size: req.file.size 
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) return res.sendStatus(401);

      const media = await MediaRepository.findById(req.params.id);
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }

      // Ownership and Role Check
      const isAuthorized = user.role === 'admin' || user.role === 'root' || media.uploadedBy === user.uid;
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized to delete this media' });
      }

      // Secure path to avoid directory traversal
      const filePath = getSafeFilePath(media.url);
      if (filePath && fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
      } else if (filePath === null) {
         console.warn(`[Path Security] Prevented delete execution on suspicious path: ${media.url}`);
      }

      await MediaRepository.delete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete Error:', error);
      res.status(500).json({ message: 'Error deleting media' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) return res.sendStatus(401);

      const media = await MediaRepository.findById(req.params.id);
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }

      // Ownership and Role Check
      const isAuthorized = user.role === 'admin' || user.role === 'root' || media.uploadedBy === user.uid;
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized to update this media' });
      }

      const { fileData, name, album_id } = req.body;
      const updateData: any = {};
      
      // Strict Whitelisting (Anti-Mass Assignment)
      if (name !== undefined) updateData.name = name;
      if (album_id !== undefined) updateData.album_id = album_id;

      if (fileData && fileData.startsWith('data:image/')) {
        const filePath = getSafeFilePath(media.url);
        if (filePath) {
          const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const buffer = Buffer.from(matches[2], 'base64');
            fs.writeFileSync(filePath, buffer);
            updateData.size = buffer.length;
          }
        } else {
          return res.status(400).json({ message: 'Invalid media URL path' });
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await MediaRepository.update(req.params.id, updateData);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Update Error:', error);
      res.status(500).json({ message: 'Error updating media' });
    }
  }
}
