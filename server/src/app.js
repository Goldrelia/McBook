const path = require('path');

// Add after your API routes
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
});