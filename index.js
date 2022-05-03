const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const app = express();

const phonebook = {
  persons: [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
  ],
};

morgan.token('body', (req, res) => {
  if (Object.entries(req.body).length !== 0) 
    return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
  response.json(phonebook.persons)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${phonebook.persons.length} people </p><p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
  // based on id param, get the assc. object -> json
  let id = +request.params.id; // `+` for number coercion
  let person = phonebook.persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
    return;
  }
});

app.delete('/api/persons/:id', (request, response) => {
  // delete even if id does not exists, 204
  let id = +request.params.id
  phonebook.persons = phonebook.persons.filter(person => person.id !== id);

  response.status(204).end();
})

app.post('/api/persons', (request, response) => {
  // for a response to go through,
  // -- need a express.json() middleware for accessing json
  let newPerson = request.body;
  if (!(newPerson.name && newPerson.number)) {
    // unacceptable lack of name or number
    return response.status(400).json({error: 'incomplete information'})
  } 

  // need to see if the name is unique
  let isNotUnique = phonebook.persons.find(person => 
    person.name === newPerson.name
  );
  if (isNotUnique) {
    return response.status(400).json({error: 'name must be unique'})
  }

  // OK here
  // is added to the persons
  // create new id
  newPerson.id = Math.floor(Math.random() * 1000) + 100;
  phonebook.persons = [...phonebook.persons, newPerson];
  response.status(200)
  response.json(newPerson)
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Script Log: Listening on port: ${PORT}`);
});