const express = require('express')
const morgan = require('morgan')
const app = express()
require ('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function(req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(bodyParser.json())

let persons = [
  {
    name: 'Pertti Pellava',
    number: '0501234567',
    id: 1
  },
  {
    name: 'Erkki Käläjänmäki',
    number: '1232341324',
    id: 2
  },
  {
    name: 'Tellervo Testaaja',
    number: '030303030',
    id: 3
  },
  {
    name: 'Bert Backend',
    number: '12343243',
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
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  console.log(`Post: ${body.name}`)

  const personToAdd = new Person({
    name: body.name,
    number: body.number,
    id: generateId(1000000)
  })
  personToAdd.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)
  console.error(error.type)

  if (error.name === 'TypeError') {
    return response.status(404).send({ error: 'unknown endpoint' })

  } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })

  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })

  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})


