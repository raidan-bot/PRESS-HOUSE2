import { Router } from 'express';
import { CinemaController } from '../controllers/cinema.controller';

const router = Router();

router.get('/shows', CinemaController.getAllShows);
router.post('/shows', CinemaController.createShow);
router.put('/shows/:id', CinemaController.updateShow);
router.delete('/shows/:id', CinemaController.deleteShow);

router.get('/tickets', CinemaController.getAllTickets);
router.post('/tickets', CinemaController.createTicket);
router.put('/tickets/:id/status', CinemaController.updateTicketStatus);

router.get('/stats', CinemaController.getStats);
router.get('/imdb/:id', CinemaController.getImdbDetails);

export default router;
