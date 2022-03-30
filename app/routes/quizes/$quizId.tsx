import { useState } from 'react'
import { useLoaderData } from 'remix'
import { CloseIcon } from '@chakra-ui/icons'
import { Flex, Box } from '@chakra-ui/react'
import { Text, Heading, Link } from '@chakra-ui/react'
import { List, ListItem, Checkbox, Button } from '@chakra-ui/react'
import Markdown from 'markdown-to-jsx'

import type { LoaderFunction } from 'remix'
import type { Question, Quiz } from '../../quiz'

import { getQuiz } from '../../quiz'

export const loader: LoaderFunction = ({ params }) => {
  const { quizId } = params

  if (!quizId) return 404

  try {
    return getQuiz(quizId)
  } catch (error) {
    console.log(error)
  }
}

type SelectedOptions = {
  [key: string]: boolean
}

type QuizAnswers = {
  [key: string]: {
    selectedOptions: SelectedOptions
  }
}

function defaultQuizAnswers(questions: Question[]): QuizAnswers {
  const result: QuizAnswers = {}

  for (let i = 0; i < questions.length; i++) {
    result[i] = { selectedOptions: {} }
  }

  return result
}

export default function Index() {
  const quiz = useLoaderData<Quiz>()
  const { questions } = quiz

  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState(defaultQuizAnswers(questions))

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [answerChecked, setAnswerChecked] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(false)

  const canCheck = Object.values(selectedOptions).some(Boolean)
  const question = questions[currentIndex]

  const isOver = currentIndex === questions.length

  const next = () => {
    setQuizAnswers({
      ...quizAnswers,
      [currentIndex]: {
        selectedOptions,
      },
    })

    setSelectedOptions({})
    setAnswerChecked(false)

    setCurrentIndex(currentIndex + 1)
  }

  const checkOption = (checked: boolean, optionIndex: number) => {
    const options: SelectedOptions = { ...selectedOptions }

    if (!question.isMultipleChoice) {
      for (let option in selectedOptions) {
        options[option] = false
      }
    }

    setSelectedOptions({
      ...options,
      [optionIndex]: checked,
    })
  }

  const checkAnswer = () => {
    const answerOptions: number[] = []

    for (let option in selectedOptions) {
      if (selectedOptions[option]) {
        answerOptions.push(parseInt(option))
      }
    }

    const wrongAnswer = answerOptions.some((option) => {
      return !validateOption(option)
    })

    setAnswerChecked(true)
    setWrongAnswer(wrongAnswer)
  }

  const validateOption = (option: number) => {
    return canCheck && question.correctAnswers.includes(option)
  }

  const calculateScore = () => {
    let points = 0

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const answer = quizAnswers[i]

      question.correctAnswers.forEach((correctAnswer) => {
        if (answer.selectedOptions[correctAnswer]) {
          points++
        }
      })
    }

    return `${Math.trunc(points / questions.length) * 100}%`
  }

  return (
    <Box p='4' h='100vh'>
      <Heading as='h1'>Meta Skill</Heading>
      <Box m='8' p='4' border='1px solid black'>
        {isOver && (
          <Box textAlign='center'>
            <Heading as='h3' size='xl'>
              Final
            </Heading>
            <Text fontSize='5xl'>{calculateScore()}</Text>
            <Link
              color='teal'
              _hover={{ color: 'teal.200', textDecor: 'none' }}
              href='/'
            >
              GAME OVER
            </Link>
          </Box>
        )}
        {!isOver && (
          <>
            <Box mb='16'>
              <Heading as='h3' size='md' mb='4'>
                {question.title}
              </Heading>
              {question.codeBlock.length > 0 &&
                question.codeBlock.map((code) => {
                  return (
                    <Box p='4' overflowX='scroll' bgColor='gray.700' my='4'>
                      <Markdown>{code}</Markdown>
                    </Box>
                  )
                })}
            </Box>
            <List>
              {question.options.map((option, i) => {
                const isOk = validateOption(i)

                return (
                  <ListItem key={Date.now() + i} mb='12'>
                    <Box>
                      {!answerChecked && (
                        <Checkbox
                          onChange={(event) =>
                            checkOption(event.target.checked, i)
                          }
                          isChecked={Boolean(selectedOptions[i])}
                        >
                          {option}
                        </Checkbox>
                      )}
                      {answerChecked && selectedOptions[i] && isOk && (
                        <Checkbox
                          colorScheme='green'
                          color='green'
                          isChecked={Boolean(selectedOptions[i])}
                        >
                          {option}
                        </Checkbox>
                      )}
                      {answerChecked && selectedOptions[i] && !isOk && (
                        <Checkbox
                          icon={<CloseIcon />}
                          isInvalid
                          colorScheme='red'
                          color='red'
                          isChecked={Boolean(selectedOptions[i])}
                        >
                          {option}
                        </Checkbox>
                      )}
                      {answerChecked && !selectedOptions[i] && (
                        <Checkbox isChecked={Boolean(selectedOptions[i])}>
                          {option}
                        </Checkbox>
                      )}
                      {question.isCodeBlockQuestion && (
                        <Box p='4' overflowX='scroll' bgColor='gray.700' my='4'>
                          <Markdown>{question.codeBlockOptions[i]}</Markdown>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                )
              })}
            </List>
            {wrongAnswer && (
              <Box mt='2'>
                <Markdown>{question.explanation}</Markdown>
              </Box>
            )}
            <Flex justifyContent='flex-end'>
              {!answerChecked && (
                <Button
                  disabled={!canCheck}
                  onClick={checkAnswer}
                  colorScheme='teal'
                  m='2'
                >
                  Check
                </Button>
              )}
              {answerChecked && (
                <Button onClick={next} colorScheme='teal' m='2'>
                  Next
                </Button>
              )}
            </Flex>
          </>
        )}
      </Box>
    </Box>
  )
}
