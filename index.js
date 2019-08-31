const express = require('express')
const app = express()
require ('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(bodyParser.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

let persons = [
  {
    name: "Pertti Pellava",
    number: "0501234567",
    id: 1
  },
  {
    name: "Erkki Käläjänmäki",
    number: "1232341324",
    id: 2
  },
  {
    name: "Tellervo Testaaja",
    number: "030303030",
    id: 3
  },
  {
    name: "Bert Backend",
    number: "12343243",
    id: 4
  }
]
app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Etusivu</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(foundPerson => {
      res.json(foundPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  const date = new Date()
  Person.find({}).then(people => {
    res.send(`<p>Phonebook has info for ${people.length} people</p>
    <p>${date}</p>`)
  })
})

const generateId = (max) => {
  return (
    Math.floor(Math.random() * Math.floor(max))
  )
}

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  console.log(`Post: ${body.name}`)
  
  const personToAdd = new Person({
    name: body.name,
    number: body.number,
    id: generateId(1000000)
  })
  console.log(`Lisätään ${personToAdd.name} backendiin`)
  personToAdd.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
  
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)
  console.error(error.type)

  if (error.name === 'TypeError') {
    return response.status(404).send({ error: 'unknown endpoint' })
  }
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})


