const express = require('express');
const bcrypt = require('bcrypt');
const { getUserByUsername, createUser } = require('../utils/users');
const router = express.Router();
const sanitize = require('mongo-sanitize');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect(`/join?username=${user.username}`);
    } else {
        res.redirect('/?error=invalid_credentials');
    }
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
        res.redirect('/signup.html?error=username_taken');
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, email, password: hashedPassword, room: 'General' };

        await createUser(newUser);
        req.session.userId = newUser._id;
        req.session.username = newUser.username;
        res.redirect(`/join?username=${newUser.username}`);
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/join');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
