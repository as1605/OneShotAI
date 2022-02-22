const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);

const { faker } = require('@faker-js/faker');

const College = mongoose.model('College', { 
    name: String,
    year: Number,
    city: String,
    state: String,
    country: String,
    no_of_students: Number,
    courses: [String]
});

const Student = mongoose.model('Student', { 
    name: String,
    year: Number,
    college_id: String,
    skills: [String]
});


app.get('/', (req, res) => {
    res.json({"endpoints":{
        "/college/all" : "returns list of all colleges",
        "/college/name/:name" : "finds college by name",
        "/college/id/:id" : "finds college by id",
        "/student/all": "lists all students",
        "/student/college/:id" : "list students for id",
        "/student/id/:id" : "find by id",
        "/faker?n={count}": "creates 'count' fake colleges with students"
    }});
});


app.get('/college/all', async (req, res) => {
    let colleges = await College.find({});
    res.json({colleges});
});

app.get('/college/name/:name', async (req, res) => {
    let college_name = req.params.name;
    let college = await College.find({name: college_name});
    res.json({college});
});

app.get('/college/id/:id', async (req, res) => {
    let college_id = req.params.id;
    let college = await College.find({id: college_id});
    res.json({college});
});


app.get('/student/all', async (req, res) => {
    let students = await Student.find({});
    res.json({students});
});

app.get('/student/college/:id', async (req, res) => {
    let id = req.params['id'];
    let students = await Student.find({college_id : id});
    res.json({students});
})

app.get('/student/id/:id', async (req, res) => {
    let id = req.params['id'];
    let student = await Student.findById(id);
    res.json({student});
})


app.get('/faker', async (req, res)  => {
    let n = req.query['n'];
    let fake_colleges = [];
    let fake_students = [];
    await College.deleteMany({});
    await Student.deleteMany({});

    for (let i=0; i<n; i++) {
        const name = "University of " + faker.address.cityName();
        const year = Math.floor(1820+200*Math.random());
        const city = faker.address.cityName();
        const state = faker.address.state();
        const country = faker.address.country();
        const no_of_students = Math.floor(100*Math.random());
        let courses = []
        for (let j = 0; j<20*Math.random(); j++) {
            courses.push("Bachelor of " + faker.commerce.product() + " Engineering");
        }
        let college = {
            name: name, 
            year: year, 
            city: city, 
            state: state, 
            country: country, 
            no_of_students: no_of_students, 
            courses:courses
        };
        fake_colleges.push(college);
    }
    await College.insertMany(fake_colleges);
    newList = await College.find({});

    newList.forEach(college => {
        let count = college.no_of_students;
        for (let i = 0; i < count; i++) {
            const name = faker.name.findName();
            const year = Math.floor(2010 + Math.random()*10);
            let skills = [];
            for (let j = 0; j < Math.random()*10; j++) {
                skills.push(faker.company.bsNoun());
            }
            let student = {
                name: name,
                year: year,
                skills: skills,
                college_id: college.id
            }
            fake_students.push(student);
        }
    })
    await Student.insertMany(fake_students);

    res.json(newList);
});

app.listen(port);
