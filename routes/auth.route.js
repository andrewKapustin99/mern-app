const express = require('express');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator');
const JWT = require('jsonwebtoken');
const config = require('config')


const router = express.Router();


// /api/auth 
router.post('/register',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректный данные при регистрации'
                })
            }

            const { email, password } = req.body

            const candidate = await User.findOne({ email })

            if (candidate) {
                return res.status(400).json({
                    message: 'Такой пользователь уже существует'
                })
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({
                email,
                password: hashedPassword
            })

            await user.save()

            res.status(201).json({
                message: 'Пользователь создан'
            })

        } catch (e) {
            res.status(500).json({
                message: 'Что-то пошло не так, попробуйте снова'
            })
        }
    })


router.post('/login',
    [
        check('email', 'put the correct email').normalizeEmail().isEmail(),
        check('password', 'put the correct password').exists(),
    ],
    async (req, res) => {
        try {
            // Валидация данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "некоректные данные при входе в систему"
                })
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({
                    message: "The user is not found"
                })
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: "The password is incorrect, pleace try again"
                })
            }

            const token = JWT.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: "1h" }
            )

            res.json({ token, userId: user.id })

        } catch (error) {
            res.status(500).json({
                message: "Smth went wrong"
            })
        }
    })



module.exports = router