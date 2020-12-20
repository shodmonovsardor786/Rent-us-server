const express = require('express')
const app = express()
const cors = require('cors')
const fileUpload = require('express-fileupload')

const PORT = process.env.PORT || 4000
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server)

app.use("/images", express.static('images'))
app.use(fileUpload())
app.use(express.json())

app.use(cors())

app.get('/favicon.ico', (_, res) => {
    res.send('')
})

app.get('/', (_, res) => {
    res.redirect('/home')
})

const { getHome, postHome } = require('./Controllers/homeController')
app.get('/home', getHome)
app.post('/home', postHome)

const { login } = require('./Controllers/loginController')
app.post('/login', login)

const { create } = require('./Controllers/createController')
app.post('/create', create)

const { getNew, postNew } = require('./Controllers/newController')
app.get('/new', getNew)
app.post('/new', postNew)

app.post('/newImg', async (req, res) => {
    const file = req.files.file
    try { 
            if(file) {
                file.mv('images/' + file.name, e => {
                    if (e) {
                        console.log(e)
                        throw new Error ('error in file upload')
                    }
                     res.json({name: file.name, error: null})
                })
            }
    }
     catch (error) {
        res.json({data: null, error: error.message})
    }
})

const { getAccount, postAccount } = require('./Controllers/accountController')
app.get('/account', getAccount)
app.post('/account', postAccount)

const { getSettings, postSettings } = require('./Controllers/settingsController')
app.get('/account/settings', getSettings)
app.post('/account/settings', postSettings)

server.listen(PORT, () => console.log(`server ready with ${PORT} port`))