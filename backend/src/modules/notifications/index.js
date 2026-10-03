import notificationRoutes from '../../routes/notificationRoutes.js'
import * as supportNotificationController from '../../controllers/supportNotificationController.js'

export const NotificationModule = {
  routes: notificationRoutes,
  controller: supportNotificationController
}

export default NotificationModule
