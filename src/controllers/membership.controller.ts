import { Request, Response } from 'express';
import { MembershipRepository } from '../repositories/membership.repository';

export class MembershipController {
  static async getTiers(req: Request, res: Response) {
    try {
      const tiers = await MembershipRepository.findAllTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching membership tiers' });
    }
  }

  static async getAllUserMemberships(req: Request, res: Response) {
    try {
      const memberships = await MembershipRepository.findAllUserMemberships();
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user memberships' });
    }
  }

  static async getMyMembership(req: any, res: Response) {
    try {
      const userUid = req.user?.uid;
      if (!userUid) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const membership = await MembershipRepository.findUserMembershipByUid(userUid);
      res.json(membership || null);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user membership' });
    }
  }

  static async createUserMembership(req: any, res: Response) {
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const data = {
        id,
        user_uid: req.user?.uid || req.body.user_uid,
        full_name: req.body.full_name,
        email: req.body.email,
        phone: req.body.phone,
        professional_title: req.body.professional_title,
        institution: req.body.institution,
        cv_url: req.body.cv_url,
        id_card_url: req.body.id_card_url,
        tier_id: req.body.tier_id,
        status: 'pending',
        notes: req.body.notes || ''
      };

      await MembershipRepository.createUserMembership(data);
      res.status(201).json({ id, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Error creating membership application' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      await MembershipRepository.updateUserMembershipStatus(id, status, notes);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Error updating membership status' });
    }
  }
}
