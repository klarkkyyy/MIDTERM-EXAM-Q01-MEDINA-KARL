import express, { Router } from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

const app = express();

const PORT = 5000;
const DATA_FILE = ('./data.json');

//gets data.json
function readData() {
    const file = fs.readFileSync(DATA_FILE);
    return JSON.parse(file);
}

//write and save into file
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

//parsing json data for readability
app.use(bodyParser.json());
app.use(express.static('public'));

//reads all data saved in .json
app.get('/api/deliveries', (req, res) => {
    const data = readData();
    res.json(data.data);
    console.log(`gana ni sya`);
})

//reads a specific data identifiable by id
app.get('/api/deliveries/:id', (req, res) => {
    const data = readData();
    const delivery = data.data.find(d => String(d.id) === req.params.id);

    if (!delivery) {
        return res.status(404).json({
            message: 'Delivery not found'
        });
    }

    res.json(delivery);
})


app.post('/api/deliveries', (req, res) => {
    const { tracking_number, customer_name, destination, delivery_date } = req.body;

    //user didn't input all fields
    if (!tracking_number || !customer_name || !destination || !delivery_date) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    const data = readData();

    //compares tracking number and logs if already exists
    const exists = data.data.find(d => d.tracking_number === tracking_number);
    if (exists) {
        return res.status(400).json({
            message: 'Tracking number already exists'
        });
    }

    let newId = 1;
    data.data.forEach(d => {
        if (Number(d.id) >= newId) {
            newId = Number(d.id) + 1;
        }
    });

    //registers a new delivery with status always pending
    const newDelivery = {
        id: String(newId),
        tracking_number: tracking_number,
        customer_name: customer_name,
        destination: destination,
        delivery_date: delivery_date,
        status: 'pending'
    };

    //saves new delivery into data
    data.data.push(newDelivery);
    saveData(data);

    res.status(201).json(newDelivery);
})

//delete a specific delivery via id
app.delete('/api/deliveries/:id', (req, res) => {
    const data = readData();
    const index = data.data.findIndex(d => d.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Delivery not found'
        });
    }

    const deleted = data.data.splice(index, 1);

    saveData(data);

    res.json({ 
        message: 'Delivery deleted', delivery: deleted[0]
    });
})
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
