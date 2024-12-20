import { lessonModel } from '~/models/lessonModel'
import { courseModel } from '~/models/courseModel'
import { quizModel } from '~/models/quizModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    const newLesson = {
      ...reqBody
    }
    const createdLesson = await lessonModel.createNew(newLesson)
    const getNewLesson = await lessonModel.findOneById(createdLesson.insertedId)

    if (getNewLesson) {
      //xử lý cấu trúc data trước khi trả dữ liệu về
      getNewLesson.Quizs = []

      //Cập nhật mảng lessonIds trong Course
      await courseModel.pushLessonIds(getNewLesson)
    }

    return getNewLesson
  } catch (error) { throw error }
}

const getAllLessons = async () => {
  return await lessonModel.getAllLessons()
}

const getDetails = async (lessonId) => {
  try {
    const lesson = await lessonModel.getDetails(lessonId)
    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found!')
    }

    return lesson
  } catch (error) { throw error }
}

const update = async (lesson_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedLesson = await lessonModel.update(lesson_Id, updateData)

    return updatedLesson
  } catch (error) { throw error }
}

const deleteItem = async (lesson_Id) => {
  try {
    const targetLesson = await lessonModel.findOneById(lesson_Id)
    if (!targetLesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found!')
    }
    //Xoa lesson
    await lessonModel.deleteOneById(lesson_Id)

    //Xoa quizs of lesson
    await quizModel.deleteManyByLessonId(lesson_Id)

    //Delete lessonIds of Coures
    await courseModel.pullLessonIds(targetLesson)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const lessonService = {
  creatNew,
  getAllLessons,
  getDetails,
  update,
  deleteItem
}