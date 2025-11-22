// This file contains functions for admin-specific operations, such as uploading CSV files and managing data.

const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const User = require('../models/User');
const Rabbi = require('../models/Rabbi');
const Shiur = require('../models/Shiur');
const upload = multer({ dest: 'uploads/' });

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

module.exports = {
  uploadShiurim,
};