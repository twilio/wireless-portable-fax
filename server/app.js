'use strict';

const
    express = require('express'),
    app = express(),
    path = require('path'),
    fetch = require('node-fetch'),
    sharp = require('sharp'),
    config = require('./api/config.js'),
    portableFax = require('./api/portable.fax.js'),
    fax = require('./api/twilio.fax.js');

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', (process.env.PORT || 5000));
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// Render index.ejs
app.get('/', (req, res) => {
    res.render('index', {});
});

// Get Sync token
app.get('/token', (req, res) => {
    fetch(config.syncTokenUrl)
        .then(response => {
            response.json().then(json => {
                res.send(json);
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send();
        });
});

app.get('/faxes/:sid/image', (req, res) => {
    fax
        .get(req.params.sid)
        .then(response => {
            return fetch(response.mediaUrl, {
                    method: 'GET'
                })
                .then(res => res.buffer())
                .then(inputBuffer => {
                    // resize image and output as PNG
                    sharp(inputBuffer)
                        .resize(384)
                        .png()
                        .toBuffer()
                        .then(outputBuffer => {
                            res.set({
                                'content-type': 'image/png'
                            }).send(outputBuffer);
                        })
                        .catch(error => {
                            res.status(500).send('Fax image conversion failed.');
                            console.error(error);
                        });
                });

        })
        .catch(error => {
            res.status(500).send('Could not retrieve fax.');
            console.error(error);
        });
});

// Remove fax from Fax resource and Sync service list
app.delete('/faxes/:sid', (req, res) => {
    portableFax.remove(req.params.sid)
        .then(response => {
            res.status(204).send();
        })
        .catch(error => {
            res.status(500).send();
        });
});

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}: listening...`);
});