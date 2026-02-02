import { useState } from 'react'
import data from '@/../product/sections/practice-review/data.json'
import { PracticeQuestionView } from './components/PracticeQuestionView'

export default function PracticeQuestionViewPreview() {
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map())
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  return (
    <PracticeQuestionView
      questions={data.practiceQuestions.map(q => ({
        ...q,
        type: q.type as 'fill-blank' | 'multiple-choice' | 'dictation'
      }))}
      currentQuestionIndex={0}
      userAnswers={userAnswers}
      isPlayingAudio={isPlayingAudio}
      onSubmitAnswer={(questionId, answer) => {
        console.log('Submit answer:', questionId, answer)
        setUserAnswers(new Map(userAnswers).set(questionId, answer))
      }}
      onSkipQuestion={(questionId) => {
        console.log('Skip question:', questionId)
      }}
      onPlayAudio={(audioUrl) => {
        console.log('Play audio:', audioUrl)
        setIsPlayingAudio(true)
        setTimeout(() => setIsPlayingAudio(false), 2000)
      }}
      onStopAudio={() => {
        console.log('Stop audio')
        setIsPlayingAudio(false)
      }}
    />
  )
}
