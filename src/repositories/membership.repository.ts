import pool from '../db';

export class MembershipRepository {
  static async findAllTiers() {
    const [rows] = await pool.query('SELECT * FROM membership_tiers');
    return rows;
  }

  static async findAllUserMemberships() {
    const [rows] = await pool.query('SELECT * FROM user_memberships ORDER BY created_at DESC');
    return rows;
  }

  static async findUserMembershipByUid(userUid: string) {
    const [rows]: any = await pool.query('SELECT * FROM user_memberships WHERE user_uid = ? ORDER BY created_at DESC', [userUid]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  static async createUserMembership(data: any) {
    const fields = Object.keys(data).map(k => `"${k}"`).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const [result] = await pool.query(`INSERT INTO user_memberships (${fields}) VALUES (${placeholders})`, values);
    return result;
  }

  static async updateUserMembershipStatus(id: string, status: string, notes?: string) {
    const [result] = await pool.query('UPDATE user_memberships SET status = ?, notes = ? WHERE id = ?', [status, notes || '', id]);
    return result;
  }
}
