// PIRoutes.js

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { insertPersonalInfo, getPersonalInfo } = require('../db/personalInfo');


// Validation Schemas
const personalInfoSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  sex: Joi.number().valid(0, 1).required(),
  height: Joi.number().positive().required(),
  age: Joi.number().integer().min(1).max(120).required(),
  weight: Joi.number().positive().required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
});

const getPersonalInfoSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

/**
 * POST: /api/personal-info/addPI
 * Insert a new personal information record for a user.
 */
router.post('/addPI', async (req, res) => {
  console.log('Received body:', req.body);
  const { error, value } = personalInfoSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId, sex, height, age, weight, firstName, lastName } = value;

  // Insert into DB
  const result = await insertPersonalInfo({
    userId,
    sex,
    height,
    age,
    weight,
    firstName,
    lastName,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    message: 'Personal information saved successfully!',
    insertId: result.insertId,
  });
});

/**
 * GET: /api/personal-info/getPI?userId=1
 * Retrieve the most recent personal info for a given user.
 */
router.get('/getPI', async (req, res) => {
  // Validate the query
  const { error, value } = getPersonalInfoSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { userId } = value;
  const result = await getPersonalInfo(userId);

  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }

  // Return the personal information
  res.status(200).json(result.data);
});

module.exports = router;
