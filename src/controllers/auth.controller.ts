import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import { UserRepository } from '../repositories/user.repository';
import { config } from '../config/env';
import { MailService } from '../services/mail/mail.service';

export class AuthController {
  // 1. Classic Login
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { uid: user.uid, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password_hash, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // 2. Classic Register
  static async register(req: Request, res: Response) {
    const { 
      name, email, password, age, gender, workplace, 
      phone, whatsapp, bio, specialization, work_samples, social_pages 
    } = req.body;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Required fields missing' });
      }

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل في النظام' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const uid = crypto.randomUUID();

      // Create base user record
      await UserRepository.create({
        uid,
        email,
        displayName: name,
        role: 'journalist', // default user role is journalist
        password_hash
      });

      // Update extra profile info
      await UserRepository.update(uid, {
        age: age ? parseInt(age) : null,
        gender: gender || null,
        workplace: workplace || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        bio: bio || null,
        specialization: specialization || null,
        work_samples: work_samples ? JSON.stringify(work_samples) : null,
        social_pages: social_pages ? JSON.stringify(social_pages) : null
      });

      const user = await UserRepository.findByUid(uid);
      const token = jwt.sign(
        { uid, role: 'journalist' },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      if (user) {
        const { password_hash: ph, ...userWithoutPassword } = user;
        res.status(201).json({ token, user: userWithoutPassword });
      } else {
        res.status(500).json({ message: 'Failed to create user' });
      }
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // 3. Get User Profile
  static async getProfile(req: any, res: Response) {
    try {
      const user = await UserRepository.findByUid(req.user.uid);
      if (!user) return res.sendStatus(404);
      const { password_hash, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // 4. Update Profile
  static async updateProfile(req: any, res: Response) {
    const { 
      displayName, age, gender, workplace, 
      work_samples, phone, whatsapp, social_pages, bio, specialization 
    } = req.body;

    try {
      await UserRepository.update(req.user.uid, {
        displayName, 
        age: age || null, 
        gender: gender || null, 
        workplace: workplace || null,
        work_samples: work_samples ? (typeof work_samples === 'string' ? work_samples : JSON.stringify(work_samples)) : null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        social_pages: social_pages ? (typeof social_pages === 'string' ? social_pages : JSON.stringify(social_pages)) : null,
        bio: bio || null,
        specialization: specialization || null
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // 5. Forgot Password
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    try {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        // Return 200 even if user doesn't exist, to prevent email enumeration
        return res.json({ message: 'إذا كان البريد مسجلاً لدينا، فستتلقى رابطاً لاستعادة كلمة المرور.' });
      }

      // Generate a temporary 1-hour reset token containing email
      const resetToken = jwt.sign(
        { email: user.email, type: 'reset' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      const appUrl = config.appUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

      // Send the mail using MailService
      const emailSubject = 'طلب استعادة كلمة المرور - بيت الصحافة';
      const emailHtml = `
        <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px;">
          <h2>مرحباً ${user.displayName || 'عضو بيت الصحافة'}</h2>
          <p>لقد تلقينا طلباً لاستعادة كلمة المرور الخاصة بحسابك في منصة بيت الصحافة (PressHouse).</p>
          <p>يرجى الضغط على الرابط أدناه لإدخال كلمة مرور جديدة. هذا الرابط صالح لمدة ساعة واحدة فقط:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">استعادة كلمة المرور</a>
          </div>
          <p>إذا لم تكن قد طلبت استعادة كلمة المرور، فيرجى تجاهل هذا البريد الإلكتروني.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 11px; color: #777;">بيت الصحافة - اليمن</p>
        </div>
      `;

      await MailService.sendMail(user.email, emailSubject, emailHtml);
      res.json({ message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب' });
    }
  }

  // 6. Reset Password
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    try {
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      let payload: any;
      try {
        payload = jwt.verify(token, config.jwtSecret);
      } catch (err) {
        return res.status(400).json({ message: 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية' });
      }

      if (payload.type !== 'reset') {
        return res.status(400).json({ message: 'Invalid token type' });
      }

      const user = await UserRepository.findByEmail(payload.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      await UserRepository.update(user.uid, { password_hash });

      res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' });
    } catch (error) {
      console.error('Reset Password Error:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
    }
  }

  // 7. Google Auth URL Generator
  static async googleUrl(req: Request, res: Response) {
    try {
      const googleClientId = config.google.clientId || process.env.GOOGLE_CLIENT_ID;
      const appUrl = config.appUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const googleRedirectUri = `${appUrl}/api/auth/google/callback`;

      if (!googleClientId) {
        return res.status(500).json({ message: 'Google Client ID is not configured' });
      }

      const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: googleRedirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account'
      });

      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      res.json({ url });
    } catch (error) {
      console.error('Google URL error:', error);
      res.status(500).json({ message: 'Error generating Google login URL' });
    }
  }

  // 8. Google Auth Callback Handler (Verifies and logins/registers)
  static async googleCallback(req: Request, res: Response) {
    const { code } = req.query;
    try {
      if (!code) {
        return res.status(400).send('OAuth authorization code is missing.');
      }

      const googleClientId = config.google.clientId || process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = config.google.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
      const appUrl = config.appUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const googleRedirectUri = `${appUrl}/api/auth/google/callback`;

      if (!googleClientId || !googleClientSecret) {
        return res.status(500).send('Google API credentials are not configured on the server.');
      }

      // 1. Exchange authorization code for token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token } = tokenResponse.data;

      // 2. Fetch verified user profile directly from Google
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const googleUser = userResponse.data; // { sub, email, name, picture }

      if (!googleUser || !googleUser.email) {
        return res.status(400).send('Failed to fetch user email from Google.');
      }

      // 3. Find or register user in DB
      let dbUser = await UserRepository.findByGoogleId(googleUser.sub);
      if (!dbUser) {
        dbUser = await UserRepository.findByEmail(googleUser.email);
        if (dbUser) {
          // Link Google ID to existing classic account
          await UserRepository.update(dbUser.uid, { googleId: googleUser.sub });
          dbUser.googleId = googleUser.sub;
        } else {
          // Register a new user
          const uid = crypto.randomUUID();
          await UserRepository.create({
            uid,
            email: googleUser.email,
            displayName: googleUser.name || googleUser.email.split('@')[0],
            photoURL: googleUser.picture || '',
            role: 'journalist',
            googleId: googleUser.sub
          });
          dbUser = await UserRepository.findByUid(uid);
        }
      }

      if (!dbUser) {
        return res.status(500).send('Database record creation failed.');
      }

      // 4. Generate system access JWT
      const jwtToken = jwt.sign(
        { uid: dbUser.uid, role: dbUser.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password_hash, ...userProfile } = dbUser;

      // 5. Send postMessage back to parent React app window and close popup
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>بيت الصحافة - تسجيل الدخول</h2>
            <p>تم التحقق بنجاح. يرجى الانتظار...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: ${JSON.stringify(jwtToken)},
                  user: ${JSON.stringify(userProfile)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Google OAuth Callback Error:', error.response?.data || error);
      res.status(500).send('Authentication failed during Google OAuth process.');
    }
  }

  // 9. LinkedIn Auth URL Generator
  static async linkedinUrl(req: Request, res: Response) {
    try {
      const linkedinClientId = config.linkedin.clientId || process.env.LINKEDIN_CLIENT_ID;
      const appUrl = config.appUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const linkedinRedirectUri = `${appUrl}/api/auth/linkedin/callback`;

      if (!linkedinClientId) {
        return res.status(500).json({ message: 'LinkedIn Client ID is not configured' });
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: linkedinClientId,
        redirect_uri: linkedinRedirectUri,
        scope: 'openid profile email', 
      });

      const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      res.json({ url });
    } catch (error) {
      console.error('LinkedIn URL error:', error);
      res.status(500).json({ message: 'Error generating LinkedIn login URL' });
    }
  }

  // 10. LinkedIn Auth Callback Handler
  static async linkedinCallback(req: Request, res: Response) {
    const { code } = req.query;
    try {
      if (!code) {
        return res.status(400).send('OAuth authorization code is missing.');
      }

      const linkedinClientId = config.linkedin.clientId || process.env.LINKEDIN_CLIENT_ID;
      const linkedinClientSecret = config.linkedin.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
      const appUrl = config.appUrl || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const linkedinRedirectUri = `${appUrl}/api/auth/linkedin/callback`;

      if (!linkedinClientId || !linkedinClientSecret) {
        return res.status(500).send('LinkedIn API credentials are not configured on the server.');
      }

      // 1. Exchange authorization code for accessToken
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: linkedinRedirectUri,
          client_id: linkedinClientId,
          client_secret: linkedinClientSecret
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = tokenResponse.data;

      // 2. Fetch LinkedIn userinfo using OpenID UserInfo API
      const userResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const linkedinUser = userResponse.data; // { sub, email, name, picture }

      if (!linkedinUser || !linkedinUser.email) {
        return res.status(400).send('Failed to fetch user email from LinkedIn.');
      }

      // 3. Find or register user in DB
      let dbUser = await UserRepository.findByLinkedinId(linkedinUser.sub);
      if (!dbUser) {
        dbUser = await UserRepository.findByEmail(linkedinUser.email);
        if (dbUser) {
          // Link LinkedIn ID to existing account
          await UserRepository.update(dbUser.uid, { linkedinId: linkedinUser.sub });
          dbUser.linkedinId = linkedinUser.sub;
        } else {
          // Register a new user
          const uid = crypto.randomUUID();
          await UserRepository.create({
            uid,
            email: linkedinUser.email,
            displayName: linkedinUser.name || linkedinUser.email.split('@')[0],
            photoURL: linkedinUser.picture || '',
            role: 'journalist',
            linkedinId: linkedinUser.sub
          });
          dbUser = await UserRepository.findByUid(uid);
        }
      }

      if (!dbUser) {
        return res.status(500).send('Database record creation failed.');
      }

      // 4. Generate system access JWT
      const jwtToken = jwt.sign(
        { uid: dbUser.uid, role: dbUser.role },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password_hash, ...userProfile } = dbUser;

      // 5. Send postMessage back to parent React app and close popup
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>بيت الصحافة - تسجيل الدخول</h2>
            <p>تم التحقق بنجاح. يرجى الانتظار...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'LINKEDIN_AUTH_SUCCESS',
                  token: ${JSON.stringify(jwtToken)},
                  user: ${JSON.stringify(userProfile)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('LinkedIn OAuth Callback Error:', error.response?.data || error);
      res.status(500).send('Authentication failed during LinkedIn OAuth process.');
    }
  }
}
