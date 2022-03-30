import { LoaderFunction, useLoaderData } from 'remix'
import { Flex, Box, List, ListItem, Heading, Link } from '@chakra-ui/react'

import { getQuizes } from '../quiz'
import type { Quiz } from '../quiz'

export const loader: LoaderFunction = () => {
  try {
    return getQuizes()
  } catch (error) {
    console.error(error)
  }
}

export default function Index() {
  const quizes = useLoaderData<Quiz[]>()
  return (
    <Box p='4' h='100vh'>
      <Heading as='h1'>Meta Skill</Heading>
      <List>
        {quizes.map((quiz) => {
          return (
            <ListItem>
              <Flex
                key={quiz.id}
                m='8'
                p='4'
                border='1px solid black'
                maxWidth='300px'
                minHeight='150px'
                flexDir='column'
                alignItems='center'
                justifyContent='center'
              >
                <Heading
                  as='h3'
                  fontSize='2xl'
                  textTransform='uppercase'
                  mb='4'
                >
                  {quiz.title}
                </Heading>
                <Link
                  color='teal'
                  _hover={{ color: 'teal.200', textDecor: 'none' }}
                  href={`/quizes/${quiz.id}`}
                >
                  Practice now
                </Link>
              </Flex>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}
