var express = require('express')
var router = express.Router();

const ws = require("../wslib");
const Joi = require('joi');
// const Message = require('../models/message');


/* GET messages listing. */
router.get('/messages', function(req, res, next) {
    res.send(ws.messages);
    /* Message.findAll().then((result) => {
        res.send(result)
    }) */
});

// GET mensaje con ts especificado
router.get('/messages/:ts', function(req,res) {
    const message = ws.messages.find((m) => m.ts === parseInt(req.params.ts))
    if(!message)
        return res.status(404).send("No se encontró el mensaje con el ts: " + req.params.ts)
    res.send(message)
    /* Message.findByPk(req.params.ts).then((response) => {
        if (response == null){
            return res.status(404).send({ message: "No se encontró el mensaje con el ts: " + req.params.ts})
        }
        res.send(response)
    }) */
})

// POST mensaje
router.post('/messages', function(req, res){
    const schema = Joi.object({
        message: Joi.string().min(5).required(),
        author: Joi.string().regex(new RegExp('[a-zA-Z]+ [a-zA-Z]+')).required(),
        ts: Joi.number().required()
    })
    
    const { error } = schema.validate(req.body)
    
    if (error) return res.status(400).send(error)
    
    //Se cambia el ts para que sea único y tenga más sentido
    req.body.ts = Date.now()
    
    ws.messages.push(req.body)
    ws.clients.forEach((client) => client.send(JSON.stringify(ws.messages)))
    res.send(req.body)

    /* Message.create({ message: req.body.message, author: req.body.author, ts: req.body.ts }).then(
        (result) => {
            res.send(result)
            Message.findAll().then((result) => {
                ws.clients.forEach((client) => client.send(JSON.stringify(result)));
            })
        }
    ) */
})

//PUT mensaje
router.put('/messages/:ts', function (req, res){
    const message = ws.messages.find((m) => m.ts === parseInt(req.params.ts))
    if(!message) return res.status(404).send("No se encontró el mensaje con el ts: " + req.params.ts)
    
    const schema = Joi.object({
        message: Joi.string().min(5).required(),
        author: Joi.string().regex(new RegExp('[a-zA-Z]+ [a-zA-Z]+')).required()
    })
    
    const { error } = schema.validate(req.body)
    
    if (error) return res.status(400).send(error)

    message.message = req.body.message
    message.author = req.body.author

    ws.clients.forEach((client) => client.send(JSON.stringify(ws.messages)))
    res.send(message)
    
    /* Message.update(req.body, { where: { ts: req.params.ts } }).then( (response) => {
        if (response[0] !== 0) {
            res.send({ message: "Message updated" })
            Message.findAll().then((result) => {
                ws.clients.forEach((client) => client.send(JSON.stringify(result)));
            })
        }
        else res.status(404).send({ message: "Message was not found" })
    }) */
})

//DELETE 
router.delete('/messages/:ts', function (req, res){
    const message = ws.messages.find((m) => m.ts === parseInt(req.params.ts))
    if(!message) return res.status(404).send("No se encontró el mensaje con el ts: " + req.params.ts)

    const index = ws.messages.indexOf(message)
    ws.messages.splice(index,1) 

    ws.clients.forEach((client) => client.send(JSON.stringify(ws.messages)))
    res.send(message)

    /* Message.destroy({ where: { ts: req.params.ts } }).then( (response) => {
        if (response === 1) {
            res.status(204).send({ message: "Message with ts: " + req.params.ts + " has been deleted" });
            Message.findAll().then((result) => {
                ws.clients.forEach((client) => client.send(JSON.stringify(result)));
            })
        }
        else res.status(404).send({ message: "Message was not found" }); 
    }) */
})


module.exports = router;
