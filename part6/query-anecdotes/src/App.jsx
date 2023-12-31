import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useNotificationDispatch } from "./contexts/NotificationContext"
import { getAnecdotes, updateAnecdote } from "./services/anecdotes"

import AnecdoteForm from "./components/AnecdoteForm"
import Notification from "./components/Notification"

const App = () => {
  const queryClient = useQueryClient()
  const dispatch = useNotificationDispatch()

  const result = useQuery({
    queryKey: ["anecdotes"],
    queryFn: getAnecdotes,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries("anecdotes")
    },
  })

  const handleVote = async (anecdote) => {
    updateAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 })

    await dispatch({
      type: "showNotification",
      payload: `You voted: ${anecdote.content} !`,
    })

    setTimeout(() => {
      dispatch({ type: "hideNotification" })
    }, 5000)

    console.log("vote:", anecdote.content)
  }

  if (result.isLoading) {
    return <p>loading data...</p>
  }

  if (result.isError) {
    return <p>anecdote service not available due to problems in server</p>
  }

  const anecdotes = result.data

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
