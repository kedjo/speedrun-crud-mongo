const express = require('express');
const monk = require('monk');
const Joi = require('joi');

const db = monk(process.env.MONGO_URI);
const faqs = db.get('faqs');

const schema = Joi.object({
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required(),
    video_url: Joi.string().uri(),
})

const router = express.Router()

//READ ALL
router.get('/', (req, res, next) => {
    try {
        const items = faqs.find()
            .then(items => res.json(items))

    } catch (error) {
        next(error);
    }
})  

//READ ONE
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await faqs.findOne({
            _id: id,
        });
        if(!item) {
            return next();
        }else {
            res.json(item)
        }
    } catch (error) {
        next(error);
    }
})

//CREATE
router.post('/', async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);
        const inserted = await faqs.insert(value);
        res.json(inserted)
    } catch (error) {
        next(error);
    }
})

//UPDATE ONE
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const value = await schema.validateAsync(req.body);
        const item = faqs.findOne({
            _id: id,
        })
        if(!item)   return next();
        const updated = await faqs.update({
            _id: id
        }, {
            $set: value,
        });
        res.json(value);
    } catch (error) {
        next(error);
    }
    
})

//DELETE ONE
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await faqs.remove({_id: id})
        res.status(200).send('Success');
    } catch (error) {
        next(error);
    }
})

module.exports = router;