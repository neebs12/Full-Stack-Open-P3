const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log(`connecting to ${url}`)

// start connection
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log(`error connecting to MongoDB: ${error.message}`);
  })

// name and number are required
// name has to be atleast 3 characters in length
const phoneBookSchema = new mongoose.Schema({
  name: {
    type: String, 
    minlength: 3,
    required: true,
  }, 
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: numStr => {
        // by this point, numStr will have a length of 8 or more
        let pt = numStr.split('-');
        // 12345678 is a valid phone number
        // -- ie no second part on split, thus true
        if (pt[1] === undefined) return true;

        // cannot have pt1-pt2-pt3-...ptn
        if (pt.length >= 3) return false;

        // if there is a second part, scrutinize length of first section
        // -- ok for 2 and 3
        if (2 <= pt[0].length && pt[0].length <= 3) return true; 

        return false;
      }, 
      message: error => {
        return `${error.value} is not a valid number!`
      } 
    },
  }
})

// formatting returned object - from MongoDB:
// -- redundant .__v info
// -- unsafe ._id object
phoneBookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

let model = mongoose.model('number', phoneBookSchema);

module.exports = model;