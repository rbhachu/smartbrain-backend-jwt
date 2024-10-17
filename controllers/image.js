const Clarifai = require('clarifai');

// Initialize with the API key directly
const app = new Clarifai.App({
  apiKey: process.env.API_CLARIFAI
});

const handleApiCall = (req, res) => {
  app.models
    .predict({id: Clarifai.FACE_DETECT_MODEL}, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log('Handle API Error: ', err);
      res.status(400).json('Handle API Error');
    });
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => {
      console.log('Handle Image Error: ', err);
      res.status(400).json('Handle Image Error');
    });
};

module.exports = {
  handleImage,
  handleApiCall
};
