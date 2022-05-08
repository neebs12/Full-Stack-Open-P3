const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const databaseName = 'phonebookApp'

const url = `mongodb+srv://fullstack:${password}@cluster0.xbyws.mongodb.net/${databaseName}?retryWrites=true&w=majority`

mongoose.connect(url)

// create schema at application level
const phonebookSchema = new mongoose.Schema({
  name: String, 
  number: String,
})

const Phonebook = mongoose.model('Number', phonebookSchema)

if (process.argv.length === 5) {
  // here, we want to add a new number to phonebook
  // @3 we have name, @4 we have number
  let newNumber = {
    name: process.argv[3],
    number: process.argv[4],
  }

  const phonebook = new Phonebook(newNumber)

  phonebook.save().then(result => {
    console.log(`added ${result.name} ${result.number} to phonebook`)
    mongoose.connection.close()
  })

} else if (process.argv.length === 3) {
  // here, we want to display all numbers in collection
  Phonebook.find({}).then(result => {
    result.forEach(number => console.log(number))
    mongoose.connection.close()
  })
}