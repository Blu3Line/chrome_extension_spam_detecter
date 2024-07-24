document.getElementById('checkSpam').addEventListener('click', function() {
    var emailContent = document.getElementById('emailContent').value;
    var result = document.getElementById('result');
    var loader = document.getElementById('loader');
    
    loader.style.display = 'block';  // Yükleme göstergesini göster
    result.textContent = '';
  
    fetch('http://localhost:5000/check_spam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: emailContent })
    })
    .then(response => response.json())
    .then(data => {
      loader.style.display = 'none';  // Yükleme göstergesini gizle
  
      if(data.is_spam) {
        result.innerHTML = '<span class="badge badge-danger">Bu bir spam e-postadır!</span>';
      } else {
        result.innerHTML = '<span class="badge badge-success">Bu bir spam e-posta değildir.</span>';
      }
    })
    .catch(error => {
      console.error('Hata:', error);
      loader.style.display = 'none';  // Yükleme göstergesini gizle
      result.innerHTML = '<span class="badge badge-warning">Bir hata oluştu.</span>';
    });
  });
  
  