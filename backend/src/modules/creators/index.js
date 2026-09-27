import creatorRoutes from '../../routes/creatorRoutes.js'
import * as creatorController from '../../controllers/creatorController.js'

export const CreatorModule = {
  routes: creatorRoutes,
  controller: creatorController
}

export default CreatorModule
