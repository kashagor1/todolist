require('dotenv').config();

const express = require("express");
const bodyParser =  require("body-parser");
//const date =  require(__dirname+"/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const itemSchema = {
	name : String
}

const Item =  mongoose.model("Item",itemSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const df = [item1,item2,item3];


const listSchema =  {
	name: String,
	item: [itemSchema]
};

const List = mongoose.model("List",listSchema);



app.get("/",(req,res)=>{

	
		Item.find((err,result)=>{
		
		if(result.length===0){
		Item.insertMany(df,(err)=>{
			if(err){
				console.log(err);
			}else{
				//console.log("Successful");
			}
		});
		res.redirect("/");
		}else{
					res.render("list",{listTitle:"Today",newListItems: result}); // {value_to_be_repaced:replacing_value} 
		}
		});
});

/*Customer List*/

app.get("/:cURL",(req,res)=>{
	const customListName = _.capitalize(req.params.cURL);

	List.findOne({name:customListName},(err,result)=>{
		if(!err){
			if(!result){
				/*This is going to create a new list if none exits*/
					const newList =  new List({
							name: customListName,
							item: df
						});
					newList.save();
					res.redirect("/"+customListName);
			}else{
				/*Show an existing list*/
					res.render("list",{listTitle:customListName,newListItems: result.item}); // {value_to_be_repaced:replacing_value} 
			}
		}

	
		
	});
	

});


/*Posting an item to list*/

app.post("/",(req,res)=>{
	newPage =  req.body.list;
//	console.log(newPage);
	newTask = new Item({name : req.body.newtask});

		
	if(newPage === "Today"){
			newTask.save();
			res.redirect("/");
	}else{
		List.findOne({name:newPage},(err,result)=>{
			result.item.push(newTask);
			result.save();
		//	console.log(result);
			res.redirect("/"+newPage);
		})
	}


	
});




app.post("/delete",(req,res)=>{
	const id = req.body.checkedItem;
	const newPage =  req.body.listName;
	
	if(newPage === "Today"){
		Item.findByIdAndRemove(id,(err)=>{
		console.log(err);
		res.redirect("/");
	});
	}else{
		List.findOneAndUpdate({name:newPage},{$pull:{item:{_id:id}}},(err,result)=>{
			if(!err){
				res.redirect("/"+newPage);
			}
		});
	}
	
	
})



app.get("/about",(req,res)=>{
	res.render("about");
});


let port = process.env.PORT||3000;
app.listen(port,()=>{
	console.log("Server Started on Port"+port);
});