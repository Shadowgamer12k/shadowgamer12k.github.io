// Tracking for ALL pages
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.download-button').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = new URLSearchParams(window.location.search).get('id');
      
      await fetch('/.netlify/functions/log-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId || 'unknown',
          page: document.title,
          referrer: document.referrer
        })
      });
    });
  });
});
