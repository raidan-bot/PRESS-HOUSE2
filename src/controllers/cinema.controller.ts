import { Request, Response } from 'express';
import pool from '../db';
import { AIService } from '../services/ai/ai.service';

export class CinemaController {
  static async getAllShows(req: Request, res: Response) {
    try {
      const [rows] = await pool.query('SELECT * FROM cinema_shows ORDER BY show_time DESC, createdAt DESC');
      res.json(rows || []);
    } catch (error: any) {
      console.error('Error in getAllShows:', error);
      res.status(500).json({ message: 'Error fetching cinema shows' });
    }
  }

  static async getAllTickets(req: Request, res: Response) {
    try {
      const [rows] = await pool.query(`
        SELECT t.*, s.title as show_title 
        FROM cinema_tickets t
        LEFT JOIN cinema_shows s ON t.show_id = s.id
        ORDER BY t.createdAt DESC
      `);
      res.json(rows || []);
    } catch (error: any) {
      console.error('Error in getAllTickets:', error);
      res.status(500).json({ message: 'Error fetching tickets' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      // Fetch counts
      const [approvedRows] = await pool.query("SELECT COUNT(*) as count FROM cinema_tickets WHERE status = 'approved'");
      const [totalRows] = await pool.query("SELECT COUNT(*) as count FROM cinema_tickets");
      
      const approvedCount = approvedRows?.[0]?.count || 0;
      const totalCount = totalRows?.[0]?.count || 0;
      
      // We will define total attendance as approved tickets, or total requests if none are approved yet
      const totalAttendance = approvedCount > 0 ? approvedCount : totalCount;

      // Group by age group
      const [ageRows] = await pool.query(`
        SELECT age_group, COUNT(*) as count 
        FROM cinema_tickets 
        WHERE age_group IS NOT NULL AND age_group != ''
        GROUP BY age_group
      `);

      const ageDistribution = (ageRows || []).map((row: any) => ({
        name: row.age_group,
        value: row.count
      }));

      res.json({
        success: true,
        totalAttendance,
        ageDistribution
      });
    } catch (error: any) {
      console.error('Error in getStats:', error);
      res.status(500).json({ message: 'Error fetching stats' });
    }
  }

  static async createShow(req: Request, res: Response) {
    try {
      let slug = req.body.slug;
      if (!slug && req.body.title) {
        slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      }

      const [result] = await pool.query(`
        INSERT INTO cinema_shows 
        (title, slug, status, show_time, imdb_id, plot, poster_url, trailer_url, director, release_year, production, author, main_cast, news_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.body.title,
        slug,
        req.body.status || 'upcoming',
        req.body.show_time || null,
        req.body.imdb_id || null,
        req.body.plot || null,
        req.body.poster_url || null,
        req.body.trailer_url || null,
        req.body.director || null,
        req.body.release_year || null,
        req.body.production || null,
        req.body.author || null,
        req.body.main_cast || null,
        req.body.news_content || null
      ]);

      res.json({ success: true, id: result.insertId });
    } catch (error: any) {
      console.error('Error in createShow:', error);
      res.status(500).json({ message: 'Error creating cinema show' });
    }
  }

  static async updateShow(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await pool.query(`
        UPDATE cinema_shows SET 
        title = ?, slug = ?, status = ?, show_time = ?, imdb_id = ?, plot = ?, poster_url = ?, 
        trailer_url = ?, director = ?, release_year = ?, production = ?, author = ?, main_cast = ?, news_content = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        req.body.title,
        req.body.slug,
        req.body.status,
        req.body.show_time || null,
        req.body.imdb_id || null,
        req.body.plot || null,
        req.body.poster_url || null,
        req.body.trailer_url || null,
        req.body.director || null,
        req.body.release_year || null,
        req.body.production || null,
        req.body.author || null,
        req.body.main_cast || null,
        req.body.news_content || null,
        id
      ]);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in updateShow:', error);
      res.status(500).json({ message: 'Error updating cinema show' });
    }
  }

  static async deleteShow(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM cinema_shows WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in deleteShow:', error);
      res.status(500).json({ message: 'Error deleting cinema show' });
    }
  }

  static async createTicket(req: Request, res: Response) {
    try {
      const { show_id, full_name, whatsapp, interest_reason, age_group } = req.body;
      const [result] = await pool.query(`
        INSERT INTO cinema_tickets (show_id, full_name, whatsapp, interest_reason, age_group, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `, [show_id, full_name, whatsapp, interest_reason || null, age_group || null]);

      res.json({ success: true, id: result.insertId });
    } catch (error: any) {
      console.error('Error in createTicket:', error);
      res.status(500).json({ message: 'Error requesting cinema ticket' });
    }
  }

  static async updateTicketStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await pool.query('UPDATE cinema_tickets SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in updateTicketStatus:', error);
      res.status(500).json({ message: 'Error updating ticket status' });
    }
  }

  static async getImdbDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prompt = `You are a movie metadata expert. Look up details for the IMDb ID: "${id}". 
      Return a JSON block containing details for this movie. 
      Do NOT return any other text, conversational elements, or markdown wrapping. Just raw JSON.
      
      Expected JSON format:
      {
        "title": "Movie Title",
        "plot": "A brief summary of the movie plot",
        "poster_url": "A high-quality Unsplash image URL matching the movie style or genre (e.g. drama, action, documentary, etc.)",
        "director": "Director Name",
        "release_year": "Year of release",
        "main_cast": "Name 1, Name 2, Name 3"
      }`;

      const rawText = await AIService.callAI(prompt, "You are a specialized movie data extraction API. Return only valid JSON.");
      
      let jsonText = rawText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
      }
      jsonText = jsonText.trim();
      const movieData = JSON.parse(jsonText);
      
      res.json({ success: true, data: movieData });
    } catch (error: any) {
      console.error('Error fetching IMDb data with AI:', error);
      res.json({
        success: true,
        data: {
          title: "Unknown Movie",
          plot: "Could not fetch plot via AI.",
          poster_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",
          director: "Unknown",
          release_year: "N/A",
          main_cast: "Unknown"
        }
      });
    }
  }
}
