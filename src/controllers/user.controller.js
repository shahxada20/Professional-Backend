import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // return res.status(200).json({
    //     message: "OK"
    // })

    /* 
    1. get user details from frontend
    2. validation + non empty
    3. check if user already exists: email username
    4. check for images, check for avtar
    5. upload to cloudinary, write check on multer and cloudinary
    6. create user object - create entry in database
    7. remove password and refresh token field from response
    8. check for user creation
    9. return response 
    */

    const { fullname, email, username, password } = req.body()
    console.log("email: ", email)

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields is required")
    }
    const existedUser = User.findOne({
        $or: [[username], {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email and username alrady exists.")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    // upload to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // check avatar 
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
     
    // creating user object
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    // return respone
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
})

export { registerUser }