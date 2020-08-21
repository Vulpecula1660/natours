const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Reviews = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') res.locals.alert = 'Your booking was successful!';
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
    populate: {
      path: 'user'
    }
  });

  let reviewByUser = false;
  if (req.user) {
    tour.reviews.forEach(review => {
      if (review.user.id === req.user.id) {
        reviewByUser = review;
      }
    });
  }
  // load latest revies first
  const reviewsClone = tour.reviews.reverse();
  if (reviewByUser) {
    const i = reviewsClone.indexOf(reviewByUser);
    reviewsClone.splice(i, 1);
    reviewsClone.unshift(reviewByUser);
  }
  // now we build the template - in pug

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    reviews: reviewsClone,
    reviewByUser
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Reviews.find({ user: req.user.id }).populate(
    'tour',
    'name imageCover slug'
  );

  res.status(200).render('reviews', {
    title: 'My reviews',
    reviews
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getForgotPasswordForm = (req, res) => {
  res.render('forgotPassword', {
    title: 'Forgot your password?'
  });
};

exports.getResetPasswordForm = (req, res) => {
  res.render('resetPassword', {
    title: 'Reset your password'
  });
};
