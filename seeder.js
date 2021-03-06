// *** Mongoose DB Seeder ***
// from root folder, run:
// "node seeder -import" to import to db
// "node seeder -delete" to delete from db

const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const User = require('./models/User');
const Profile = require('./models/Profile');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    // Create users (profiles created automatically)
    await User.create(users);
    // Populate profiles with location data
    await Profile.find({}, (error, profiles) => {
      if (error) throw error;

      profiles.map(async profile => {
        profile.location = {
          type: 'Point',
          coordinates: [-117.31063, 33.101442]
        };

        await Profile.findByIdAndUpdate(profile.id, profile);
      });
    });

    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Profile.deleteMany();
    console.log('Data Deleted...'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === '-import') {
  importData();
} else if (process.argv[2] === '-delete') {
  deleteData();
}
