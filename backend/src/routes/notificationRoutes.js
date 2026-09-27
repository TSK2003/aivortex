import { Router } from 'express'
import {
  createTicket,
  getMyTickets,
  replyToTicket,
  getNotifications,
  markNotificationAsRead
} from '../controllers/supportNotificationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)

router.get('/notifications', getNotifications)
router.patch('/notifications/:id/read', markNotificationAsRead)
router.post('/tickets', createTicket)
router.get('/tickets', getMyTickets)
router.post('/tickets/:ticketId/reply', replyToTicket)

export default router
