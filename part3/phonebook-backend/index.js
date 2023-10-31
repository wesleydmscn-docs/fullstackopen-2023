const express = require("express")
const app = express()

let { phonebook, uniqID } = require("./db")

app.use(express.json())

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/api/persons", (req, res) => {
  res.json(phonebook)
})

app.get("/api/persons/:id", (req, res) => {
  const { id } = req.params
  const target = phonebook.find((person) => person.id === Number(id))

  if (target) {
    return res.json(target)
  }

  return res.status(404).end()
})

app.get("/info", (req, res) => {
  const html = `
  <p>Phonebook has info for ${phonebook.length} people</p>
  <p>${new Date()}</p>
  `

  res.send(html)
})

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body

  if (!name) return res.status(400).json({ error: "'name' key is missing" })
  if (!number) return res.status(400).json({ error: "'number' key is missing" })

  const exists = phonebook.find((person) => person.name === name)

  if (exists) return res.status(400).json({ error: "name must be unique" })

  phonebook = phonebook.concat({ id: uniqID(phonebook), name, number })

  return res.status(201).end()
})

app.delete("/api/persons/:id", (req, res) => {
  const { id } = req.params
  const target = phonebook.find((person) => person.id === Number(id))

  if (target) {
    phonebook = phonebook.filter((person) => person.id !== Number(id))
    return res.status(204).end()
  }

  return res.status(404).end()
})

app.listen(3001, () => {
  console.log("Server is running at port", 3001)
})
