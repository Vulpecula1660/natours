/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, forgotPassword, resetPassword } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { submitReview } from './submitReview';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const showReviewBtn = document.querySelector('.btn--show-review');
const reviewStars = document.querySelector('.reviews__rating-review');
const reviewSubmitBtn = document.querySelector('.btn--submit-review');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signupForm)
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm, passwordConfirm);
  });

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--forgot-password').textContent =
      'Sending email...';
    const email = document.getElementById('email').value;

    await forgotPassword(email);
    document.querySelector('.btn--forgot-password').textContent = 'Submit';
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--reset-password').textContent =
      'Validating...';

    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const resetToken = window.location.href.split('/')[4];

    await resetPassword(resetToken, password, passwordConfirm);
    document.querySelector('.btn--reset-password').textContent = 'Submit';
  });
}

const addListenerToSubmitReview = () => {
  reviewSubmitBtn.addEventListener('click', e => {
    e.preventDefault();
    const reviewText = document.querySelector('.review__form-text').value;
    const reviewRating = stars.filter(star =>
      star.classList.contains('reviews__star--active')
    );

    if (!reviewText || reviewRating.length === 0)
      return showAlert('error', 'Please provide a review and a rating!');

    submitReview(reviewText, reviewRating.length);
  });
};

if (showReviewBtn) {
  showReviewBtn.addEventListener('click', e => {
    e.preventDefault();
    addListenerToSubmitReview();

    const reviewForm = document.querySelector('.review__form');
    if (reviewForm.style.visibility !== 'visible') {
      // show review form and scroll to it
      reviewForm.style.visibility = 'visible';
      reviewForm.style.height = '40rem';
      reviewForm.style.margin = '2rem auto';
      reviewForm.style.padding = '7rem 0';

      window.scroll({
        top: document.body.scrollHeight * 0.72,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      // scroll to review form
      window.scroll({
        top: document.body.scrollHeight * 0.65,
        left: 0,
        behavior: 'smooth'
      });
    }
  });
}

const stars = Array.from(document.querySelectorAll('.reviews__star--big'));
if (reviewStars) {
  reviewStars.addEventListener('click', e => {
    const clicked = stars.indexOf(e.target);

    if (clicked >= 0) {
      stars.forEach((star, i) => {
        star.classList =
          i > clicked
            ? 'reviews__star--big reviews__star--inactive'
            : 'reviews__star--big reviews__star--active';
      });
    }
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

const inputForm = document.querySelector('.form__upload');

if (inputForm) {
  inputForm.addEventListener('change', () => {
    const file = document.getElementById('photo').files[0];
    const reader = new FileReader();

    reader.onload = e => {
      document.querySelector('.form__user-photo').src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
