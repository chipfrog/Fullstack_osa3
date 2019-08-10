const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(express.static('build'))

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

app.get('/', (req, res) => {
  res.send('<h1>Etusivu</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>`)
})

const generateId = (max) => {
  return (
    Math.floor(Math.random() * Math.floor(max))
  )
}

app.post('/api/persons', (req, res) => {
  const body = req.body
  console.log(`Post: ${body.name}`)
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }
  const person = persons.find(person => person.name === body.name)
  if (person) {
    return res.status(409).json({
      error: 'name must be unique'
    })
  }
  const personToAdd = {
    name: body.name,
    number: body.number,
    id: generateId(1000000)
  }
  console.log(`Lisätään ${personToAdd.name} backendiin`)
  persons = persons.concat(personToAdd)
  res.json(personToAdd)
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})


