/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const submitReview = async (review, rating) => {
  try {
    const slug = window.location.href.split('/')[4];

    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        slug
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review successfully submitted!');

      setTimeout(() => {
        window.location.reload();
        window.scroll({
          top: document.body.scrollHeight * 0.54,
          left: 0,
          behavior: 'smooth'
        });
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
