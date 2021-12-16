const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const Entry = require('./models/entry.model')
const path = require('path');


app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "build")));
app.get("/*", (req,res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"))
})

mongoose.connect('mongodb+srv://ashwin269:chidam269@cluster0.ccyhk.mongodb.net/webArchive?retryWrites=true&w=majority',
{useNewUrlParser: true,
useCreateIndex: true,
useUnifiedTopology: true
});

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    try {
            const newPassword = await bcrypt.hash(req.body.password, 10)
            await User.create({
            displayName: req.body.displayName,
            email: req.body.email,
            password: newPassword,
        }
        )
        res.json({status: 'ok'})

    }
    catch (err) {
        res.json({status: 'error', error: 'Duplicate email' })
    }
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })
    if (!user) {
        return res.json({ status: 'error', error: 'Invalid login'})
    }
   
    const passwordIsValid = await bcrypt.compare(
        req.body.password,
        user.password
    )
    if (passwordIsValid) {
        const token = jwt.sign({
            displayName: user.displayName,
            email: user.email,

        }, 'secret123')
        return res.json({ status: 'ok', user: token})
    }
    else {
        return res.json({ status: 'error', user: false})
    }
})

app.get('/api/entries', asyncHandler(async (req, res) => {
    const entries = await Entry.find();
    res.json(entries);
})
)


app.post('/api/entries/create', asyncHandler(async (req, res) => {
    const { title, link, description } = req.body;
    if (!title || !link || !description) {
        res.status(400);
        throw new Error("Please fill all the fields");
        return;
    } else {
        const entry = new Entry({ user: req.body._id, title, link, description });
        const createdEntry = await entry.save();
        res.status(201).json(createdEntry)
    }
}))

app.delete('/api/entries/:id', asyncHandler(async (req, res) => {
    const entry = await Entry.findById(req.params.id);
    
    if (entry) {
        await entry.remove();
        res.json({message: "Entry Removed"})
    }
    else {
        res.status(404);
        throw new Error("Entry not found")
    }
}))

app.put('/api/entries/:id', asyncHandler(async (req, res) => {
    const { title, link, description } = req.body;
    const entry = await Entry.findById(req.params.id);
    if (entry) {
        entry.title = title;
        entry.link = link;
        entry.description = description;
    
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
    }
    else {
        res.status(404);
        throw new Error("Entry not found")
    }
}))


app.listen(8000, () => {console.log('Server started at 8000')})