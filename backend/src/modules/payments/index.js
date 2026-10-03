import paymentRoutes from '../../routes/paymentRoutes.js'
import * as paymentController from '../../controllers/paymentController.js'
import { paymentService } from '../../services/paymentService.js'

export const PaymentModule = {
  routes: paymentRoutes,
  controller: paymentController,
  service: paymentService
}

export default PaymentModule
