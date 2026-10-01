import { courseRepository } from '../../repositories/courseRepository.js'
import * as publicController from '../../controllers/publicController.js'
import * as adminController from '../../controllers/adminController.js'

export const CourseModule = {
  repository: courseRepository,
  publicController,
  adminController
}

export default CourseModule
