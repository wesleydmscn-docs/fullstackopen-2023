const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

require("dotenv").config()

const app = express()

const Person = require("./models/person")

morgan.token("body", function getBody(req) {
  if (req.body && req.body.name && req.body.number) {
    return JSON.stringify(req.body)
  }

  return " "
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(cors())
app.use(express.static("dist"))
app.use(express.json())
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((result) => {
      res.json(result)
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (req, res, next) => {
  const { id } = req.params
  Person.findById(id)
    .then((person) => res.json(person))
    .catch((error) => next(error))
})

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then((result) => {
      const html = `
    <p>Phonebook has info for ${result} people</p>
    <p>${new Date()}</p>`

      res.send(html)
    })
    .catch((error) => next(error))
})

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body

  if (!name) return res.status(400).json({ error: "'name' key is missing" })
  if (!number) return res.status(400).json({ error: "'number' key is missing" })

  const newPerson = new Person({
    name,
    number,
  })

  newPerson
    .save()
    .then((savedPerson) => {
      res.status(201).json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
  const { id } = req.params
  const { number } = req.body

  if (!number) return res.status(400).json({ error: "'number' key is missing" })

  Person.findByIdAndUpdate(
    id,
    { number },
    { new: true, runValidators: true, context: "query" }
  )
    .then(() => {
      res.status(201).end()
    })
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
  const { id } = req.params

  Person.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log("Server is running at port", PORT)
})
