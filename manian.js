// import express from 'express'
const express = require("express");
const app = express();
const port = 5000;
app.use(express.json());

const US = {};

function Exp(Valy) {
	const time = new Date();
	time.setMinutes(time.getMinutes() + Valy);
	return time.toISOString();
}

app.post('/shorturls', (req, res) => {
	const { url, validity = 30, shortcode } = req.body;
	if (!url || typeof url !== 'string') {
		return res.status(400).json({ error: 'URL Must be String' });
	}
	let Line = shortcode;
	if (!Line) {
		Line = Math.random().toString(36).substr(2, 6);
	}
	if (US[Line]) {
		return res.status(409).json({ error: 'Code Already Exist' });
	}
	const expiry = Exp(validity);
	US[Line] = {
		url,
		created: new Date().toISOString(),
		expiry,
		validity
	};
	res.status(201).json({
		shortLink: `http://localhost:${port}/${Line}`,
		expiry
	});
});

app.get('/shorturls/:shortcode', (req, res) => {
	const { shortcode } = req.params;
	const entry = US[shortcode];
	if (!entry) {
		return res.status(404).json({ error: 'Code Not Found' });
	}
	const now = new Date();
	if (new Date(entry.expiry) < now) {
		return res.status(410).json({ error: 'Code Expired' });
	}
	res.json({
		originalUrl: entry.url,
		created: entry.created,
		expiry: entry.expiry,
		shortLink: `http://localhost:${port}/${shortcode}`
	});
});

app.get('/:shortcode', (req, res) => {
	const { shortcode } = req.params;
	const entry = US[shortcode];
	if (!entry) {
		return res.status(404).send('Code Not Found');
	}
	const now = new Date();
	if (new Date(entry.expiry) < now) {
		return res.status(410).send('Code Expired');
	}
	res.redirect(entry.url);
});

app.listen(port, () => console.log("Manian is running on port"));