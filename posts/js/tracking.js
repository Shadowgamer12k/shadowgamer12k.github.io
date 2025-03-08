document.querySelectorAll('.download-button').forEach(button => {
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // 1. احصل على بيانات البوست
    const postId = new URLSearchParams(window.location.search).get('id');
    const modName = document.querySelector('h1').innerText; // أو أي عنصر يحتوي على الاسم
    
    // 2. أرسل البيانات إلى دالة Netlify
    try {
      await fetch('/.netlify/functions/log-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId || 'unknown',
          modName: modName,
          pageUrl: window.location.href
        }),
      });
    } catch (error) {
      console.log('Error in tracking:', error);
    }
    
    // 3. تابع عملية التحميل
    window.location.href = button.href;
  });
});
