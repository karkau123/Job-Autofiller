document.getElementById('openForm').addEventListener('click', () => {
  chrome.tabs.create({ url: 'form.html' });
});
