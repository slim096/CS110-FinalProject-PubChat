const express = require('express');
const passport = require('passport');
const { User } = require('../utils/users');

const router = express.Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user && !user.username) {
      res.redirect('/set-username');
    } else {
      res.redirect('/join');
    }
  }
);

module.exports = router;
