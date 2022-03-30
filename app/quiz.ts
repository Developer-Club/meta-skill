import fs from 'fs/promises'
import { join } from 'path'

export type Question = {
  title: string
  codeBlock: string[]
  options: string[]
  codeBlockOptions: {
    [key: string]: string
  }
  explanation: string
  correctAnswers: number[]
  isMultipleChoice: boolean
  isCodeBlockQuestion: boolean
}

export type Quiz = {
  id: string
  title: string
  questions: Question[]
}

export async function getQuiz(quizId: string) {
  const quizPath = join(process.cwd(), `quizes/${quizId}.json`)
  const quiz = await fs.readFile(quizPath)
  const quizJson = quiz.toString()

  return JSON.parse(quizJson)
}

export async function getQuizes() {
  const quizesPath = join(process.cwd(), 'quizes')
  const files = await fs.readdir(quizesPath)

  const quizes = files.map((filename) => {
    const id = filename.replace(/\.json$/, '')
    const title = id.replace(/-/g, ' ')

    return { id, title }
  })

  return quizes
}
