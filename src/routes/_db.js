if(process.env.NODE_ENV === "production"){
    module.exports ={
        //connection to cloud mongodb server 
        mongoURI:process.env.MONGODB_URI
    }
}
else{
    module.exports ={
        mongoURI:"mongodb://localhost:27017/gamelibrary"
    }
}