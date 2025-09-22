import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: ['https://cf-stalker-web.onrender.com', 'http://localhost:5173'], // Frontend domain and local development
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB with retry logic
const connectDB = async (retries = 5) => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    // Run initial update on successful MongoDB connection
    console.log('Starting initial data update...');
    //await updateContestData(); //Already Did Once.
    console.log('Initial data update completed');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (retries > 0) {
      console.log(`Retrying connection in 5 seconds... (${retries} attempts remaining)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

// Define schemas
const ContestSchema = new mongoose.Schema({
  id: Number,
  name: String,
  division: String,
  startTimeSeconds: Number,
  problems: [{
    id: String,
    name: String,
    rating: Number,
    tags: [String]
  }]
});

const ProblemByRatingSchema = new mongoose.Schema({
  division: String,
  rating: Number,
  problems: [{
    id: String,
    name: String,
    contestId: Number,
    contestName: String,
    tags: [String]
  }]
});

const ProblemByTopicSchema = new mongoose.Schema({
  division: String,
  topic: String,
  problems: [{
    id: String,
    name: String,
    rating: Number,
    contestId: Number,
    contestName: String
  }]
});

const VisitCounterSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const Contest = mongoose.model('Contest', ContestSchema);
const ProblemByRating = mongoose.model('ProblemByRating', ProblemByRatingSchema);
const ProblemByTopic = mongoose.model('ProblemByTopic', ProblemByTopicSchema);
const VisitCounter = mongoose.model('VisitCounter', VisitCounterSchema);

// API endpoints
app.get('/api/contests/:division', async (req, res) => {
  try {
    const contests = await Contest.find({ division: req.params.division })
      .sort({ startTimeSeconds: -1 })
      .limit(50);
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

app.get('/health', (req, res) => { //For checking if the server is running
  res.send('OK');
});

app.get('/api/problems/rating/:division', async (req, res) => {
  try {
    const problems = await ProblemByRating.find({ division: req.params.division });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problems by rating' });
  }
});

app.get('/api/problems/topics/:division', async (req, res) => {
  try {
    const problems = await ProblemByTopic.find({ division: req.params.division });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problems by topic' });
  }
});

// Visit counter endpoints
app.post('/api/visits/increment', async (req, res) => {
  try {
    let counter = await VisitCounter.findOne();
    if (!counter) {
      counter = await VisitCounter.create({ count: 0 });
    }
    counter.count += 1;
    counter.lastUpdated = new Date();
    await counter.save();
    res.json({ count: counter.count });
  } catch (error) {
    console.error('Error updating visit counter:', error);
    res.status(500).json({ error: 'Failed to update visit counter' });
  }
});

app.get('/api/visits', async (req, res) => {
  try {
    let counter = await VisitCounter.findOne();
    if (!counter) {
      counter = await VisitCounter.create({ count: 0 });
    }
    res.json({ count: counter.count });
  } catch (error) {
    console.error('Error fetching visit counter:', error);
    res.status(500).json({ error: 'Failed to fetch visit counter' });
  }
});

// Function to fetch and update data
async function updateContestData() {
  try {
    console.log('Starting data update...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Contest.deleteMany({});
    await ProblemByRating.deleteMany({});
    await ProblemByTopic.deleteMany({});
    
    // Fetch contest list
    console.log('Fetching contest list from Codeforces...');
    const response = await fetch('https://codeforces.com/api/contest.list');
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error('Failed to fetch contest data');
    }
    
    // Process contests
    console.log('Processing contests...');
    const categorizedContests = {
      div1: [],
      div2: [],
      div3: [],
      div4: []
    };
    
    data.result.forEach(contest => {
      const name = contest.name.toLowerCase();
      
      if (name.includes('div. 1') && !name.includes('div. 2')) {
        categorizedContests.div1.push(contest);
      } else if (name.includes('div. 2') && !name.includes('div. 1')) {
        categorizedContests.div2.push(contest);
      } else if (name.includes('div. 3')) {
        categorizedContests.div3.push(contest);
      } else if (name.includes('div. 4')) {
        categorizedContests.div4.push(contest);
      }
    });
    
    // Log the number of contests found for each division
    Object.keys(categorizedContests).forEach(div => {
      console.log(`Found ${categorizedContests[div].length} contests for ${div}`);
    });
    
    // Limit to last 50 contests per division
    Object.keys(categorizedContests).forEach(div => {
      categorizedContests[div] = categorizedContests[div]
        .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds)
        .slice(0, 50);
      console.log(`Storing ${categorizedContests[div].length} contests for ${div}`);
    });
    
    // Fetch problems for each contest and store in database
    for (const division of ['div1', 'div2', 'div3', 'div4']) {
      console.log(`Processing ${division} contests...`);
      const contests = categorizedContests[division];
      
      for (const contest of contests) {
        //console.log(`Fetching problems for contest ${contest.id} (${contest.name})...`);
        // Fetch problems for this contest
        const probResponse = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contest.id}&from=1&count=1`);
        const probData = await probResponse.json();
        
        if (probData.status === 'OK' && probData.result.problems) {
          const problems = probData.result.problems;
          
          // Store contest with problems
          await Contest.create({
            id: contest.id,
            name: contest.name,
            division: division,
            startTimeSeconds: contest.startTimeSeconds,
            problems: problems.map(p => ({
              id: `${contest.id}-${p.index}`,
              name: p.name,
              rating: p.rating,
              tags: p.tags || []
            }))
          });
          
          // Categorize problems by rating
          const problemsByRating = {};
          problems.forEach(problem => {
            if (problem.rating) {
              const rating = problem.rating.toString();
              if (!problemsByRating[rating]) {
                problemsByRating[rating] = [];
              }
              problemsByRating[rating].push({
                id: `${contest.id}-${problem.index}`,
                name: problem.name,
                contestId: contest.id,
                contestName: contest.name,
                tags: problem.tags || []
              });
            }
          });
          
          // Store problems by rating
          for (const [rating, probs] of Object.entries(problemsByRating)) {
            await ProblemByRating.findOneAndUpdate(
              { division, rating },
              { $push: { problems: { $each: probs } } },
              { upsert: true }
            );
          }
          
          // Categorize problems by topic
          const problemsByTopic = {};
          problems.forEach(problem => {
            if (problem.tags && problem.tags.length > 0) {
              problem.tags.forEach(tag => {
                if (!problemsByTopic[tag]) {
                  problemsByTopic[tag] = [];
                }
                problemsByTopic[tag].push({
                  id: `${contest.id}-${problem.index}`,
                  name: problem.name,
                  rating: problem.rating,
                  contestId: contest.id,
                  contestName: contest.name
                });
              });
            }
          });
          
          // Store problems by topic
          for (const [topic, probs] of Object.entries(problemsByTopic)) {
            await ProblemByTopic.findOneAndUpdate(
              { division, topic },
              { $push: { problems: { $each: probs } } },
              { upsert: true }
            );
          }
        }
      }
    }
    
    console.log('Data update completed successfully');
  } catch (error) {
    console.error('Error updating data:', error);
  }
}

// Function to check if it's 3 AM
function is3AM() {
  const now = new Date();
  return now.getHours() === 3 && now.getMinutes() === 0 && now.getSeconds() === 0;
}

// Function to check time and update data
function checkAndUpdateData() {
  if (is3AM()) {
    console.log('It\'s 3 AM! Starting data update...');
    updateContestData();
  }
}

// Start checking time every second
setInterval(checkAndUpdateData, 1000);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      //console.log('Data update check is running every second');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(); 