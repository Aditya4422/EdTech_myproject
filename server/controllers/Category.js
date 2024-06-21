const Category = require('../models/Category');
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

// we have to write the handeler function in controller for the admin to create Category
// 1. createCategory handler function
// 2. showAllCategorys handler function

exports.createCategory = async (req, res) => {
    try{
        // fetch all data
        const {name, description} = req.body;

        // validate all the data
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const isCategory = await Category.findOne({name: name});
        if(isCategory){
            return res.status(400).json({
                success: false,
                message: 'The Category is already avaliable',
            });
        }
    
        // create the Category entry in database
        const CategoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(CategoryDetails);
        // return the response
        return res.status(200).json({
            success: true,
            message: 'The Category is created successfully',
        });
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            messaage: 'Something wrong happened in creating the Category, please try again later',
        });
    }
}

exports.showAllCategories = async (req, res) => {
    try{
        // fetch all the data but on some condition that all those Categorys must have some name and description4
        const allCategories = await Category.find({},{name: true, description: true});
        return res.status(200).json({
            success: true,
            message: 'These all the the Categorys',
            data: allCategories,
        });
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            messaage: 'Something wrong happened in fetching all the Categorys, please try again later',
        });
    }
}


exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
			.populate({
                path:"courses",
                match: {status: "Published"},
                populate: "ratingAndReviews",
            })
			.exec();
		console.log(selectedCategory);
		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res.status(404)
				.json({ success: false, message: "Category not found" });
		}

		// Handle the case when there are no courses
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// Get courses for other categories
		// Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
          })
          let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
            .populate({
              path: "courses",
              match: { status: "Published" },
            })
            .exec()
            //console.log("Different COURSE", differentCategory)
          // Get top-selling courses across all categories
          const allCategories = await Category.find()
            .populate({
              path: "courses",
              match: { status: "Published" },
              populate: {
                path: "instructor",
            },
            })
            .exec()
          const allCourses = allCategories.flatMap((category) => category.courses)
          const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
           // console.log("mostSellingCourses COURSE", mostSellingCourses)
          res.status(200).json({
            success: true,
            data: {
              selectedCourses,
              selectedCategory,
              differentCategory,
              mostSellingCourses,
            },
          })
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};