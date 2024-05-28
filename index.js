require("dotenv").config()
const session=require('express-session');
const nodemailer=require("nodemailer");
var express=require("express")
var mongoose=require("mongoose")
const {v4:uuidv4}=require('uuid');
var path=require('path')
var hbs=require("express-handlebars")
const MongoStore=require('connect-mongo');

var place;// to store the selected place from drop-menu
var sight_seeing;//to store the prefered sightseeing option
var selected=[];// to store the places selected by the user
var sight=[];//to store the prefered sight-seeing option selected by the user
var mainselected=[];// to store only the main places selected by the user
var mainplace=["SHIMLA","SOLANG VALLEY / SOLANG NULLAH","SANGLA / CHITKUL","SARAHAN","CHAIL","CHANDRATAL","MANDI","MANALI","MANIKARAN","KULLU","KASOL","KHAJIAR","KEYLONG","KAZA","DALHOUSIE","DHARAMSALA / McLEODGANG","JOGINDER NAGAR","BHAWARNA","NARKANDA","RECONG PEO / KALPA","NAKO","TABO"];
const app=express()

app.use(express.static(path.join(__dirname,'/public')));
const port=process.env.PORT || 3000;

//view engine setup
app.engine('hbs',hbs.engine({extname: 'hbs', defaultLayout: false, runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
},layoutsDir:"/views/"}))
app.set('views','./views');
app.set('view engine','hbs');

app.use(express.urlencoded({
    extended:false
}))


//session
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:24*60*60*1000
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
}))

//connecting the database
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("connected to database");
}).catch(()=>{
    console.log("error in connecting to database");
});


//model for users
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        age:{
            type:Number,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        confirm_password:{
            type:String,
            required:true
        },
        
        otp:{
            type:Number
        },
        correct_otp:{
            type:Boolean
        },
        places:{
            type:Array,
            default:[]
        },
        sight:{
            type:Array,
            default:[]
        }
    }
);

const Reader=new mongoose.model("user",userSchema);


//model for recommendation
const recomschema=new mongoose.Schema(
    {
        Place:{
            type:String,
            required:true
        },
        All_Sight_Seeing:{
            type:String,
            required:true
        },
        Recommended_Sight_Seeing:{
            type:String,
            required:true
        },
        All_places_1:{
            type: Array,
            default:[]
        },
        All_places_2:{
            type: Array,
            default:[]
        },
        All_places_3:{
            type: Array,
            default:[]
        },
        All_places_4:{
            type: Array,
            default:[]
        },
        Recommended_places_1:{
            type: Array,
            default:[]
        },
        Recommended_places_2:{
            type:Array,
            default:[]
        },
        Recommended_places_3:{
            type: Array,
            default:[]
        },
        Recommended_places_4:{
            type: Array,
            default:[]
        },
        
    }
);

const Recommendation=new mongoose.model("recom",recomschema);

app.post("/add",async(req,res)=>{
    place=req.body.dest;// to get value from the input field/dropdown menu
    if(place=='SELECT A DESTINATION') // if the user doesn't select a destination
    {
        res.render('home',{
            info1: 'Please select a destination'
        })
    }
   else if(place!='SELECT A DESTINATION') // if the user selects a destination
   {
    
    //console.log(Desti.Place)
    /*res.render('home',{
        dest:Desti.Place
    });*/
     
     //if the chosen place has already been selected previously
     if(selected.includes(place))
     {
        

     res.render('home2',{
     chosen:place +' has already been added to your list'
    
    })
}

    //if selected place is bhawarna(offbeat place)
    else if(place=='BHAWARNA')
    res.render('extraqueryform',{
       info:'BHAWARNA is an offbeat place. Please send your details to get detail information'
    });

    
    //if selected place is manikaran but neither kullu nor kasol has been selected
    else if(place=='MANIKARAN' && (!selected.includes('KULLU') && (!selected.includes('KASOL'))))
    res.render('home',{
        info2: 'Select KULLU or KASOL to visit ' + place 
       })

    
     //if selected place is manikaran but  kullu has been selected but not kasol
     else if(place=='MANIKARAN' && selected.includes('KULLU') && (!selected.includes('KASOL')))
     res.render('sightseeing_confirm',{
        info1: place,
        info2: place + ' will be visited during sight-seeing from KULLU'
       })


    //if selected place is manikaran but  kasol has been selected but not kullu
    else if(place=='MANIKARAN' && selected.includes('KASOL') && (!selected.includes('KULLU')))
    res.render('sightseeing_confirm',{
       info1: place,
       info2: place + ' will be visited during sight-seeing from KASOL'
      })   
    


    //if the selected place is TASHI JONG MONASTERY or SAURAV VAN VIHAR or PALAMPUR TEA GARDEN or NEUGAL KHAD or POTTERY, ANDRETTA or BAIJNATH and palampur is not added yet
    else if((place=='TASHI JONG MONASTERY' || place=='SAURAV VAN VIHAR' || place=='PALAMPUR TEA GARDEN' || place=='NEUGAL KHAD' || place=='POTTERY, ANDRETTA' || place=='BAIJNATH') && (!selected.includes('PALAMPUR')))
    res.render('home',{
        info2: 'Select PALAMPUR to visit ' + place 
       })

    //if the selected place is TASHI JONG MONASTERY or SAURAV VAN VIHAR or PALAMPUR TEA GARDEN or NEUGAL KHAD or POTTERY, ANDRETTA or BAIJNATH and palampur is already added
    else if((place=='TASHI JONG MONASTERY' || place=='SAURAV VAN VIHAR' || place=='PALAMPUR TEA GARDEN' || place=='NEUGAL KHAD' || place=='POTTERY, ANDRETTA' || place=='BAIJNATH') && (selected.includes('PALAMPUR')))
    res.render('sightseeing_confirm',{
        info1: place,
        info2: place + ' will be visited during sight-seeing from DHARAMSALA / McLEODGANG'
       })


      //if selected place is kalatop
      else if(place=='KALATOP')
      res.render('kalatop',{
        dest:place
    });

    //if the selected place is Joginder Nagar
    else if(place=='JOGINDER NAGAR' )
    {
        
        res.render('confirm',{
            dest: 'JOGINDER NAGAR',
            opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
            sight: '1'
        })
    }
    


    //if the selected place is sarahan
    else if(place=='SARAHAN' )
    {
        
        res.render('confirm',{
            dest: 'SARAHAN',
            opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
            sight: '1'
        })
    }
    
     //if tabo is selected before selecting kullu
     else if(place=='TABO' && (!selected.includes('KAZA')))
     res.render('home',{
        info2: 'Select KAZA to visit ' + place 
       })

    //if the selected place is tabo after selecting kaza and sangla/recong peo
    else if(place=='TABO' && selected.includes('KAZA') && (selected.includes('SANGLA / CHITKUL') || selected.includes('RECONG PEO / KALPA') ))
    {
        
        res.render('confirm',{
            dest: 'TABO',
            opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
            sight: '1'
        })
    }


    //if the selected place is nako
    else if(place=='NAKO' )
    {
        
        res.render('confirm',{
            dest: 'NAKO',
            opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
            sight: '1'
        })
    } 

  

    
    //if the selected place is khajiar and Dalhousie has been already selected
    else if(place=='KHAJIAR' && mainselected.includes('DALHOUSIE'))
    {
        res.render('khajimani',{
            msg:place+' will be visited during sight-seeing from DALHOUSIE',
            dest:place
        })
    }

    //if the selected place is khajiar and Dalhousie has not been selected yet
    else if(place=='KHAJIAR' && (!mainselected.includes('DALHOUSIE')))
    res.render('khajiar',{ 
      dest:place

    })

    //if kullu is selected before selecting kasol
    else if(place=='KULLU' && (!mainselected.includes('KASOL')))
    res.render('kullu',{
       dest:place
    })


    //if kullu is selected after selecting kasol
    else if(place=='KULLU' && mainselected.includes('KASOL'))
    res.render('kulluaftrkasol',{
        msg:place+' will be visited during sight-seeing from KASOL',
        dest:place
    })

    //if kasol is selected before selecting kullu
    else if(place=='KASOL' && (!mainselected.includes('KULLU')))
    res.render('kasol',{
        dest:place
     })



    //if kasol is selected after selecting kullu
    else if(place=='KASOL' && mainselected.includes('KULLU'))
    res.render('kasolaftrkullu',{
        msg:place+' will be visited during sight-seeing from KULLU',
        dest:place
    })




    //if the selected place is a main place 
        else if(place=='SHIMLA' || place=='SANGLA / CHITKUL' || place=='CHAIL' || place=='CHANDRATAL' || place=='MANDI' || place=='MANALI' || place=='MANIKARAN' || place=='KULLU' || place=='KASOL' || place=='KHAJIAR' || place=='KEYLONG'
        || place=='KAZA' || place=='DALHOUSIE' || place=='DHARAMSALA / McLEODGANG' || place=='PALAMPUR' || place=='BHAWARNA' || place=='NARKANDA' || place=='RECONG PEO / KALPA' || place=='NAKO')
        {
            const Desti=await Recommendation.findOne({Place:place});
            /*selected.push(Desti.Place); // add the selected place to this array
            mainselected.push(Desti.Place); // add the selected place to this array as the place selected is a main place
            let text=selected.toString();
            console.log(text);
            /*selected.splice(0,selected.length);
            console.log(selected.length);*/
            /*for(var i=0;i<selected.length;i++)
            console.log(selected);*/
            return res.render('sightseeing',{
                dest: Desti.Place
            })
        }
        //if the selected place is not a main place and falls under sight-seeing
        else if(place!='SHIMLA' || place!='SANGLA / CHITKUL' || place!='SARAHAN' || place!='CHAIL' || place!='CHANDRATAL' || place!='MANDI' || place!='MANALI' || place!='MANIKARAN' || place!='KULLU' || place!='KASOL' || place!='KALATOP' || place!='KHAJIAR' || place!='KEYLONG'
        || place!='KAZA' || place!='DALHOUSIE' || place!='DHARAMSALA / McLEODGANG' || place!='JOGINDER NAGAR' || place!='PALAMPUR' || place!='BHAWARNA' || place!='NARKANDA' || place!='RECONG PEO / KALPA' || place!='NAKO' || place!='TABO')
        {   //as chail palace can be covered from both places
            if(place=='CHAIL PALACE' && !selected.includes('SHIMLA') && !selected.includes('CHAIL'))
            return res.render('home',{
               info2:'Select CHAIL/SHIMLA to visit CHAIL PALACE'
            });
            //on the way
            else if(place=='PANDOH DAM' && selected.includes('SHIMLA') && selected.includes('MANALI'))
            return res.render('home',{
             info2:'PANDOH DAM will be covered on the way from Shimla to Manali or Manali to Shimla.'
            })
            //on the way
            else if(place=='SUNDAR NAGAR' && selected.includes('SHIMLA') && selected.includes('MANALI'))
            return res.render('home',{
             info2:'SUNDAR NAGAR will be covered on the way from Shimla to Manali or Manali to Shimla.'
            })
            //on th way
            else if(place=='KUNZAM PASS' && selected.includes('MANALI') && selected.includes('KAZA'))
            return res.render('home',{
             info2:'KUNZAM PASS will be covered on the way from MANALI to KAZA.'
            })
            //on the way
            else if(place=='KUNZAM PASS' && selected.includes('CHANDRATAL') && selected.includes('KAZA'))
            return res.render('home',{
             info2:'KUNZAM PASS will be covered on the way from KAZA to CHANDRATAL.'
            })
            //on the way
            else if(place=='BATAL' && selected.includes('MANALI') && selected.includes('KAZA'))
            return res.render('home',{
             info2:'KUNZAM PASS will be covered on the way from KAZA to Manali.'
            })
            else{

            
           for(let i=0;i<mainplace.length;i++)// loop to find the main place from where the selected place will be visited
           {
            const Exi=await Recommendation.findOne({Place:mainplace[i]});
            if(Exi!=null)
            {
                // if the ith main place has the selected place as its sight-seeing but the main place has not been selected yet
            if((Exi.Recommended_places_1.includes(place) ||Exi.Recommended_places_2.includes(place) ||Exi.Recommended_places_3.includes(place) ||Exi.Recommended_places_4.includes(place) || Exi.All_places_1.includes(place) || Exi.All_places_2.includes(place) || Exi.All_places_3.includes(place) || Exi.All_places_4.includes(place)) && (!selected.includes(Exi.Place)))
            {
               
                 return res.render('home',{
                    info2: 'Select '+ Exi.Place + " to visit " + place 
                   })
            }
             
            // if the ith main place has the selecteded place as its sight-seeing and the main place has also been selected
            else if((Exi.Recommended_places_1.includes(place) ||Exi.Recommended_places_2.includes(place) ||Exi.Recommended_places_3.includes(place) ||Exi.Recommended_places_4.includes(place) || Exi.All_places_1.includes(place) || Exi.All_places_2.includes(place) || Exi.All_places_3.includes(place) || Exi.All_places_4.includes(place)) && (selected.includes(Exi.Place)))
            {
                
                return res.render('sightseeing_confirm',{
                    info1: place,
                    info2: place + ' will be covered during sight-seeing from ' + Exi.Place 
                   })
            }
                
            
            
        }
           }
        }
        }
    
   }
       
    
})



app.post("/sight",async(req,res)=>{
    sight_seeing=req.body.sight_seeing;// to store the prefered sight-seeing option from the drop-down menu
    if(sight_seeing=='Select') //if the user doesn't select a sight-seeing
    res.render('sightseeing',{
      info1: 'No choice made. Please select'
    })
    //if the user selects an option
    else{

    //if no sight-seeing is selected for any place
      if(sight_seeing=='No Sightseeing')
      {
        res.render('confirm',{
            dest:place,
            opt: 'No Sightseeing',
            sight:'1'
        })
      }

    const Desti=await Recommendation.findOne({Place:place}); // finds the corresponding selected place in the database

    //if place selected is mandi and no sight-seeing is chosen
    if(place=='MANDI' && sight_seeing=='No Sight-Seeing' && mainselected.includes('SHIMLA') && mainselected.includes('MANALI'))
    res.render(sightseeing_confirm,{
info1: Desti.Place,
note: 'MANDI will be covered on th way from SHIMLA to MANALI and vice versa'
    })
    if(sight_seeing=='All Sightseeing') // if user selects all sight-seeing for the selected place
    {
        //console.log(Desti.All_Sight_Seeing);
        sight.push("All Sightseeing"); // add the option to this array
        res.render('confirm',{
            dest:Desti.Place,
            opt: 'All',
            sight:Desti.All_Sight_Seeing
        })
    }
    else if (sight_seeing=='Recommended Sightseeing')// if the user selects recommended sight-seeing for the selected place
    {
        sight.push("Recommended Sightseeing");
        res.render('confirm',{
            dest:Desti.Place,
            opt: 'Recommended',
            sight:Desti.Recommended_Sight_Seeing
        })
    }
}
})


app.post("/kalatop",(req,res)=>{
    const sel=req.body.kala;

    //if none of the options is selected
    if(sel!='0' && sel!='1')
    res.render('kalatop',{
         info:'Please select your prefered option'
    })

    //if first option is selected and dalhousie has not been added yet
    if(sel=='0' && (!mainselected.includes('DALHOUSIE')))
    res.render('home',{
     info2:'Add DALHOUSIE to visit KALATOP'
    })

    //if first option is selected and dalhousie has been already selected
    else if(sel=='0' && mainselected.includes('DALHOUSIE'))
    res.render('sightseeing_confirm',{
       info1:'KALATOP',
       info2:'KALATOP will be visited during sight-seeing from DALHOUSIE'
    })

    //if the second option is selected
    else if(sel=='1')
    res.render('extraqueryform');
})


//if khajiar is selected after selecting dalhousie
app.post("/khajimani",(req,res)=>{
    const yn=req.body.optradio;
    if(yn!='yes' && yn!='no')//if user doesn't select an option
    res.render('khajimani',{
       note: 'Please provide your choice'
    })
    else if(yn=='yes') //if user wants to stay at khajiar
    res.render('confirm',{
        dest: place,
        opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
        sight: '1'
    })
    else if(yn=='no')// if user doesn't want to stay at khajiar
    res.render('sightseeing_confirm',{
        info1: place,
        info2: place + ' will be visited during sight-seeing from DALHOUSIE'
})
})



//if kullu is selected after selecting kasol
app.post("/kulluaftrkasol",(req,res)=>{
    const yn=req.body.optradio;
    if(yn!='yes' && yn!='no')//if user doesn't select an option
    res.render('kulluaftrkasol',{
       note: 'Please provide your choice'
    })
    else if(yn=='yes') //if user wants to stay at kullu
    res.render('sightseeing',{
        dest: place
    })
    else if(yn=='no')// if user doesn't want to stay at kullu
    res.render('sightseeing_confirm',{
        info1: place,
        info2: place + ' will be visited during sight-seeing from KASOL'
})
})




//if kasol is selected after selecting kullu
app.post("/kasolaftrkullu",(req,res)=>{
    const yn=req.body.optradio;
    if(yn!='yes' && yn!='no')//if user doesn't select an option
    res.render('kasolaftrkullu',{
       note: 'Please provide your choice'
    })
    else if(yn=='yes') //if user wants to stay at kullu
    res.render('sightseeing',{
        dest: place
    })
    else if(yn=='no')// if user doesn't want to stay at kullu
    res.render('sightseeing_confirm',{
        info1: place,
        info2: place + ' will be visited during sight-seeing from KULLU'
})
})


//if khajiar is selected before dalhousie
app.post("/khajiar",(req,res)=>{
    const choice=req.body.optradio;
    if(choice!='add_dal' && choice!='yes' && choice!='no')//if user doesn't select any option
    res.render('khajiar',{
         note:'Please provide your choice'
    })
    else if(choice=='add_dal')
    res.render('home',{
info2:'Add DALHOUSIE to visit KHAJIAR'
})
else if(choice=='yes')// if user wants to stay at Khajiar without selecting dalhousie first
res.render('confirm',{
    dest: place,
    opt: 'No recommended sight-seeing, just stay for rest and enjoy nature.',
    sight: '1'
})
else if(choice=='no')
res.render('home',{
    info2:'Add DALHOUSIE to visit KHAJIAR'
    })
})

//if the user selects kullu before selecting kasol
app.post("/kullu",(req,res)=>{
    const choice=req.body.optradio;
    if(choice!='add_dal' && choice!='yes' && choice!='no')//if user doesn't select any option
    res.render('kullu',{
         note:'Please provide your choice'
    })
    else if(choice=='add_dal')
    res.render('home',{
info2:'Add KASOL to visit KULLU'
})
else if(choice=='yes')// if user wants to stay at kullu without selecting kasol first
res.render('sightseeing',{
    dest: place
})
else if(choice=='no')
res.render('home',{
    info2:'Add KASOL to visit KULLU'
    })
})



//if the user selects kasol before selecting kullu
app.post("/kasol",(req,res)=>{
    const choice=req.body.optradio;
    if(choice!='add_dal' && choice!='yes' && choice!='no')//if user doesn't select any option
    res.render('kasol',{
         note:'Please provide your choice'
    })
    else if(choice=='add_dal')
    res.render('home',{
info2:'Add KULLU to visit KASOL'
})
else if(choice=='yes')// if user wants to stay at kasol without selecting kullu first
res.render('sightseeing',{
    dest: place
})
else if(choice=='no')
res.render('home',{
    info2:'Add KULLU to visit KASOL'
    })
})












//registration
app.post("/register",async(req,res)=>{
    
    const appuser=new Reader({
        name:req.body.name,
        email:req.body.email,
        age:req.body.age,
        phone:req.body.phone,
        password:req.body.password,
        confirm_password:req.body.conpassword,
        otp:0,
        correct_otp:false
    });
    const readeremail=await Reader.findOne({email:req.body.email});
if(readeremail!=null)
    {
     console.log("This email already exists.Please use another email.");
     return res.render('quotereader_regis',{
        info:'This email already exists. Please use another email.'
     })
    }
    
   else if(req.body.password!==req.body.conpassword)
    {
     console.log("Passwords not matching..");
     return res.render('quotereader_regis',{
        info:'Passwords not matching.'
     })
    }
    else if(req.body.age<18)
    {
     return res.render('quotereader_regis',{
        info:'Age must be 18 years or above'
     })
    }
    
    else{
       
    appuser.save();
 const useremail=await Reader.findOne({email:req.body.email});
 req.session.user=req.body.email;
 req.session.save();
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        port:465,
        host:'smtp.gmail.com'
    });
    let x = Math.floor(Math.random()*(9999-1000+1)+1000);
    let t="Hey "+req.body.name+",welcome to Bharat TripXpert. "+x+" is the OTP for your email verification.";
    let mailDetails = {
        from: '"Bharat TripXpert" <chirpymauve17@gmail.com>',
        to: req.body.email,
        subject: 'OTP for email verification',
        text: t
    };
     
    mailTransporter.sendMail(mailDetails, function(err) {
        if(err) {
            console.log('Error Occurs');
            
        } else {
            console.log('Email sent successfully');
        }
    });
   //console.log(useremail.email);
    const item = await Reader.updateOne({ email: req.body.email }, {otp:x })
    //console.log(item);
    res.render('otp');
}
    
})


//login
app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        //console.log(`${email} and password is ${password}`);
        const useremail=await Reader.findOne({email:email});
        //res.send(useremail.Password)
        //console.log(useremail);
        if(useremail.password===password && useremail.email===email && useremail.otp!=0 && useremail.correct_otp==true)
        {
            req.session.data=req.body.email;
            req.session.save();
            for(var i=0;i<useremail.places.length;i++)//to remove the previously selected places (previous session)
            {
                await useremail.updateOne({ $pull: {places:useremail.places[i]}}); 
                await useremail.updateOne({ $pull: {sight:useremail.sight[i]}}); 
            }
            for(var i=0;i<useremail.sight.length;i++)//to remove the previously selected sightseeing options (previous session)
            {
                await useremail.updateOne({ $pull: {sight:useremail.sight[i]}}); 
            }
        res.render('page2')
    }
        else res.send("Invalid Login Details");
        }catch(error)
    {
        console.log(error);
        res.status(400).send("Invalid Login Details");
    }
})


//otp during registration
app.post("/passotp",async(req,res)=>{
    try{
        const otp=req.body.otp;
    
        
            const useremail=await Reader.findOne({email:req.session.user});
            //console.log(userem);
            if(useremail.otp==0 || useremail.otp!=otp)
            {
                Reader.deleteOne({ email:req.session.user }).then(function(){
                    console.log("Data deleted"); // Success
            
                    res.render('quotereader_regis',{
                        info:'Incorrect OTP. Please try again.',
                        
                    })
                }).catch(function(error){
                    console.log(error); // Failure
                });
            

        }
            else if(useremail.otp==req.body.otp)
            {
                await Reader.updateOne({ otp:otp }, {correct_otp:true })
            res.render('quotereader_login',{
                regissucc:'Registered Successfully'
            });
        }
            
    
    }catch(error)
    {
        console.log(error);
    }
})


app.post("/confirm",async(req,res)=>{//if the user confirms his selected destination to get added to the list of his choices
    
    if(place=='SHIMLA' || place=='SANGLA / CHITKUL' || place=='CHAIL' || place=='CHANDRATAL' || place=='MANDI' || place=='MANALI' || place=='KULLU' || place=='KASOL' || place=='KEYLONG'
    || place=='KAZA' || place=='DALHOUSIE' || place=='DHARAMSALA / McLEODGANG'  || place=='NARKANDA' || place=='RECONG PEO / KALPA') 
    {
        mainselected.push(place);
        const Exi=await Recommendation.findOne({Place:place});
    const stay=req.body.night_stay;
    //night stay warning
     if(stay=='Select Night Stay')
     return res.render('confirm',{
        info:'Please select night stay' ,
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    //SHIMLA
    else if(Exi.Place=='SHIMLA' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.' ,
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='SHIMLA' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing
    })
     

    //CHAIL
    else if(Exi.Place=='CHAIL' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='CHAIL' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing
    })


    //MANDI
    else if(Exi.Place=='MANDI' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='MANDI' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //KULLU
    else if(Exi.Place=='KULLU' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='KULLU' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing
    })

    //KASOL
    else if(Exi.Place=='KASOL' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='KASOL' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //MANALI
    else if(Exi.Place=='MANALI' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='MANALI' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //DALHOUSIE
    else if(Exi.Place=='DALHOUSIE' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='DALHOUSIE' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

//DHARAMSALA / McLEODGANG
else if(Exi.Place=='DHARAMSALA / McLEODGANG' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='DHARAMSALA / McLEODGANG' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })


    //SANGLA / CHITKUL
    else if(Exi.Place=='SANGLA / CHITKUL' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='SANGLA / CHITKUL' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //NARKANDA
    else if(Exi.Place=='NARKANDA' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='NARKANDA' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

//RECONG PEO / KALPA
else if(Exi.Place=='RECONG PEO / KALPA' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing
    })
    else if(Exi.Place=='RECONG PEO / KALPA' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //KEYLONG
    else if(Exi.Place=='KEYLONG' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='KEYLONG' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })


    //KAZA
    else if(Exi.Place=='KAZA' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='KAZA' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    //CHANDRATAL
    else if(Exi.Place=='CHANDRATAL' && sight_seeing=='Recommended Sightseeing' && stay<Exi.Recommended_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.Recommended_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'Recommended Sightseeing',
        sight:Exi.Recommended_Sight_Seeing 
    })
    else if(Exi.Place=='CHANDRATAL' && sight_seeing=='All Sightseeing' && stay<Exi.All_Sight_Seeing)
    res.render('confirm',{
        info:'Minimum night stay required is '+Exi.All_Sight_Seeing+' according to your selections.',
        dest:Exi.Place,
        opt:'All Sightseeing',
        sight:Exi.All_Sight_Seeing 
    })

    }
     
     selected.push(place);
     const user=await Reader.findOne({email:req.session.data})
     

     //to store users selected sight seeing option in database for each main place
     //for shimla
     if(place=='SHIMLA' && sight_seeing=='No Sightseeing')
     {
        await user.updateOne({ $push: {places:'SHIMLA'}});
        await user.updateOne({ $push: {sight:'SSSHIHP1'}});
     }
     else if(place=='SHIMLA' && sight_seeing=='Recommended Sightseeing')
     {
        await user.updateOne({ $push: {places:'SHIMLA'}});
        await user.updateOne({ $push: {sight:'SSSHIHP2'}});
     }
     else if(place=='SHIMLA' && sight_seeing=='All Sightseeing')
     {
        await user.updateOne({ $push: {places:'SHIMLA'}});
        await user.updateOne({ $push: {sight:'SSSHIHP3'}});
     }


     //for chail
     else if(place=='CHAIL' && sight_seeing=='No Sightseeing')
     {
        await user.updateOne({ $push: {places:'CHAIL'}});
        await user.updateOne({ $push: {sight:'SSCHAHP4'}});
     }
    else if(place=='CHAIL' && sight_seeing=='Recommended Sightseeing')
     {
        await user.updateOne({ $push: {places:'CHAIL'}});
        await user.updateOne({ $push: {sight:'SSCHAHP5'}});
     }
    else if(place=='CHAIL' && sight_seeing=='All Sightseeing')
     {
        await user.updateOne({ $push: {places:'CHAIL'}});
        await user.updateOne({ $push: {sight:'SSCHAHP6'}});
     }


    //MANDI
    else if(place=='MANDI' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANDI'}});
       await user.updateOne({ $push: {sight:'SSMANHP7'}});
    }
    else if(place=='MANDI' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANDI'}});
       await user.updateOne({ $push: {sight:'SSMANHP8'}});
    }
    else if(place=='MANDI' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANDI'}});
       await user.updateOne({ $push: {sight:'SSMANHP9'}});
    }


    //KULLU
    else if(place=='KULLU' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'KULLU'}});
       await user.updateOne({ $push: {sight:'SSKULHP10'}});
    }
    else if(place=='KULLU' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'KULLU'}});
       await user.updateOne({ $push: {sight:'SSKULHP11'}});
    }
    else if(place=='KULLU' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'KULLU'}});
       await user.updateOne({ $push: {sight:'SSKULHP12'}});
    }
    
    
    //KASOL
    else if(place=='KASOL' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'KASOL'}});
       await user.updateOne({ $push: {sight:'SSKASHP13'}});
    }
    else if(place=='KASOL' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'KASOL'}});
       await user.updateOne({ $push: {sight:'SSKASHP14'}});
    }
    else if(place=='KASOL' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'KASOL'}});
       await user.updateOne({ $push: {sight:'SSKASHP15'}});
    }


    //MANALI
    else if(place=='MANALI' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANALI'}});
       await user.updateOne({ $push: {sight:'SSMANHP16'}});
    }
    else if(place=='MANALI' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANALI'}});
       await user.updateOne({ $push: {sight:'SSMANHP17'}});
    }
    else if(place=='MANALI' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'MANALI'}});
       await user.updateOne({ $push: {sight:'SSMANHP18'}});
    }


    //DALHOUSIE
    else if(place=='DALHOUSIE' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'DALHOUSIE'}});
       await user.updateOne({ $push: {sight:'SSMANHP19'}});
    }
    else if(place=='DALHOUSIE' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'DALHOUSIE'}});
       await user.updateOne({ $push: {sight:'SSMANHP20'}});
    }
    else if(place=='DALHOUSIE' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'DALHOUSIE'}});
       await user.updateOne({ $push: {sight:'SSMANHP21'}});
    }
    

    //DHARAMSALA / McLEODGANG
    else if(place=='DHARAMSALA / McLEODGANG' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'DHARAMSALA / McLEODGANG'}});
       await user.updateOne({ $push: {sight:'SSDHAHP22'}});
    }
    else if(place=='DHARAMSALA / McLEODGANG' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'DHARAMSALA / McLEODGANG'}});
       await user.updateOne({ $push: {sight:'SSDHAHP23'}});
    }
    else if(place=='DHARAMSALA / McLEODGANG' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'DHARAMSALA / McLEODGANG'}});
       await user.updateOne({ $push: {sight:'SSDHAHP24'}});
    }


    //SANGLA / CHITKUL
    else if(place=='SANGLA / CHITKUL' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'SANGLA / CHITKUL'}});
       await user.updateOne({ $push: {sight:'SSSANHP25'}});
    }
    else if(place=='SANGLA / CHITKUL' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'SANGLA / CHITKUL'}});
       await user.updateOne({ $push: {sight:'SSSANHP26'}});
    }
    else if(place=='SANGLA / CHITKUL' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'SANGLA / CHITKUL'}});
       await user.updateOne({ $push: {sight:'SSSANHP27'}});
    }

    
    //NARKANDA
    else if(place=='NARKANDA' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'NARKANDA'}});
       await user.updateOne({ $push: {sight:'SSNARHP28'}});
    }
    else if(place=='NARKANDA' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'NARKANDA'}});
       await user.updateOne({ $push: {sight:'SSNARHP29'}});
    }
    else if(place=='NARKANDA' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'NARKANDA'}});
       await user.updateOne({ $push: {sight:'SSNARHP30'}});
    }
    

    //RECONG PEO / KALPA
    else if(place=='RECONG PEO / KALPA' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'RECONG PEO / KALPA'}});
       await user.updateOne({ $push: {sight:'SSRECHP31'}});
    }
    else if(place=='RECONG PEO / KALPA' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'RECONG PEO / KALPA'}});
       await user.updateOne({ $push: {sight:'SSRECHP32'}});
    }
    else if(place=='RECONG PEO / KALPA' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'RECONG PEO / KALPA'}});
       await user.updateOne({ $push: {sight:'SSRECHP33'}});
    }


    //KEYLONG
    else if(place=='KEYLONG' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'KEYLONG'}});
       await user.updateOne({ $push: {sight:'SSKEYHP34'}});
    }
    else if(place=='KEYLONG' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'KEYLONG'}});
       await user.updateOne({ $push: {sight:'SSKEYHP35'}});
    }
    else if(place=='KEYLONG' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'KEYLONG'}});
       await user.updateOne({ $push: {sight:'SSKEYHP36'}});
    }
    

    //KAZA
    else if(place=='KAZA' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'KAZA'}});
       await user.updateOne({ $push: {sight:'SSKAZHP37'}});
    }
    else if(place=='KAZA' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'KAZA'}});
       await user.updateOne({ $push: {sight:'SSKAZHP38'}});
    }
    else if(place=='KAZA' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'KAZA'}});
       await user.updateOne({ $push: {sight:'SSKAZHP39'}});
    }


    //CHANDRATAL
    else if(place=='CHANDRATAL' && sight_seeing=='No Sightseeing')
    {
       await user.updateOne({ $push: {places:'CHANDRATAL'}});
       await user.updateOne({ $push: {sight:'SSCHAHP40'}});
    }
    else if(place=='CHANDRATAL' && sight_seeing=='Recommended Sightseeing')
    {
       await user.updateOne({ $push: {places:'CHANDRATAL'}});
       await user.updateOne({ $push: {sight:'SSCHAHP41'}});
    }
    else if(place=='CHANDRATAL' && sight_seeing=='All Sightseeing')
    {
       await user.updateOne({ $push: {places:'CHANDRATAL'}});
       await user.updateOne({ $push: {sight:'SSCHAHP42'}});
    }


     res.render('home2')
})



//registration page
app.get("/register",(req,res)=>{
    res.render('quotereader_regis');
})

//login page
app.get("/login",(req,res)=>{
    res.render('quotereader_login')

    
})

app.get("/logout",(req,res)=>{
    res.render('page1');
})

app.get("/predesign",(req,res)=>{
    res.render("predesigned");
})



app.get("/home",(req,res)=>{
    res.render('home');
})

app.get("/himachal",(req,res)=>{
    res.render('himachal');
})

app.get("/predesign",(req,res)=>{
    res.render('predesignHP');
})

app.get("/customized",(req,res)=>{
    res.render('home')
})

app.get("/delete",(req,res)=>{
    if(selected.length!=0)
    selected.splice(0,selected.length);
   if(sight.length!=0)
   sight.splice(0,sight.length);
   if(mainselected.length!=0)
   mainselected.splice(0,mainselected.length);
    res.render('home');
})

app.get("/selected",(req,res)=>{
    let text=selected.toString();
            console.log(text);
    res.render('home');
})


app.post("/generateiti",(req,res)=>{
    res.render('customized');
})

//
app.get("/predesign",(req,res)=>{
    res.render('predesigned');
})


app.get("/",(req,res)=>{
    // the elements in all the arrays get removed whenever a new tab is opened (home page) or the current tab is closed 
    if(selected.length!=0)
    selected.splice(0,selected.length);
   if(sight.length!=0)
   sight.splice(0,sight.length);
   if(mainselected.length!=0)
   mainselected.splice(0,mainselected.length);
     res.render('page1');
}).listen(port);

console.log(`Server running on ${port}`);