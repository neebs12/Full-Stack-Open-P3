require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const express = require('express')
const app = express()

const Phonebook = require('./models/phonebook')

morgan.token('body', (req, res) => {
  if (Object.entries(req.body).length !== 0) 
    return JSON.stringify(req.body)
})

// cors should not be necessary
// app.use(cors());
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Phonebook.find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Phonebook.find({})
    .then( result => {
      response.send(`<p>Phonebook has info for ${result.length} people </p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  // based on id param, get the assc. object -> json
  Phonebook.findById(request.params.id)
    .then(result => {
      response.status(200).json(result)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  // for a response to go through,
  let newPerson = request.body

  // if newPerson does not have "name" or "number"
  // -- the validation is deferred to the application-level
  // -- schema definition
  // -- name: undefined or number: undefined throws a 500 error on save
  // -- so this is for inline mutation of newPerson
  // let onlyHeaders = ['name', 'number'];
  // Object.entries(newPerson).forEach(key => {
  //   if (onlyHeaders.includes(key)) delete newPerson[key]
  // })

  // let phonebook = new Phonebook(newPerson)

  // omg so it works with Model.create and now Model.prototype.save
  // thus we dont need to inline mutate the object anymore with mongoose
  // when we are using the static method of Model. as opposed to the prototype method

  // no need to check for uniqueness yet
  // phonebook.save()
  Phonebook.create(newPerson)
    .then(result => {
      // works to NOT display result as HTTP Code: 204 refers to No Content
      // response.status(204).json(result); 
      // works TO display result as HTTP Code: Created
      response.status(201).json(result) // works to display result
      // Lesson: 
      // HTTP Codes are RESTful too, just get the right codes
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  // update the information with PUT
  let {name, number} = request.body

  // ok so this is weird, so this does not work to validate 
  // -- with missing number property. Even if that property is 
  // -- missing, or has a property value of `undefined`
  // -- the request is processed successfully!
  // -- its just those presumably empty properties are
  // -- either with undefined value or out-right missing, mongoose
  // -- mongoose allows this, and the database, mongoDB also allows this
  // -- but hey, it works with minlength for name!

  Phonebook.findByIdAndUpdate(
    request.params.id, 
    {name, number}, 
    {new: true, runValidators: true, context: 'query'}
  )
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(_ => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint' })
}

// endpoint not found - invalid route
app.use(unknownEndpoint)

// error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // CastError is the error created with invalid ids
  if (error.name === 'CastError') {
    response.status(400).send({error: 'malformatted id'})
    return
  } else if (error.name === 'ValidationError') {
    // notice that this is .json and dependent on error.message,
    // this is because validation is (within) the schema of the database
    // it will auto-reject the update 

    // Also, due to the nature of our api, this should only be triggered by out post and put
    response.status(400).json({error: error.message})
    return
  }

  // note, this handler is not the final FINAL middleware
  // invocation of next should ideally be:
  // 1. Express' default error handler OR
  // 2. Another user-defined error handler middleware (thought)
  next(error)
}

// error handling
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Script Log: Listening on port: ${PORT}`)
})