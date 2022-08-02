const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id',async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({message:'The user with the given ID was not found.'})
    }
    res.status(200).send(user);

})

router.post('/',async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone:req.body.phone,
        isAdmin:req.body.apartment,
        zip:req.body.city,
        country:req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(404).send('the user cannot be registered !!')

    res.send(user);
})
router.put('/:id',async(req,res)=>{

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else{

        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: newPassword,
        phone:req.body.phone,
        isAdmin:req.body.apartment,
        zip:req.body.city,
        country:req.body.country,
        },
        { new: true}
    )
    if(!user)
    return res.status(404).send('the category cannot be created !!')

    res.send(user);
})
router.post('/login',async (req,res) =>{
    const user = await User.findOne({email:req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found ')
    }
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
const token = jwt.sign(
    {
    userId:user.id

},secret,{expiresIn : '1d'}
)

        res.status(200).send({user: user.email,token:token})
    }else{
        res.status(400).send('password is wrong');
    }
})


module.exports =router;