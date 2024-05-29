const express = require("express");
const app = express();

// const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// const userRoutes = require('./routes/User');
// const blogRoutes = require('./routes/Blog');

const fragmentRoute = require('./routes/Fragment');


// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true,
}))


// MOUNTING ROUTES
// app.use('/api/v1', userRoutes);
// app.use('/api/v1', blogRoutes);

app.use('', fragmentRoute);


// CONNECT DATABASE
// database.connectdb();


// ACTIVATE SERVER
dotenv.config();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at port number ${PORT}.`)

})

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Server is running....'
	});
});
