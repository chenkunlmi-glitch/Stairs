const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  profiles: [],
  bookings: [],
  rosters: {},
  settings: {
    weekStartDay: 0,
    rosterPublishDay: 0,
    customWeekStart: '',
    customWeekEnd: '',
  },
  adContent: {
    weekTitle: '本周小鬼当家排班报名',
    weekBody: '本周的Stairs排班开始报名了哈！',
    cultureQuote: 'Stairs不只是喝酒的地方',
    cultureBody: '你有想办的展、想分享的话题、想搞的活动，别客气，直接找我们聊。',
    cultureSub: '这个店是大家的客厅，不只是我们的。',
    footerNote: '楼梯在等你',
  },
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return JSON.parse(JSON.stringify(defaultData));
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

let data = loadData();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============ Profiles ============
app.get('/api/profiles', (req, res) => {
  res.json(data.profiles);
});

app.post('/api/profiles', (req, res) => {
  const profile = { ...req.body, createdAt: new Date().toISOString() };
  data.profiles.push(profile);
  saveData(data);
  res.json(profile);
});

app.put('/api/profiles/:id', (req, res) => {
  const idx = data.profiles.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.profiles[idx] = { ...data.profiles[idx], ...req.body };
  saveData(data);
  res.json(data.profiles[idx]);
});

// ============ Bookings ============
app.get('/api/bookings', (req, res) => {
  res.json(data.bookings);
});

app.post('/api/bookings', (req, res) => {
  const booking = { ...req.body, submittedAt: new Date().toISOString() };
  data.bookings.push(booking);
  saveData(data);
  res.json(booking);
});

// ============ Rosters ============
app.get('/api/rosters', (req, res) => {
  res.json(data.rosters);
});

app.post('/api/rosters', (req, res) => {
  const { weekStart, roster } = req.body;
  data.rosters[weekStart] = roster;
  saveData(data);
  res.json(roster);
});

// ============ Settings ============
app.get('/api/settings', (req, res) => {
  res.json(data.settings);
});

app.put('/api/settings', (req, res) => {
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  res.json(data.settings);
});

// ============ Ad Content ============
app.get('/api/ad', (req, res) => {
  res.json(data.adContent);
});

app.put('/api/ad', (req, res) => {
  data.adContent = { ...data.adContent, ...req.body };
  saveData(data);
  res.json(data.adContent);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', profiles: data.profiles.length, bookings: data.bookings.length });
});

app.listen(PORT, () => {
  console.log(`Stairs backend running on port ${PORT}`);
});

