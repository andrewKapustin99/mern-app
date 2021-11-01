const express = require('express');
const Link = require('../models/Link.model');
const config = require('config')
const auth = require('../middlware/auth.middleware');
const shortid = require('shortid');


const router = express.Router();

router.post('/generate', auth, async (req, res) => {
    try {
        const baseUrl = config.get('baseUrl')
        const { from } = req.body

        const code = shortid.generate()

        const exsisting = await Link.findOne({from});

        if(exsisting) {
            res.json({
                link: exsisting
            })
        }

        const to = baseUrl + '/t/' + code

        const link = new Link({
            code, 
            to,
            from,
            owner: req.user.userId
        })
        
        await link.save();

        res.status(201).json({ link })


    } catch (e) {
        res.status(500).json({
            message: 'Что-то пошло не так, попробуйте снова'
        })
    }
})

router.get('/', auth, auth, async (req, res) => {
    try {
        const links = await Link.find({
            owner: req.user.userId
        })
        res.json(links)
    } catch (e) {
        res.status(500).json({
            message: 'Что-то пошло не так, попробуйте снова'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const link = await Link.findById( req.params.id)
        res.json(link)
    } catch (e) {
        res.status(500).json({
            message: 'Что-то пошло не так, попробуйте снова'
        })
    }
})


module.exports = router