// This file contains functions for admin-specific operations, such as uploading CSV files and managing data.

const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const { exec } = require('child_process');
const User = require('../models/User');
const Rabbi = require('../models/Rabbi');
const Shiur = require('../models/Shiur');

const uploadShiurim = async (req, res) => {
  try {
    const parasha = req.body.parasha;
    if (!parasha) return res.status(400).json({ message: 'Parasha name required' });
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const filePath = req.file.path;
    const records = [];
    const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));

    for await (const row of parser) {
      const rabbiName = row.author || row.rabbi;
      const title = row.title;
      const url = row.link;
      if (!rabbiName || !title || !url) continue;

      let rabbiDoc = await Rabbi.findOne({ name: rabbiName });
      if (!rabbiDoc) {
        rabbiDoc = new Rabbi({ name: rabbiName });
        await rabbiDoc.save();
      }

      records.push({
        title,
        rabbi: rabbiDoc._id,
        url,
        parasha,
      });
    }

    if (records.length > 0) await Shiur.insertMany(records);
    fs.unlinkSync(filePath);

    res.json({ message: `Imported ${records.length} shiurim for parasha ${parasha}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const backupMongoDB = async (req, res) => {
  try {
    // Only allow admin (uncomment and adjust as needed)
    // if (!req.user || req.user.email !== 'szvbinjomin@gmail.com') {
    //   return res.status(403).json({ message: 'Forbidden: Admins only' });
    // }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiurfinder';
    const backupDir = `backup_${Date.now()}`;
    const dumpCmd = `mongodump --uri="${MONGODB_URI}" --out="./${backupDir}"`;

    exec(dumpCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ message: 'Backup failed', error: stderr || error.message });
      }
      res.json({ message: `Backup successful! Directory: ${backupDir}` });
    });
  } catch (err) {
    res.status(500).json({ message: 'Backup failed', error: err.message });
  }
};

module.exports = {
  uploadShiurim,
  backupMongoDB,
};