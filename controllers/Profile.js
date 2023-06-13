const { json } = require("express");
const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.updateProfile = async(req,res) => {
    try{
        // fetch the data and User Id
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        const id = req.user.id;
        // validation
        if(!contactNumber || !gender){
            return res.status(200).json({
                success:false,
                message:"All fields are mandatory",
            });
        }
        // find the profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);
        // profile ko update kro 

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();
        // return response
        return res.status(200).json({
            success:true,
            message:"Profile updated Successfully",
            profileDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error occured while updating the profile, please try again",
            error:error.message,
        });
    }
}

// delete profile
// TODO : find more about job schedulers
// const job = schedule.scheduleJob("10 * * * * *", function () {
// 	console.log("The answer to life, the universe, and everything!");
// });
exports.deleteAccount = async(req,res) => {
    try{
        // fetch the User account Id
        const id = req.user.id;
        // validate the data
        const userDetails = await User.findById({_id:id});
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User not found",
            });
        }
        // delete from the profile schema

        await Profile.findByIdAndDelete({_id : userDetails.additionalDetails});
        // TODO : HW unroll user from all enrolled courses

        // const courseId = await Course.find({_id : id});
        // if(!courseId){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Student has not enrolled in any course"
        //     });
        // }

        // // delete the student from all enrolled courses
        // const getCourse = await Course.find({_id : courseId});
        // if(!getCourse){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Couldn't fetch any course related to student",
        //     });
        // }

        // await Course.findByIdAndDelete({studentEnrolled : id});
        // delete from the User schema
        await User.findByIdAndDelete({_id : id});
        // return response


        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error occured while deleting the profile, please try again",
            error:error.message,
        });
    }
}

exports.getAllUserDetails = async(req,res) => {
    try{
        const id = req.user.id;

        if(!id){
            return res.status(400).json({
                success:false,
                message:"Please enter proper user id",
            });
        }

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"User details fetched properly",
            userDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Unable to fetch User's details",
        });
    }
}

exports.updateDisplayPicture = async(req,res) => {
    try{
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        console.log(image);
        const updatedProfile = await User.findByIdAndUpdate(
            {_id : userId},
            {image : image.secure_url},
            {new:true},
        )
        res.status(200).json({
            success:true,
            message:"Display picture updated",
            data:updatedProfile,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getEnrolledCourses = async(req,res) =>{
    try{
        const userId = req.user.id;
        const userDetails = await User.findOne({
            _id : userId,
        })
        .populate("Courses")
        .exec();

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find user with id : ${userDetails}`,
            });
        }

        return res.status(200).json({
            success:true,
            data : userDetails.course,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}